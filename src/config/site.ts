/**
 * Single source of truth for platform branding, site configuration,
 * and the Owner Bonus System.
 * Rule: Always use "website" or "platform" in copy; never use "app" or app-store terminology.
 */
export const siteConfig = {
  name: "ClipEarn",
  tagline: "Watch. Support. Get Seen.",
  description:
    "The community-driven platform where clippers and video creators support each other. Watch fellow creators' clips to earn post credits and grow your video views organically.",
  domain: "clipearn.com",

  // Comma-separated list of owner emails supported via OWNER_EMAIL env
  ownerEmails: (process.env.OWNER_EMAIL || "owner@clipearn.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  ownerEmail: (process.env.OWNER_EMAIL || "owner@clipearn.com")
    .split(",")[0]
    .trim()
    .toLowerCase(),

  // Platform Engagement Rules
  defaultMinWatchSeconds: 13,
  defaultDailyLimitNormal: 5,
  defaultDailyLimitVip: 20,
  defaultResetHour: 6, // 6:00 AM
  defaultResetTimezone: "UTC",

  // OWNER BONUS SYSTEM:
  // Engaging with verified Owner clips gives extra post slots and bonus credits!
  ownerBonus: {
    slotsPerOwnerClip: 2, // +2 extra post slots per verified owner clip
    creditsPerOwnerClip: 2, // +2 free post credits per verified owner clip
    maxBonusSlotsNormal: 5, // Normal users can reach max 5 base + 5 bonus = 10 posts/day
    maxBonusSlotsVip: 10, // VIP users can reach max 20 base + 10 bonus = 30 posts/day
  },

  vipPriceMonthly: 12.99,
  pinPrice: 5.0,
  pinDurationHours: 24,
  maxPinnedPerUser: 2,

  links: {
    community: "https://discord.gg/clipearn",
    twitter: "https://twitter.com/clipearn",
  },

  platforms: [
    {
      id: "tiktok",
      name: "TikTok",
      color: "#00f2fe",
      glowColor: "rgba(0, 242, 254, 0.4)",
      badgeColor: "bg-[#00f2fe]/10 text-[#00f2fe] border-[#00f2fe]/30",
    },
    {
      id: "youtube",
      name: "YouTube",
      color: "#ff0000",
      glowColor: "rgba(255, 0, 0, 0.4)",
      badgeColor: "bg-red-500/10 text-red-500 border-red-500/30",
    },
    {
      id: "instagram",
      name: "Instagram",
      color: "#e1306c",
      glowColor: "rgba(225, 48, 108, 0.4)",
      badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/30",
    },
    {
      id: "other",
      name: "Other",
      color: "#8b5cf6",
      glowColor: "rgba(139, 92, 246, 0.4)",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
  ],
};

/**
 * Checks whether an email address belongs to an authorized platform owner.
 * Supports comma-separated emails in OWNER_EMAIL env.
 */
export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  const target = email.trim().toLowerCase();
  const allowed = (process.env.OWNER_EMAIL || "owner@clipearn.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(target);
}
