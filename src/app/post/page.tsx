"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Link as LinkIcon,
  Sparkles,
  Crown,
  Upload,
  AlertCircle,
  Clock,
  Coins,
  Video as VideoIcon,
  Radio,
  Gamepad2,
  Tv,
  Film,
  Sparkle,
  Zap,
  LogIn,
  Play,
  Image as ImageIcon,
  Check,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { AdSlot } from "@/components/AdSlot";
import { ClipCategory } from "@/types";
import { clientApi } from "@/lib/client-api";
import { fetchVideoMetadata, getLivePreviewInfo } from "@/lib/video-parser";

export default function UploadPage() {
  const router = useRouter();
  const { user, limitStats, refreshUserData, showToast, openLoginModal } = useApp();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState<ClipCategory>("gaming");
  const [sourceTag, setSourceTag] = useState("");
  const [detectedPlatform, setDetectedPlatform] = useState<string>("other");

  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdownString, setCountdownString] = useState("");
  const [previewMode, setPreviewMode] = useState<"thumbnail" | "player">("thumbnail");

  const previewInfo = useMemo(() => {
    return getLivePreviewInfo(url, (detectedPlatform as any) || "other");
  }, [url, detectedPlatform]);

  const isOwner = user?.role === "owner";
  const userCredits = isOwner ? 9999 : (user?.credits ?? user?.postCredits ?? 0);

  // Live countdown to 6-hour reset
  useEffect(() => {
    if (!limitStats?.nextReset) return;
    const interval = setInterval(() => {
      const target = new Date(limitStats.nextReset).getTime();
      const diff = Math.max(0, target - Date.now());
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownString(`${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [limitStats?.nextReset]);

  // Auto-detect metadata on URL blur or paste
  const handleFetchMetadata = async (inputUrl = url) => {
    const trimmed = inputUrl.trim();
    if (!trimmed || !trimmed.startsWith("http")) return;

    setLoadingMeta(true);
    setErrorMsg(null);

    try {
      const data = await fetchVideoMetadata(trimmed);
      if (data.isValid) {
        setDetectedPlatform(data.platform);
        if (data.title && !title) setTitle(data.title);
        if (data.thumbnailUrl) setThumbnailUrl(data.thumbnailUrl);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoadingMeta(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      showToast("Please sign in with Google to post your clip.", "info");
      return;
    }

    if (!isOwner && userCredits < 1.5) {
      setErrorMsg("You need at least 1.5 post credits to upload a clip. Watch and support clips on the feed to earn credits!");
      return;
    }

    if (!isOwner && limitStats && !limitStats.isUnlimited) {
      if (limitStats.postsUsedToday >= limitStats.totalLimit) {
        setErrorMsg(`You've hit the posting limit for this 6-hour cycle. Resets in ${countdownString || "a few hours"}.`);
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await clientApi.postVideo({
        userId: user.id,
        userEmail: user.email,
        userName: user.nickname || user.name || "Clipper",
        userAvatar: user.avatar,
        url: url.trim(),
        title: title.trim() || "Viral Clip",
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        category,
        sourceTag: sourceTag.trim() || undefined,
      });

      showToast("Clip uploaded! Now live on the feed.", "success");
      await refreshUserData();
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Error uploading clip");
      setSubmitting(false);
    }
  };

  const effectiveTotalLimit = limitStats?.totalLimit || limitStats?.dailyLimit || 5;
  const limitHit =
    !isOwner &&
    limitStats &&
    !limitStats.isUnlimited &&
    limitStats.postsUsedToday >= effectiveTotalLimit;

  const bonusRemaining = limitStats
    ? Math.max(0, (limitStats.maxBonusAllowed || 5) - (limitStats.bonusSlotsEarned || 0))
    : 5;

  const categories: { id: ClipCategory; label: string; icon: any }[] = [
    { id: "gaming", label: "Gaming", icon: Gamepad2 },
    { id: "streamer", label: "Streamers", icon: Tv },
    { id: "podcast", label: "Podcasts", icon: Radio },
    { id: "anime", label: "Anime", icon: Sparkle },
    { id: "movies", label: "Movies & TV", icon: Film },
    { id: "other", label: "Other", icon: VideoIcon },
  ];

  return (
    <div className="w-full min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-fg tracking-tight flex items-center gap-2">
          <span>Upload a Clip</span>
          <span className="px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[10px] font-black uppercase">
            9:16 Shorts
          </span>
        </h1>
        <p className="text-xs text-muted">
          Paste your TikTok, YouTube Shorts, or Instagram Reel link to get views from the community.
        </p>
      </div>

      {/* GUEST BANNER */}
      {!user && (
        <div className="p-4 rounded-2xl bg-surface border border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogIn className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs font-bold text-fg">Sign In Required to Upload</p>
              <p className="text-[11px] text-muted">
                Sign in with Google, watch clips on the feed to earn your 1.5 upload credits, and get your clips seen by fellow creators!
              </p>
            </div>
          </div>
          <button
            onClick={openLoginModal}
            className="px-4 py-2 bg-accent hover:opacity-90 text-accent-fg font-bold text-xs rounded-xl shadow-md transition-opacity"
          >
            Sign In with Google
          </button>
        </div>
      )}

      {/* METRICS / DAILY POSTS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Credits Status */}
        <div className="p-4 rounded-2xl bg-surface border border-line flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted">Available Credits (Upload costs 1.5 credits)</span>
            <p className="text-xl font-black text-fg flex items-center gap-2">
              <Coins className="w-5 h-5 text-accent" />
              {isOwner ? "Unlimited (Owner)" : `${userCredits} ${userCredits === 1 ? "Credit" : "Credits"}`}
            </p>
          </div>
          {!isOwner && userCredits < 1.5 && (
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-accent/15 border border-accent/30 text-accent font-bold text-xs hover:bg-accent/25 transition-colors"
            >
              Watch to Earn &rarr;
            </Link>
          )}
        </div>

        {/* Daily Limit with Two-Colored Bar */}
        <div className="p-4 rounded-2xl bg-surface border border-line space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted">Today&apos;s Posts</span>
            <span className="text-[11px] text-muted flex items-center gap-1">
              <Clock className="w-3 h-3 text-accent" />
              Resets in {countdownString || "06h 00m"} (Every 6h)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-fg">
              {isOwner ? (
                <span className="text-warning">Unlimited (Owner)</span>
              ) : (
                <span>
                  {limitStats?.postsUsedToday || 0} / {effectiveTotalLimit} Used
                  {limitStats && limitStats.bonusSlotsEarned > 0 && (
                    <span className="text-warning font-bold ml-1.5">
                      (+{limitStats.bonusSlotsEarned} bonus earned)
                    </span>
                  )}
                </span>
              )}
            </span>
            {user?.role === "vip" && (
              <span className="text-[10px] font-bold text-accent">VIP Member (20 base)</span>
            )}
            {user?.role === "user" && (
              <span className="text-[10px] font-bold text-muted">Base: 1 / day</span>
            )}
          </div>

          {/* TWO-COLORED PROGRESS BAR (Flat solid colors) */}
          {!isOwner && limitStats && !limitStats.isUnlimited && (
            <div className="w-full h-2 rounded-full bg-surface2 overflow-hidden flex">
              {/* Base used percentage */}
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    ((limitStats.postsUsedToday || 0) / (limitStats.baseLimit || 5)) * 100
                  )}%`,
                }}
              />
              {/* Bonus slots representation if earned */}
              {limitStats.bonusSlotsEarned > 0 && (
                <div
                  className="h-full bg-warning transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (limitStats.bonusSlotsEarned / effectiveTotalLimit) * 100
                    )}%`,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* OWNER BONUS UNLOCK BANNER */}
      {!isOwner && bonusRemaining > 0 && (
        <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-warning/20 border border-warning/40 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-warning fill-warning" />
            </div>
            <div>
              <p className="text-xs font-bold text-warning">
                Unlock up to +{bonusRemaining} more uploads today!
              </p>
              <p className="text-[11px] text-muted">
                Watch verified Owner clips on the feed: each verified Owner clip grants{" "}
                <span className="text-warning font-bold">+2 extra post slots</span> and{" "}
                <span className="text-warning font-bold">+2 free credits</span>.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="shrink-0 px-3 py-1.5 rounded-xl bg-warning/20 hover:bg-warning/30 border border-warning/40 text-warning font-bold text-xs transition-colors"
          >
            Watch Owner Clips &rarr;
          </Link>
        </div>
      )}

      {limitHit && (
        <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-danger">
              You&apos;ve hit today&apos;s limit of {effectiveTotalLimit} posts.
            </p>
            <p className="text-xs text-muted">
              Your upload limit refreshes every 6 hours (in {countdownString || "06h 00m"}). {bonusRemaining > 0 ? "Watch Owner clips to unlock more slots, or upgrade" : "Upgrade"} to VIP for 20 posts per cycle.
            </p>
            <Link
              href="/upgrade"
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-accent-fg font-bold text-xs hover:opacity-90 transition-opacity"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Upgrade to VIP</span>
            </Link>
          </div>
        </div>
      )}

      {/* MAIN UPLOAD FORM & LIVE 9:16 PREVIEW SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM (2 cols) */}
        <div className="lg:col-span-2 space-y-6 p-6 sm:p-7 rounded-2xl bg-surface border border-line shadow-xl">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* LINK INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-fg flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-accent" />
                <span>Video Clip URL</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://www.tiktok.com/@creator/video/... or youtube.com/shorts/..."
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    handleFetchMetadata(e.target.value);
                  }}
                  onBlur={() => handleFetchMetadata(url)}
                  className="w-full px-4 py-3 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
                {loadingMeta && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] text-accent font-medium">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Auto-detecting...</span>
                  </div>
                )}
              </div>
            </div>

            {/* TITLE INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-fg">
                Clip Title
              </label>
              <input
                type="text"
                placeholder="Give your clip an engaging headline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* CATEGORY SELECTOR */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-fg">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-accent text-accent-fg border-accent font-bold shadow-sm"
                          : "bg-surface2 border-line text-muted hover:text-fg hover:bg-surface2/80"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CLIP SOURCE TAG */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-fg flex items-center justify-between">
                <span>Clip Source / Creator (Optional)</span>
                <span className="text-[10px] text-muted lowercase">e.g. Joe Rogan, Kai Cenat, Tarik</span>
              </label>
              <input
                type="text"
                placeholder="Name of the original streamer or podcast..."
                value={sourceTag}
                onChange={(e) => setSourceTag(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* FALLBACK THUMBNAIL URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-fg flex items-center justify-between">
                <span>Custom 9:16 Thumbnail URL (Optional)</span>
                <span className="text-[10px] text-muted">Auto-detected if left empty</span>
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* INSUFFICIENT CREDITS WARNING BANNER */}
            {!isOwner && userCredits < 1.5 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Coins className="w-4 h-4" />
                  <span>Insufficient Credits to Post (Need 1.5 Credits)</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  You currently have <strong className="text-fg">{userCredits} credits</strong>. To upload, watch either <strong className="text-amber-400">Owner clips (+2 credits)</strong> or <strong className="text-fg">community clips (+1 credit)</strong> for 13+ seconds and like them!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors"
                >
                  <span>Watch Clips on Feed to Earn Credits &rarr;</span>
                </Link>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting || limitHit || (!isOwner && userCredits < 1.5)}
              className="w-full py-3.5 px-6 rounded-xl bg-accent text-accent-fg font-extrabold text-sm tracking-wide uppercase shadow-md hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Submitting to Feed...</span>
                </>
              ) : !isOwner && userCredits < 1.5 ? (
                <>
                  <Coins className="w-4 h-4" />
                  <span>Need 1.5 Credits (Watch Clips to Earn)</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>
                    Post Clip {isOwner ? "(Owner Unlimited)" : "(Costs 1.5 Credits)"}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 9:16 LIVE PREVIEW CARD & PLAYER (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Live Feed Preview
            </span>
            <div className="flex items-center gap-1 bg-surface2 p-0.5 rounded-lg border border-line">
              <button
                type="button"
                onClick={() => setPreviewMode("thumbnail")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                  previewMode === "thumbnail"
                    ? "bg-accent text-accent-fg shadow-sm"
                    : "text-muted hover:text-fg"
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>Thumbnail</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("player")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                  previewMode === "player"
                    ? "bg-accent text-accent-fg shadow-sm"
                    : "text-muted hover:text-fg"
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Live Player</span>
              </button>
            </div>
          </div>

          <div className="w-[230px] sm:w-[250px] mx-auto">
            <div className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden border-2 border-line bg-black shadow-2xl group">
              {previewMode === "player" && previewInfo.previewUrl ? (
                <div className="w-full h-full relative bg-black flex flex-col justify-center items-center">
                  {previewInfo.type === "video" ? (
                    <video
                      src={previewInfo.previewUrl}
                      controls
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <iframe
                      src={previewInfo.previewUrl}
                      title="Live Preview Player"
                      className="w-full h-full object-cover border-0 scale-105"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  )}

                  {/* Top Live Player Pill */}
                  <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-black uppercase text-white border border-white/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span>Live Player</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewMode("thumbnail")}
                    className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-black/80 hover:bg-black text-[9px] font-bold text-white/90 border border-white/20 transition-colors"
                  >
                    Card View
                  </button>
                </div>
              ) : (
                <>
                  {/* OFFICIAL VIDEO THUMBNAIL OR LOADING COVER */}
                  {loadingMeta ? (
                    <div className="w-full h-full bg-surface2/90 flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <Sparkles className="w-7 h-7 text-accent animate-spin" />
                      <span className="text-[11px] font-extrabold text-fg tracking-wide">
                        Fetching Official {detectedPlatform !== "other" ? detectedPlatform.toUpperCase() : "Video"} Thumbnail...
                      </span>
                      <span className="text-[9px] text-muted">Retrieving authentic cover directly from source CDN</span>
                    </div>
                  ) : thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={thumbnailUrl}
                      alt="Official Video Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-surface2 via-black to-surface flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <VideoIcon className="w-8 h-8 text-accent/60 mb-1" />
                      <span className="text-[11px] font-extrabold text-fg uppercase tracking-wider">
                        Official {detectedPlatform !== "other" ? detectedPlatform.toUpperCase() : "Video"} Preview
                      </span>
                      <span className="text-[9px] text-muted max-w-[170px] leading-tight">
                        Paste your clip URL above to automatically pull the official video thumbnail
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/45 pointer-events-none" />

                  {/* Top platform badge & Official badge */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-surface/90 text-fg border border-line backdrop-blur-md shadow-sm">
                      {detectedPlatform.toUpperCase()}
                    </span>
                    {thumbnailUrl && !thumbnailUrl.includes("unsplash") && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Official Cover</span>
                      </span>
                    )}
                  </div>

                  {/* Center Play Button Overlay */}
                  {previewInfo.previewUrl && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("player")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/75 hover:bg-black/95 text-white border border-white/30 text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 shadow-xl group-hover:scale-110"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Play Live Preview</span>
                      </button>
                    </div>
                  )}

                  {/* Bottom details overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-3 space-y-1.5 z-10 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-surface2/90 text-[9px] font-bold text-muted capitalize border border-line backdrop-blur-md">
                        {category}
                      </span>
                      {sourceTag && (
                        <span className="text-[9px] text-zinc-300 font-medium truncate max-w-[100px]">
                          via {sourceTag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-black text-white line-clamp-2 leading-tight drop-shadow-sm">
                      {title || "Your viral clip headline preview will appear here"}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-zinc-300 border-t border-white/10">
                      <span className="truncate font-semibold">@{user?.nickname || user?.name || "You"}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* OFFICIAL THUMBNAIL QUICK ACTIONS */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block text-center sm:text-left">
              Official Thumbnail Actions
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => handleFetchMetadata(url)}
                disabled={!url || loadingMeta}
                className="px-3 py-2 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/30 text-accent font-extrabold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                title="Fetch the official video cover directly from TikTok or YouTube"
              >
                <RefreshCw className={`w-3 h-3 ${loadingMeta ? "animate-spin" : ""}`} />
                <span>Auto-Fetch Official</span>
              </button>
              <button
                type="button"
                onClick={() => setThumbnailUrl("")}
                disabled={!thumbnailUrl}
                className="px-3 py-2 rounded-xl bg-surface2 hover:bg-line border border-line text-muted hover:text-fg font-bold text-center transition-colors disabled:opacity-50"
                title="Clear current thumbnail to re-fetch"
              >
                Reset Thumbnail
              </button>
            </div>
          </div>

          {/* Ad slot below preview */}
          <AdSlot type="postBanner" />
        </div>
      </div>
    </div>
  );
}
