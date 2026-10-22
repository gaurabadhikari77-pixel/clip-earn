import {
  Video,
  User,
  SiteSettings,
  Report,
  Engagement,
  Transaction,
  UserRole,
  PlatformType,
  ClipCategory,
  OwnerClipReward,
} from "@/types";
import { initialSettings, sampleUsers, seedAllClips } from "./seed-data";
import { siteConfig, isOwnerEmail } from "@/config/site";
import { firebaseDb } from "./firebase-db";

// In-memory persistent state for API routes in Node server environment
declare global {
  // eslint-disable-next-line no-var
  var __CLIPEARN_STORE__: {
    videos: Video[];
    users: User[];
    settings: SiteSettings;
    engagements: Engagement[];
    ownerRewards: OwnerClipReward[];
    reports: Report[];
    transactions: Transaction[];
  } | undefined;
}

const STORAGE_KEY = "clipearn_local_store_v6";

export function saveStore() {
  if (typeof window !== "undefined" && global.__CLIPEARN_STORE__) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(global.__CLIPEARN_STORE__));
    } catch {}
  }
}

function getStore(): NonNullable<typeof global.__CLIPEARN_STORE__> {
  if (!global.__CLIPEARN_STORE__) {
    if (typeof window !== "undefined") {
      try {
        // Remove legacy store caches containing old mock/seed videos
        localStorage.removeItem("clipearn_local_store_v1");
        localStorage.removeItem("clipearn_local_store_v2");
        localStorage.removeItem("clipearn_local_store_v3");
        localStorage.removeItem("clipearn_local_store_v4");
        localStorage.removeItem("clipearn_local_store_v5");

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed) {
            // Guarantee array
            if (!Array.isArray(parsed.videos)) parsed.videos = [];
            global.__CLIPEARN_STORE__ = parsed;
            return global.__CLIPEARN_STORE__!;
          }
        }
      } catch {}
    }

    global.__CLIPEARN_STORE__ = {
      videos: [],
      users: [...sampleUsers],
      settings: { ...initialSettings },
      engagements: [],
      ownerRewards: [],
      reports: [],
      transactions: [],
    };
  }
  return global.__CLIPEARN_STORE__!;
}

/**
 * Calculates daily reset boundary relative to the daily resetHour (6:00 AM).
 */
export function getDailyResetBoundary(resetHour = 6): { startOfToday: Date; nextReset: Date } {
  const now = new Date();
  const resetToday = new Date(now);
  resetToday.setHours(resetHour, 0, 0, 0);

  let startOfToday: Date;
  let nextReset: Date;

  if (now.getTime() >= resetToday.getTime()) {
    startOfToday = resetToday;
    nextReset = new Date(resetToday.getTime() + 24 * 60 * 60 * 1000);
  } else {
    startOfToday = new Date(resetToday.getTime() - 24 * 60 * 60 * 1000);
    nextReset = resetToday;
  }

  return { startOfToday, nextReset };
}

