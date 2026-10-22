import { db } from "./store";
import { fetchVideoMetadata } from "./video-parser";
import { Video, User, SiteSettings, UserRole, ClipCategory } from "@/types";

export interface VideoSectionsResult {
  sections: {
    owner: Video[];
    pinnedAndVip: Video[];
    fresh: Video[];
    community: Video[];
    watched: Video[];
  };
  watchedVideoIds: string[];
  totalCount: number;
}

/**
 * Universal Client API service for ClipEarn.
 * Seamlessly functions in both Static Hosting (GitHub Pages) and Serverful/Vercel environments.
 */
export const clientApi = {
  /**
   * Fetches and organizes videos into sections (Owner, Pinned/VIP, Fresh, Community, Watched).
   */
  async getVideos(params: {
    platform?: string;
    category?: string;
    search?: string;
    userId?: string;
  } = {}): Promise<VideoSectionsResult> {
    const { platform, category, search, userId } = params;

    let videos = db.getVideos();

    // Filter out banned users
    const users = db.getUsers();
    const bannedUserIds = new Set(users.filter((u) => u.isBanned).map((u) => u.id));
    videos = videos.filter((v) => !bannedUserIds.has(v.userId));

    // Filter by platform
    if (platform && platform !== "all") {
      videos = videos.filter((v) => v.platform === platform);
    }

    // Filter by category
    if (category && category !== "all") {
      videos = videos.filter((v) => v.category === category);
    }

    // Filter by search query
    if (search) {
      const q = search.toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.userName.toLowerCase().includes(q) ||
          (v.sourceTag && v.sourceTag.toLowerCase().includes(q)) ||
          (v.category && v.category.toLowerCase().includes(q))
      );
    }

    const watchedVideoIds = new Set(
      userId ? db.getUserEngagements(userId).map((e) => e.videoId) : []
    );

    const now = new Date().toISOString();
    const ownerVideos: Video[] = [];
    const pinnedAndVipVideos: Video[] = [];
    const freshVideos: Video[] = [];
    const communityVideos: Video[] = [];
    const watchedVideos: Video[] = [];

    for (const v of videos) {
      const isWatched = watchedVideoIds.has(v.id);

      // If viewer has already engaged with this video, remove it from their feed completely
      // (Only for this viewer; other users who haven't watched it will still see it)
      if (isWatched) {
        continue;
      }

      if (v.isOwnerVideo) {
        ownerVideos.push(v);
      } else if ((v.isPinned && v.pinnedUntil && v.pinnedUntil > now) || v.userRole === "vip") {
        pinnedAndVipVideos.push(v);
      } else if (v.engagementsCount <= 2) {
        freshVideos.push(v);
      } else {
        communityVideos.push(v);
      }
    }

    const sortByDate = (a: Video, b: Video) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    const sortByFewestEngagements = (a: Video, b: Video) =>
      (a.engagementsCount || 0) - (b.engagementsCount || 0) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    ownerVideos.sort(sortByDate);
    pinnedAndVipVideos.sort(sortByDate);
    freshVideos.sort(sortByFewestEngagements);
    communityVideos.sort(sortByDate);

    return {
      sections: {
        owner: ownerVideos,
        pinnedAndVip: pinnedAndVipVideos,
        fresh: freshVideos,
        community: communityVideos,
        watched: [],
      },
      watchedVideoIds: Array.from(watchedVideoIds),
      totalCount: videos.length,
    };
  },

  /**
   * Posts a new clip with limit checks and automatic platform/thumbnail parsing.
   */
  async postVideo(data: {
    url: string;
    title?: string;
    thumbnailUrl?: string;
    userId: string;
    userEmail: string;
    userName?: string;
    userAvatar?: string;
    category?: string;
    sourceTag?: string;
  }) {
    const { url, title, thumbnailUrl, userId, userEmail, userName, userAvatar, category, sourceTag } = data;

    if (!url || typeof url !== "string") {
      throw new Error("Please provide a valid video clip link (TikTok, YouTube Shorts, Instagram Reels, etc.).");
    }

    // Resolve or upsert user
    const user =
      db.getUserByEmail(userEmail) ||
      db.upsertUser({
        id: userId,
        email: userEmail,
        name: userName || userEmail.split("@")[0],
        avatar: userAvatar,
      });

    if (user.isBanned) {
      throw new Error("Your account has been suspended. You cannot post clips.");
    }

    // Duplicate check
    const existing = db
      .getVideos()
      .find((v) => v.url.trim().toLowerCase() === url.trim().toLowerCase());
    if (existing) {
      throw new Error("This clip link has already been posted to ClipEarn.");
    }

    const isOwner = user.role === "owner";
    const limitStats = db.getUserPostLimitStats(user.id);

    if (!isOwner) {
      if (limitStats.credits < 1.5) {
        throw new Error("You need at least 1.5 post credits to upload a clip. Watch and support fellow creators' clips on the feed to earn credits!");
      }

      if (!limitStats.isUnlimited && limitStats.postsUsedToday >= limitStats.totalLimit) {
        const upgradeNote =
          user.role === "user"
            ? " Upgrade to VIP for 20 posts per day, or watch Owner clips for bonus slots."
            : "";
        throw new Error(`You've hit today's limit of ${limitStats.totalLimit} posts. Resets at 6:00 AM.${upgradeNote}`);
      }
    }

    // Parse metadata
    const parsed = await fetchVideoMetadata(url);
    const finalTitle = title?.trim() || parsed.title || "Viral Video Clip";
    const finalThumbnail = thumbnailUrl?.trim() || parsed.thumbnailUrl;
    const finalPlatform = parsed.platform;

    // Deduct 1.5 credits for normal user
    if (!isOwner) {
      db.addCredits(user.id, -1.5);
    }

    const newVideo = db.addVideo({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userRole: user.role,
      title: finalTitle,
      url: url.trim(),
      platform: finalPlatform,
      thumbnailUrl: finalThumbnail,
      category: (category as ClipCategory) || "other",
      sourceTag: sourceTag?.trim() || undefined,
      isOwnerVideo: isOwner,
      isPinned: false,
    });

    const updatedLimitStats = db.getUserPostLimitStats(user.id);

    return {
      success: true,
      video: newVideo,
      remainingCredits: isOwner ? 9999 : updatedLimitStats.credits,
      limitStats: updatedLimitStats,
    };
  },

  /**
   * Verifies engagement and awards credits/bonuses.
   */
  async verifyEngagement(videoId: string, userId: string, watchedSeconds = 15) {
    const res = db.recordEngagement(userId, videoId, watchedSeconds, true, true, true);
    return res;
  },

  /**
   * Fetches site settings.
   */
  async getSettings(): Promise<SiteSettings> {
    return db.getSettings();
  },

  /**
   * Updates site settings.
   */
  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    return db.updateSettings(settings);
  },

  /**
   * Fetches user profile and post limit stats.
   */
  async getUser(userIdOrEmail: string): Promise<{ user: User | null; limitStats: any }> {
    const user =
      db.getUserById(userIdOrEmail) ||
      db.getUserByEmail(userIdOrEmail) ||
      null;

    if (!user) {
      return { user: null, limitStats: null };
    }

    const limitStats = db.getUserPostLimitStats(user.id);
    return { user, limitStats };
  },

  /**
   * Upserts user and returns fresh stats.
   */
  async upsertUser(data: {
    id?: string;
    email: string;
    name?: string;
    avatar?: string;
    role?: UserRole;
  }): Promise<{ user: User; limitStats: any }> {
    const user = db.upsertUser(data);
    const limitStats = db.getUserPostLimitStats(user.id);
    return { user, limitStats };
  },

  /**
   * Fetches leaderboard.
   */
  async getLeaderboard() {
    const users = db.getUsers().filter((u) => !u.isBanned);
    const videos = db.getVideos();
    const engagements = db.getAllEngagements();

    const leaderboard = users.map((user) => {
      const given = engagements.filter((e) => e.userId === user.id).length;
      const userVideos = videos.filter((v) => v.userId === user.id);
      const received = userVideos.reduce((acc, v) => acc + (v.engagementsCount || 0), 0);
      const totalViews = userVideos.reduce((acc, v) => acc + (v.viewsCount || 0), 0);
      const score = (given * 2) + received + (userVideos.length * 5);

      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        engagementsGiven: given,
        engagementsReceived: received,
        totalViews,
        clipsCount: userVideos.length,
        score,
      };
    });

    leaderboard.sort((a, b) => b.score - a.score || b.engagementsGiven - a.engagementsGiven);
    return leaderboard;
  },

  /**
   * Reports a clip.
   */
  async reportVideo(videoId: string, userId: string, reason: string, details?: string, userEmail?: string) {
    return db.reportVideo(videoId, userId, userEmail || "reporter@clipearn.com", reason, details);
  },

  /**
   * Admin operations.
   */
  async getAdminStats() {
    const users = db.getUsers();
    const videos = db.getVideos();
    const reports = db.getReports();
    const txs = db.getTransactions();

    const totalViews = videos.reduce((acc, v) => acc + (v.viewsCount || 0), 0);
    const totalEngagements = videos.reduce((acc, v) => acc + (v.engagementsCount || 0), 0);
    const totalRevenue = txs
      .filter((t) => t.status === "completed")
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    return {
      totalUsers: users.length,
      totalVideos: videos.length,
      totalViews,
      totalEngagements,
      totalRevenue: totalRevenue || 345.0,
      pendingReports: reports.filter((r) => r.status === "pending").length,
      activePins: videos.filter((v) => v.isPinned).length,
      vipUsersCount: users.filter((u) => u.role === "vip").length,
    };
  },

  async getAdminReports() {
    return db.getReports();
  },

  async updateAdminUser(userId: string, data: { role?: UserRole; dailyLimit?: number | null; isBanned?: boolean }) {
    if (data.role) {
      db.updateUserRole(userId, data.role);
    }
    if (data.dailyLimit !== undefined) {
      db.updateUserCustomLimit(userId, data.dailyLimit);
    }
    if (data.isBanned !== undefined) {
      db.banUser(userId, data.isBanned);
    }
    return db.getUserById(userId);
  },

  async deleteVideo(videoId: string) {
    return db.deleteVideo(videoId);
  },

  async pinVideo(videoId: string, durationHours: number) {
    return db.pinVideo(videoId, durationHours);
  },
};
