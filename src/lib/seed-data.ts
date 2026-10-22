import { Video, User, SiteSettings } from "@/types";
import { siteConfig } from "@/config/site";

export const initialSettings: SiteSettings = {
  minWatchSeconds: siteConfig.defaultMinWatchSeconds,
  dailyPostLimitNormal: siteConfig.defaultDailyLimitNormal,
  dailyPostLimitVip: siteConfig.defaultDailyLimitVip,
  ownerBonusSlots: siteConfig.ownerBonus.slotsPerOwnerClip, // +2 slots
  ownerBonusCredits: siteConfig.ownerBonus.creditsPerOwnerClip, // +2 credits
  maxBonusSlotsNormal: siteConfig.ownerBonus.maxBonusSlotsNormal, // +5 slots max (10 total)
  maxBonusSlotsVip: siteConfig.ownerBonus.maxBonusSlotsVip, // +10 slots max (30 total)
  resetHour: siteConfig.defaultResetHour,
  resetTimezone: siteConfig.defaultResetTimezone,
  vipMonthlyPrice: siteConfig.vipPriceMonthly,
  pinVideoPrice: siteConfig.pinPrice,
  pinDurationHours: siteConfig.pinDurationHours,
  hideAdsForVip: true,
  adSlots: {
    topBanner: `<div class="p-3 bg-gradient-to-r from-purple-950/40 via-pink-950/40 to-indigo-950/40 border border-purple-500/30 rounded-xl text-center text-xs text-purple-200 flex items-center justify-center gap-3">
  <span class="px-2 py-0.5 rounded bg-purple-500/20 text-[10px] font-bold uppercase tracking-wider text-purple-300 border border-purple-500/30">Sponsored</span>
  <span>AutoClip AI: Turn 1-hour streams into 15 viral shorts with subtitles in 60s!</span>
  <a href="https://example.com" target="_blank" class="underline text-pink-400 font-bold hover:text-pink-300">Try Free &rarr;</a>
</div>`,
    sidebar: `<div class="p-4 bg-[#0e1017] border border-purple-900/40 rounded-2xl text-center space-y-3">
  <span class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Advertisement</span>
  <div class="h-48 rounded-xl bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-black flex flex-col items-center justify-center p-4 text-center border border-purple-500/20">
    <p class="font-bold text-white text-sm">Supercharge Your TikTok Reach</p>
    <p class="text-xs text-zinc-400 mt-1">Authentic views and watch-time that crack the FYP algorithm.</p>
    <button class="mt-3 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-500/30 hover:opacity-90">Start Growing</button>
  </div>
</div>`,
    inFeed: `<div class="p-4 bg-gradient-to-r from-[#12131f] via-purple-950/20 to-[#12131f] border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-purple-500/30">AD</div>
    <div>
      <div class="flex items-center gap-2">
        <h4 class="font-bold text-sm text-zinc-100">Top 1% Clipper Soundboard & FX Pack</h4>
        <span class="text-[10px] uppercase px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">Sponsored</span>
      </div>
      <p class="text-xs text-zinc-400">Download 5,000+ viral meme sound effects, whooshes, and anime stingers.</p>
    </div>
  </div>
  <a href="https://example.com" target="_blank" class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-xs whitespace-nowrap transition-all shadow-lg shadow-purple-500/30">
    Get Sounds Free
  </a>
</div>`,
    rewardBanner: `<div class="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
  <span class="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">VIP Perk</span>
  <span>VIP members get 20 posts every single day. <a href="/upgrade" class="underline font-bold text-white">Upgrade now</a>.</span>
</div>`,
    postBanner: `<div class="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-center text-xs text-purple-300">
  Want guaranteed #1 placement? <a href="/upgrade" class="text-pink-400 font-bold underline">Pin your clip for 24 hours</a> to the Pinned Showcase!
</div>`,
    upgradeBanner: `<div class="p-3 bg-gradient-to-r from-purple-950/50 to-pink-950/50 border border-purple-500/40 rounded-xl text-center text-xs text-zinc-200">
  Special Community Offer: Subscribe to VIP today and unlock <strong>20 daily submissions</strong> + zero ads!
</div>`,
    footerBanner: `<div class="py-2.5 px-4 bg-[#0a0c12] border-t border-zinc-900 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
  <span class="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Platform Partner:</span>
  <span class="text-zinc-300">ClipperForge — Real-time stream clipping bots for Discord & Kick</span>
</div>`,
  },
};

export const sampleUsers: User[] = [
  {
    id: "usr_owner_iamdeathflow11",
    email: "iamdeathflow11@gmail.com",
    name: "Admin (iamdeathflow11)",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=iamdeathflow11",
    role: "owner",
    credits: 9999,
    postCredits: 9999,
    bonusSlotsToday: 0,
    dailyLimitOverride: -1,
    customDailyLimit: -1,
    vipUntil: null,
    isBanned: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr_vip_01",
    email: "sarah.clips@example.com",
    name: "Sarah Edits",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "vip",
    credits: 12,
    postCredits: 12,
    bonusSlotsToday: 0,
    dailyLimitOverride: null,
    customDailyLimit: null,
    vipUntil: "2027-01-01T00:00:00.000Z",
    vipExpiresAt: "2027-01-01T00:00:00.000Z",
    isBanned: false,
    createdAt: "2026-02-15T00:00:00.000Z",
  },
  {
    id: "usr_creator_03",
    email: "jake.shorts@example.com",
    name: "Jake Shorts",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "user",
    credits: 4,
    postCredits: 4,
    bonusSlotsToday: 0,
    dailyLimitOverride: null,
    customDailyLimit: null,
    vipUntil: null,
    isBanned: false,
    createdAt: "2026-03-01T00:00:00.000Z",
  },
];

// Completely clean start: Zero default/dummy videos
export const seedAllClips: Video[] = [];
