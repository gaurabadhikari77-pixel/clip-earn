import { db } from "./store";
import { fetchVideoMetadata } from "./video-parser";
import { Video, User, SiteSettings, UserRole, ClipCategory } from "@/types";
import { isOwnerEmail } from "@/config/site";

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

      // If viewer has already engaged with this video, include in watched list and exclude from active feed
      if (isWatched) {
        watchedVideos.push(v);
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

    ownerVideos.sort(sortByDate);
    pinnedAndVipVideos.sort(sortByDate);
    watchedVideos.sort(sortByDate);

    // 3-Minute Interval Shuffle for Community & Fresh clips (Fair rotation for all clippers)
    const shuffleWindow = Math.floor(Date.now() / (3 * 60 * 1000));
    const shuffleWithSeed = <T>(array: T[], seed: number): T[] => {
      const arr = [...array];
      let m = arr.length;
      let s = seed + 1337;
      const nextRandom = () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
      while (m) {
        const i = Math.floor(nextRandom() * m--);
        const t = arr[m];
        arr[m] = arr[i];
        arr[i] = t;
      }
      return arr;
    };

    const rotatedCommunity = shuffleWithSeed(communityVideos, shuffleWindow);
    const rotatedFresh = shuffleWithSeed(freshVideos, shuffleWindow + 42);

    return {
      sections: {
        owner: ownerVideos,
        pinnedAndVip: pinnedAndVipVideos,
        fresh: rotatedFresh,
        community: rotatedCommunity,
        watched: watchedVideos,
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
        nickname: userName || undefined,
        name: userName || undefined,
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
      userName: user.nickname || user.name || "Clipper",
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
   * Requires liked to be true for rewards to be credited.
   */
  async verifyEngagement(
    videoId: string,
    userId: string,
    watchedSeconds = 15,
    liked = false,
    commented = false,
    followed = false
  ) {
    const res = db.recordEngagement(userId, videoId, watchedSeconds, liked, commented, followed);
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
    const users = db.getUsers().filter(
      (u) =>
        !u.isBanned &&
        u.id !== "usr_vip_01" &&
        u.id !== "usr_creator_03" &&
        !u.id.startsWith("usr_vip_") &&
        !u.id.startsWith("usr_creator_")
    );
    const videos = db.getVideos();
    const engagements = db.getAllEngagements();

    const leaderboard = users.map((user) => {
      const given = engagements.filter((e) => e.userId === user.id).length;
      const userVideos = videos.filter((v) => v.userId === user.id);
      const received = userVideos.reduce((acc, v) => acc + (v.engagementsCount || 0), 0);
      const totalViews = userVideos.reduce((acc, v) => acc + (v.viewsCount || 0), 0);
      const score = (given * 2) + received + (userVideos.length * 5);

      const isOwner = user.role === "owner" || (user.email && isOwnerEmail(user.email));
      const displayName =
        user.nickname ||
        (isOwner ? "ClipEarn Founder" : `Clipper_${user.id.slice(-4).toUpperCase()}`);

      return {
        id: user.id,
        name: displayName,
        nickname: displayName,
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

  async pinVideo(videoId: string, durationHours = 24) {
    return db.pinVideo(videoId, durationHours);
  },

  async unpinVideo(videoId: string) {
    return db.unpinVideo(videoId);
  },

  async updateVideo(videoId: string, updates: Partial<Video>) {
    return db.updateVideo(videoId, updates);
  },

  async toggleOwnerVideo(videoId: string) {
    return db.toggleOwnerVideo(videoId);
  },

  async banUser(userId: string) {
    return db.banUser(userId, true);
  },

  async updateUserProfile(
    userId: string,
    data: { nickname?: string; avatar?: string; bio?: string; socialHandle?: string }
  ) {
    return db.updateUserProfile(userId, data);
  },
};
