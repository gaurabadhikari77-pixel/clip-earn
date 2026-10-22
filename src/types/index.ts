export type UserRole = "owner" | "admin" | "vip" | "user";

export type PlatformType = "tiktok" | "youtube" | "instagram" | "other";

export type ClipCategory = "podcast" | "gaming" | "streamer" | "anime" | "movies" | "other";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
  credits: number;
  postCredits: number; // backward compatibility alias
  dailyLimitOverride: number | null; // null = role default; -1 = unlimited; or custom limit
  customDailyLimit: number | null; // backward compatibility alias
  bonusSlotsToday: number; // slots unlocked today by watching owner clips
  bonusSlotsResetAt?: string;
  vipUntil: string | null;
  vipExpiresAt?: string | null; // backward compatibility alias
  isBanned: boolean;
  createdAt: string;
  postsTodayCount?: number;
  theme?: string;
  customAccent?: string | null;
  nickname?: string;
  bio?: string;
  socialHandle?: string;
}

export interface OwnerClipReward {
  id: string;
  userId: string;
  clipId: string;
  rewardType: "owner_bonus";
  slotsAwarded: number;
  creditsAwarded: number;
  createdAt: string;
}

export interface Video {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  title: string;
  url: string;
  platform: PlatformType;
  thumbnailUrl: string;
  category?: ClipCategory;
  sourceTag?: string; // e.g. "Joe Rogan", "xQc", "Valorant", "Jujutsu Kaisen"
  isOwnerVideo: boolean;
  isPinned: boolean;
  pinnedUntil?: string | null;
  isSpotlightPinned?: boolean;
  spotlightPinnedUntil?: string | null;
  refreshedAt?: string | null;
  viewsCount: number;
  engagementsCount: number;
  likesCount?: number;
  reportsCount: number;
  createdAt: string;
}

export interface Engagement {
  id: string;
  userId: string;
  videoId: string;
  watchedSeconds: number;
  liked: boolean;
  commented: boolean;
  followed: boolean;
  verifiedAt: string;
  createdAt?: string;
}

export interface Report {
  id: string;
  videoId: string;
  videoTitle: string;
  reporterId: string;
  reporterEmail: string;
  reason: string;
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export interface SiteSettings {
  minWatchSeconds: number;
  dailyPostLimitNormal: number;
  dailyPostLimitVip: number;
  ownerBonusSlots: number;
  ownerBonusCredits: number;
  maxBonusSlotsNormal: number;
  maxBonusSlotsVip: number;
  resetHour: number; // e.g. 6 for 6:00 AM
  resetTimezone: string;
  vipMonthlyPrice: number;
  pinVideoPrice: number;
  pinDurationHours: number;
  hideAdsForVip: boolean;
  adSlots: {
    topBanner: string;
    sidebar: string;
    inFeed: string;
    rewardBanner: string;
    postBanner: string;
    upgradeBanner: string;
    footerBanner: string;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: "vip" | "pin";
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  stripeSessionId?: string;
  targetVideoId?: string;
  createdAt: string;
}
