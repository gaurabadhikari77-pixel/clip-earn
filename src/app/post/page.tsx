"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { AdSlot } from "@/components/AdSlot";
import { ClipCategory } from "@/types";
import { clientApi } from "@/lib/client-api";
import { fetchVideoMetadata } from "@/lib/video-parser";

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

  const isOwner = user?.role === "owner";
  const userCredits = isOwner ? 9999 : (user?.credits ?? user?.postCredits ?? 0);

  // Live countdown to 6:00 AM reset
  useEffect(() => {
    if (!limitStats?.nextReset) return;
    const interval = setInterval(() => {
      const target = new Date(limitStats.nextReset).getTime();
      const diff = Math.max(0, target - Date.now());
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdownString(`${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m`);
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
        if (data.thumbnailUrl && !thumbnailUrl) setThumbnailUrl(data.thumbnailUrl);
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

    if (!isOwner && userCredits <= 0) {
      setErrorMsg("You need at least 1 post credit. Watch and support a clip on the feed to earn 1 credit!");
      return;
    }

    if (!isOwner && limitStats && !limitStats.isUnlimited) {
      if (limitStats.postsUsedToday >= limitStats.totalLimit) {
        setErrorMsg("You've hit today's posting limit. Resets at 6:00 AM.");
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await clientApi.postVideo({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
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
                Continue with Google to get 2 initial post credits and start uploading clips.
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
            <span className="text-xs font-semibold text-muted">Available Credits</span>
            <p className="text-xl font-black text-fg flex items-center gap-2">
              <Coins className="w-5 h-5 text-accent" />
              {isOwner ? "Unlimited (Owner)" : `${userCredits} ${userCredits === 1 ? "Credit" : "Credits"}`}
            </p>
          </div>
          {!isOwner && userCredits === 0 && (
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
              Resets at 6:00 AM ({countdownString || "06h 00m"})
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
              <span className="text-[10px] font-bold text-muted">Base: 5 / day</span>
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
              Your limit resets at 6:00 AM. {bonusRemaining > 0 ? "Watch Owner clips to unlock more slots, or upgrade" : "Upgrade"} to VIP for 20 posts per day.
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

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting || limitHit || (!isOwner && userCredits <= 0)}
              className="w-full py-3.5 px-6 rounded-xl bg-accent text-accent-fg font-extrabold text-sm tracking-wide uppercase shadow-md hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Submitting to Feed...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>
                    Post Clip {isOwner ? "(Owner Unlimited)" : "(Costs 1 Credit)"}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 9:16 LIVE PREVIEW CARD (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Live Feed Preview
            </span>
            <span className="text-[10px] text-muted">9:16 Vertical Shorts</span>
          </div>

          <div className="w-[200px] mx-auto sm:mx-0">
            <div className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden border border-line bg-surface shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  thumbnailUrl ||
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
                }
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50" />

              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-surface text-fg border border-line">
                  {detectedPlatform.toUpperCase()}
                </span>
              </div>

              <div className="absolute bottom-0 inset-x-0 p-3 space-y-1">
                <span className="px-1.5 py-0.5 rounded bg-surface2 text-[9px] font-bold text-muted capitalize border border-line">
                  {category}
                </span>
                <p className="text-xs font-bold text-white line-clamp-2">
                  {title || "Your viral clip headline preview will appear here"}
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-zinc-300 border-t border-white/10">
                  <span className="truncate">{user?.name || "You"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ad slot below preview */}
          <AdSlot type="postBanner" />
        </div>
      </div>
    </div>
  );
}