export const db = {
  // --- VIDEOS ---
  getVideos(): Video[] {
    const store = getStore();
    return [...store.videos];
  },

  getVideoById(id: string): Video | undefined {
    const store = getStore();
    return store.videos.find((v) => v.id === id);
  },

  addVideo(
    videoData: Omit<
      Video,
      "id" | "createdAt" | "viewsCount" | "engagementsCount" | "reportsCount"
    >
  ): Video {
    const store = getStore();
    const newVideo: Video = {
      ...videoData,
      id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      viewsCount: 0,
      engagementsCount: 0,
      reportsCount: 0,
    };
    store.videos.unshift(newVideo);
    saveStore();
    firebaseDb.addVideo(newVideo).catch(() => {});
    return newVideo;
  },

  deleteVideo(id: string): boolean {
    const store = getStore();
    const index = store.videos.findIndex((v) => v.id === id);
    if (index !== -1) {
      store.videos.splice(index, 1);
      saveStore();
      return true;
    }
    return false;
  },

  pinVideo(id: string, durationHours: number): boolean {
    const store = getStore();
    const video = store.videos.find((v) => v.id === id);
    if (!video) return false;

    video.isPinned = true;
    const expiry = new Date(Date.now() + durationHours * 3600 * 1000);
    video.pinnedUntil = expiry.toISOString();
    saveStore();
    return true;
  },

  unpinVideo(id: string): boolean {
    const store = getStore();
    const video = store.videos.find((v) => v.id === id);
    if (!video) return false;

    video.isPinned = false;
    video.pinnedUntil = null;
    saveStore();
    return true;
  },

  updateVideo(id: string, updates: Partial<Video>): Video | null {
    const store = getStore();
    const video = store.videos.find((v) => v.id === id);
    if (!video) return null;

    Object.assign(video, updates);
    saveStore();
    return video;
  },

  toggleOwnerVideo(id: string): boolean {
    const store = getStore();
    const video = store.videos.find((v) => v.id === id);
    if (!video) return false;

    video.isOwnerVideo = !video.isOwnerVideo;
    saveStore();
    return true;
  },

  incrementVideoStats(id: string, view = true, engagement = true) {
    const store = getStore();
    const video = store.videos.find((v) => v.id === id);
    if (video) {
      if (view) video.viewsCount += 1;
      if (engagement) video.engagementsCount += 1;
      saveStore();
    }
  },

  // --- USERS ---
  getUsers(): User[] {
    const store = getStore();
    return [...store.users];
  },

  getUserById(id: string): User | undefined {
    const store = getStore();
    const user = store.users.find((u) => u.id === id);
    if (user) {
      if (isOwnerEmail(user.email)) {
        user.role = "owner";
        user.credits = 9999;
        user.postCredits = 9999;
        user.dailyLimitOverride = -1;
        user.customDailyLimit = -1;
      }
      this.checkAndExpireVip(user);
    }
    return user;
  },

  getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    const store = getStore();
    const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      if (isOwnerEmail(user.email)) {
        user.role = "owner";
        user.credits = 9999;
        user.postCredits = 9999;
        user.dailyLimitOverride = -1;
        user.customDailyLimit = -1;
      }
      this.checkAndExpireVip(user);
    }
    return user;
  },

  checkAndExpireVip(user: User) {
    if (user.role === "vip" && user.vipUntil) {
      if (new Date(user.vipUntil).getTime() < Date.now()) {
        user.role = "user";
        user.vipUntil = null;
        user.vipExpiresAt = null;
      }
    }
  },

  /**
   * UPSERTS user row (id, email, name, avatar, role, vip_until, daily_limit_override, bonus_slots_today, credits, created_at).
   * Automatically sets OWNER role if email matches OWNER_EMAIL.
   */
  upsertUser(user: {
    email: string;
    id?: string;
    name?: string;
    avatar?: string;
    role?: UserRole;
    vipUntil?: string | null;
    dailyLimitOverride?: number | null;
  }): User {
    const store = getStore();
    const cleanEmail = user.email.toLowerCase().trim();
    const existing = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    const isOwner = isOwnerEmail(cleanEmail);

    if (existing) {
      this.checkAndExpireVip(existing);

      if (isOwner && existing.role !== "owner") {
        existing.role = "owner";
        existing.dailyLimitOverride = -1;
        existing.customDailyLimit = -1;
        existing.credits = 9999;
        existing.postCredits = 9999;
      }

      if (user.name) existing.name = user.name;
      if (user.avatar) existing.avatar = user.avatar;
      if (user.vipUntil !== undefined) {
        existing.vipUntil = user.vipUntil;
        existing.vipExpiresAt = user.vipUntil;
        if (user.vipUntil && new Date(user.vipUntil).getTime() > Date.now()) {
          existing.role = "vip";
        }
      }
      if (user.dailyLimitOverride !== undefined) {
        existing.dailyLimitOverride = user.dailyLimitOverride;
        existing.customDailyLimit = user.dailyLimitOverride;
      }

      saveStore();
      firebaseDb.upsertUser(existing).catch(() => {});
      return existing;
    }

    // Create new user record
    const newUser: User = {
      id: user.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: user.name || cleanEmail.split("@")[0],
      avatar:
        user.avatar ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      role: isOwner ? "owner" : (user.role || "user"),
      credits: isOwner ? 9999 : 1.5,
      postCredits: isOwner ? 9999 : 1.5,
      dailyLimitOverride: isOwner ? -1 : (user.dailyLimitOverride ?? null),
      customDailyLimit: isOwner ? -1 : (user.dailyLimitOverride ?? null),
      bonusSlotsToday: 0,
      bonusSlotsResetAt: new Date().toISOString(),
      vipUntil: user.vipUntil || null,
      vipExpiresAt: user.vipUntil || null,
      isBanned: false,
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);
    saveStore();
    firebaseDb.upsertUser(newUser).catch(() => {});
    return newUser;
  },

  updateUserRole(userId: string, role: UserRole, vipUntil?: string | null): boolean {
    const store = getStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user) return false;
    if (isOwnerEmail(user.email) && role !== "owner") {
      return false;
    }
    user.role = role;
    if (role === "owner") {
      user.dailyLimitOverride = -1;
      user.customDailyLimit = -1;
      user.credits = 9999;
      user.postCredits = 9999;
    } else if (role === "vip") {
      user.vipUntil = vipUntil || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      user.vipExpiresAt = user.vipUntil;
    } else if (role === "user") {
      user.vipUntil = null;
      user.vipExpiresAt = null;
    }
    saveStore();
    return true;
  },

  updateUserCustomLimit(userId: string, limit: number | null): boolean {
    const store = getStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user) return false;
    user.dailyLimitOverride = limit;
    user.customDailyLimit = limit;
    return true;
  },

  banUser(userId: string, isBanned: boolean): boolean {
    const store = getStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user) return false;
    user.isBanned = isBanned;
    return true;
  },

  addCredits(userId: string, amount: number): number {
    const store = getStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user) return 0;
    if (user.role === "owner") return 9999;
    user.credits = Math.max(0, (user.credits || 0) + amount);
    user.postCredits = user.credits;
    return user.credits;
  },

  // --- OWNER BONUS & DAILY POST LIMIT CHECKER ---
  getUserPostLimitStats(userId: string): {
    postsUsedToday: number;
    baseLimit: number; // e.g. 5 for normal, 20 for VIP
    bonusSlotsEarned: number; // slots unlocked today from owner clips
    totalLimit: number; // baseLimit + bonusSlotsEarned
    maxBonusAllowed: number; // +5 for normal, +10 for VIP
    isUnlimited: boolean;
    canPost: boolean;
    nextReset: string;
    secondsUntilReset: number;
    credits: number;
    dailyLimit: number; // compatibility alias = totalLimit
  } {
    const store = getStore();
    const user = this.getUserById(userId);
    const settings = store.settings;
    const { startOfToday, nextReset } = getDailyResetBoundary(settings.resetHour);

    // Reset bonus slots if today's 6:00 AM reset passed
    if (user) {
      const lastResetDate = user.bonusSlotsResetAt ? new Date(user.bonusSlotsResetAt) : new Date(0);
      if (lastResetDate.getTime() < startOfToday.getTime()) {
        user.bonusSlotsToday = 0;
        user.bonusSlotsResetAt = startOfToday.toISOString();
      }
    }

    const postsUsedToday = store.videos.filter((v) => {
      if (v.userId !== userId) return false;
      const created = new Date(v.createdAt);
      return created >= startOfToday;
    }).length;

    let baseLimit = settings.dailyPostLimitNormal;
    let maxBonusAllowed = settings.maxBonusSlotsNormal; // default 5

    if (user) {
      if (user.role === "owner") {
        baseLimit = -1;
      } else if (user.dailyLimitOverride !== null && user.dailyLimitOverride !== undefined) {
        baseLimit = user.dailyLimitOverride;
      } else if (user.role === "vip") {
        baseLimit = settings.dailyPostLimitVip;
        maxBonusAllowed = settings.maxBonusSlotsVip; // default 10
      }
    }

    const isUnlimited = baseLimit === -1;
    const bonusSlotsEarned = user ? (user.bonusSlotsToday || 0) : 0;
    const totalLimit = isUnlimited ? -1 : baseLimit + bonusSlotsEarned;

    const hasDailyRoom = isUnlimited || postsUsedToday < totalLimit;
    const userCredits = user ? (user.role === "owner" ? 9999 : (user.credits || user.postCredits || 0)) : 0;
    const hasCredits = user ? (user.role === "owner" || userCredits >= 1.5) : false;

    const secondsUntilReset = Math.max(0, Math.floor((nextReset.getTime() - Date.now()) / 1000));

    return {
      postsUsedToday,
      baseLimit,
      bonusSlotsEarned,
      totalLimit,
      maxBonusAllowed,
      isUnlimited,
      canPost: hasDailyRoom && hasCredits,
      nextReset: nextReset.toISOString(),
      secondsUntilReset,
      credits: userCredits,
      dailyLimit: totalLimit,
    };
  },

  // --- OWNER BONUS REWARDS TRACKING ---
  hasUserClaimedOwnerBonus(userId: string, clipId: string): boolean {
    const store = getStore();
    return store.ownerRewards.some((r) => r.userId === userId && r.clipId === clipId);
  },

  recordOwnerBonus(userId: string, clipId: string, slots: number, credits: number) {
    const store = getStore();
    const existing = store.ownerRewards.find((r) => r.userId === userId && r.clipId === clipId);
    if (!existing) {
      const newReward: OwnerClipReward = {
        id: `rwd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        clipId,
        rewardType: "owner_bonus",
        slotsAwarded: slots,
        creditsAwarded: credits,
        createdAt: new Date().toISOString(),
      };
      store.ownerRewards.push(newReward);
      firebaseDb.recordOwnerReward(newReward).catch(() => {});
    }
  },

  // --- ENGAGEMENTS (With Owner Bonus System) ---
  recordEngagement(
    userId: string,
    videoId: string,
    watchedSeconds: number,
    liked: boolean,
    commented: boolean,
    followed: boolean
  ): {
    success: boolean;
    creditAwarded: boolean;
    isOwnerBonus: boolean;
    slotsAwarded: number;
    creditsAwarded: number;
    message: string;
  } {
    const store = getStore();
    const user = this.getUserById(userId);
    const video = store.videos.find((v) => v.id === videoId);

    if (!user) {
      return {
        success: false,
        creditAwarded: false,
        isOwnerBonus: false,
        slotsAwarded: 0,
        creditsAwarded: 0,
        message: "User not found",
      };
    }
    if (!video) {
      return {
        success: false,
        creditAwarded: false,
        isOwnerBonus: false,
        slotsAwarded: 0,
        creditsAwarded: 0,
        message: "Clip not found",
      };
    }

    const minTime = store.settings.minWatchSeconds;
    if (watchedSeconds < minTime) {
      return {
        success: false,
        creditAwarded: false,
        isOwnerBonus: false,
        slotsAwarded: 0,
        creditsAwarded: 0,
        message: `Minimum watch time of ${minTime} seconds required. Recorded only ${watchedSeconds}s.`,
      };
    }

    // Check existing general engagement
    const existingEng = store.engagements.find((e) => e.userId === userId && e.videoId === videoId);

    // 1. OWNER CLIP BONUS LOGIC
    if (video.isOwnerVideo) {
      const alreadyRewarded = this.hasUserClaimedOwnerBonus(userId, videoId);

      if (!alreadyRewarded) {
        const bonusCredits = store.settings.ownerBonusCredits; // 2
        const bonusSlotsPerClip = store.settings.ownerBonusSlots; // 2

        // Determine cap based on role
        const maxBonusCap =
          user.role === "vip"
            ? store.settings.maxBonusSlotsVip // 10
            : store.settings.maxBonusSlotsNormal; // 5

        const currentBonus = user.bonusSlotsToday || 0;
        const availableBonusRoom = Math.max(0, maxBonusCap - currentBonus);
        const slotsToAward = Math.min(bonusSlotsPerClip, availableBonusRoom);

        // Update user record
        user.bonusSlotsToday = currentBonus + slotsToAward;
        this.addCredits(userId, bonusCredits);

        // Record reward in table with unique constraint
        this.recordOwnerBonus(userId, videoId, slotsToAward, bonusCredits);

        // Record engagement stats
        if (!existingEng) {
          const newEng: Engagement = {
            id: `eng_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId,
            videoId,
            watchedSeconds,
            liked,
            commented,
            followed,
            verifiedAt: new Date().toISOString(),
          };
          store.engagements.push(newEng);
          firebaseDb.recordEngagement(newEng).catch(() => {});
          this.incrementVideoStats(videoId, true, true);
        } else {
          this.incrementVideoStats(videoId, true, false);
        }

        saveStore();
        return {
          success: true,
          creditAwarded: true,
          isOwnerBonus: true,
          slotsAwarded: slotsToAward,
          creditsAwarded: bonusCredits,
          message:
            slotsToAward > 0
              ? `Verified! +${slotsToAward} upload slots unlocked & +${bonusCredits} post credits earned from Owner clip!`
              : `Verified! +${bonusCredits} post credits earned! (Max daily bonus slots cap reached).`,
        };
      } else {
        // Owner clip already rewarded to this user
        if (!existingEng) {
          store.engagements.push({
            id: `eng_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId,
            videoId,
            watchedSeconds,
            liked,
            commented,
            followed,
            verifiedAt: new Date().toISOString(),
          });
        }
        this.incrementVideoStats(videoId, true, false);
        saveStore();
        return {
          success: true,
          creditAwarded: false,
          isOwnerBonus: false,
          slotsAwarded: 0,
          creditsAwarded: 0,
          message: "Owner clip verified! (Bonus rewards already claimed previously for this clip)",
        };
      }
    }

    // 2. VIP CLIP WATCHED BY VIP USER
    // Rule: Watching other VIP clips gives NOTHING (no credits, no slots)
    if (user.role === "vip" && video.userRole === "vip" && !video.isOwnerVideo) {
      if (!existingEng) {
        store.engagements.push({
          id: `eng_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId,
          videoId,
          watchedSeconds,
          liked,
          commented,
          followed,
          verifiedAt: new Date().toISOString(),
        });
      }
      this.incrementVideoStats(videoId, true, false);
      saveStore();
      return {
        success: true,
        creditAwarded: false,
        isOwnerBonus: false,
        slotsAwarded: 0,
        creditsAwarded: 0,
        message: "VIP clips don't earn rewards for VIP members.",
      };
    }

    // 3. NORMAL CLIP ENGAGEMENT
    let creditAwarded = false;
    if (!existingEng) {
      const newEng: Engagement = {
        id: `eng_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        videoId,
        watchedSeconds,
        liked,
        commented,
        followed,
        verifiedAt: new Date().toISOString(),
      };
      store.engagements.push(newEng);
      firebaseDb.recordEngagement(newEng).catch(() => {});
      this.incrementVideoStats(videoId, true, true);
      this.addCredits(userId, 1);
      creditAwarded = true;
    } else {
      this.incrementVideoStats(videoId, true, false);
    }

    saveStore();
    return {
      success: true,
      creditAwarded,
      isOwnerBonus: false,
      slotsAwarded: 0,
      creditsAwarded: creditAwarded ? 1 : 0,
      message: creditAwarded
        ? "Verified! You earned 1 post credit."
        : "Clip watched! (Credit already claimed previously)",
    };
  },

  getUserEngagements(userId: string): Engagement[] {
    const store = getStore();
    return store.engagements.filter((e) => e.userId === userId);
  },

  getAllEngagements(): Engagement[] {
    const store = getStore();
    return [...store.engagements];
  },

  // --- REPORTS ---
  reportVideo(
    videoId: string,
    reporterId: string,
    reporterEmail: string,
    reason: string,
    details?: string
  ): Report | null {
    const store = getStore();
    const video = store.videos.find((v) => v.id === videoId);
    if (!video) return null;

    video.reportsCount = (video.reportsCount || 0) + 1;

    const report: Report = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      videoId,
      videoTitle: video.title,
      reporterId,
      reporterEmail,
      reason,
      details,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    store.reports.unshift(report);
    return report;
  },

  getReports(): Report[] {
    const store = getStore();
    return [...store.reports];
  },

  updateReportStatus(reportId: string, status: "pending" | "resolved" | "dismissed"): boolean {
    const store = getStore();
    const report = store.reports.find((r) => r.id === reportId);
    if (!report) return false;
    report.status = status;
    return true;
  },

  // --- SETTINGS ---
  getSettings(): SiteSettings {
    const store = getStore();
    return { ...store.settings };
  },

  updateSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    const store = getStore();
    store.settings = { ...store.settings, ...newSettings };
    return { ...store.settings };
  },

  // --- TRANSACTIONS ---
  addTransaction(tx: Omit<Transaction, "id" | "createdAt">): Transaction {
    const store = getStore();
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    store.transactions.unshift(newTx);
    return newTx;
  },

  getTransactions(): Transaction[] {
    const store = getStore();
    return [...store.transactions];
  },
};
