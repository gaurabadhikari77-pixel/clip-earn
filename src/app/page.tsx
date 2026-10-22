"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crown,
  Flame,
  Sparkles,
  Users,
  Compass,
  Radio,
  Gamepad2,
  Tv,
  Film,
  Sparkle,
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { Video, ClipCategory } from "@/types";
import { siteConfig } from "@/config/site";
import { useApp } from "@/context/AppContext";
import { VideoCard } from "@/components/VideoCard";
import { ClipRow } from "@/components/ClipRow";
import { AdSlot } from "@/components/AdSlot";
import { ReportModal } from "@/components/ReportModal";
import { clientApi } from "@/lib/client-api";

export default function FeedPage() {
  const { user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [reportTargetVideo, setReportTargetVideo] = useState<Video | null>(null);

  const [sections, setSections] = useState<{
    owner: Video[];
    pinnedAndVip: Video[];
    fresh: Video[];
    community: Video[];
    watched: Video[];
  }>({
    owner: [],
    pinnedAndVip: [],
    fresh: [],
    community: [],
    watched: [],
  });

  const [watchedIds, setWatchedIds] = useState<string[]>([]);

  const fetchClips = async () => {
    try {
      setLoading(true);
      const data = await clientApi.getVideos({
        platform: selectedPlatform !== "all" ? selectedPlatform : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        userId: user?.id,
      });
      setSections(data.sections || {});
      setWatchedIds(data.watchedVideoIds || []);
    } catch (e) {
      console.error("Error loading feed clips:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClips();
  }, [selectedCategory, selectedPlatform, user?.id]);

  // Remove engaged video in real time from this viewer's feed
  useEffect(() => {
    const handleEngagementVerified = (e: any) => {
      const vid = e.detail?.videoId;
      if (!vid) return;
      setSections((prev) => ({
        owner: prev.owner ? prev.owner.filter((v) => v.id !== vid) : [],
        pinnedAndVip: prev.pinnedAndVip ? prev.pinnedAndVip.filter((v) => v.id !== vid) : [],
        fresh: prev.fresh ? prev.fresh.filter((v) => v.id !== vid) : [],
        community: prev.community ? prev.community.filter((v) => v.id !== vid) : [],
        watched: [],
      }));
    };

    window.addEventListener("clipearn_engagement_verified", handleEngagementVerified);
    return () => window.removeEventListener("clipearn_engagement_verified", handleEngagementVerified);
  }, []);

  const watchedSet = useMemo(() => new Set(watchedIds), [watchedIds]);

  const categories = [
    { id: "all", label: "All Clips", icon: Compass },
    { id: "podcast", label: "Podcasts", icon: Radio },
    { id: "gaming", label: "Gaming", icon: Gamepad2 },
    { id: "streamer", label: "Streamers", icon: Tv },
    { id: "anime", label: "Anime", icon: Sparkle },
    { id: "movies", label: "Movies & TV", icon: Film },
  ];

  return (
    <div className="w-full min-h-screen py-5 px-3 sm:px-6 lg:px-8 space-y-8 max-w-[1600px] mx-auto pb-24 lg:pb-12">
      {/* TOP AD BANNER */}
      <AdSlot type="topBanner" />

      {/* QUICK CATEGORY CHIPS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-accent text-accent-fg shadow-sm"
                  : "bg-surface border border-line text-muted hover:text-fg hover:bg-surface2"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}

        {/* Separator */}
        <div className="h-5 w-px bg-line mx-1 shrink-0" />

        {/* Platform filter pills */}
        <button
          onClick={() => setSelectedPlatform("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            selectedPlatform === "all"
              ? "bg-fg text-bg"
              : "bg-surface border border-line text-muted hover:text-fg hover:bg-surface2"
          }`}
        >
          All Platforms
        </button>
        {siteConfig.platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlatform(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedPlatform === p.id
                ? "bg-accent text-accent-fg shadow-sm"
                : "bg-surface border border-line text-muted hover:text-fg hover:bg-surface2"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-48 rounded-2xl bg-surface2 border border-line" />
          <div className="h-64 rounded-2xl bg-surface2 border border-line" />
        </div>
      ) : (() => {
        const totalClips =
          (sections.owner?.length || 0) +
          (sections.pinnedAndVip?.length || 0) +
          (sections.fresh?.length || 0) +
          (sections.community?.length || 0) +
          (sections.watched?.length || 0);

        if (totalClips === 0) {
          return (
            <div className="space-y-8">
              {/* EMPTY STATE HERO CARD */}
              <div className="w-full bg-surface border border-line rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-sm">
                <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mx-auto shadow-inner">
                    <Sparkles className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 inline-block">
                      Community Feed Ready
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-fg tracking-tight">
                      No Clips Posted Yet
                    </h2>
                    <p className="text-sm sm:text-base text-muted max-w-lg mx-auto leading-relaxed">
                      Be the pioneer creator to post your first short or reel! Gain genuine views from real clippers and earn watch-to-post credits.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Link
                      href="/post"
                      className="px-6 py-3.5 rounded-xl bg-accent hover:opacity-95 text-accent-fg font-extrabold text-sm flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Post Your First Clip</span>
                    </Link>

                    {(selectedCategory !== "all" || selectedPlatform !== "all") && (
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setSelectedPlatform("all");
                        }}
                        className="px-5 py-3.5 rounded-xl bg-surface2 hover:bg-line border border-line text-fg font-bold text-sm transition-colors"
                      >
                        Reset Category Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* THREE CORE CONTENT REWARD VALUE PROPS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-surface border border-line space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-success/15 border border-success/30 text-success flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-fg">Authentic Content Reward</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Watch community clips for at least 13 seconds to earn post credits. Grow retention signals naturally on TikTok, YouTube Shorts, and Reels.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-line space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-fg">Real Views & Engagement</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    ClipEarn empowers video clippers to exchange authentic watch time, earn post credits, and accelerate organic algorithmic reach across TikTok, YouTube Shorts, and Reels.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-line space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-warning/15 border border-warning/30 text-warning flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-fg">Clipper Bonus System</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Engage with verified Owner tutorials to unlock +2 bonus post slots per clip, allowing up to 10 daily uploads for normal users and 30 for VIP members.
                  </p>
                </div>
              </div>

              <AdSlot type="footerBanner" />
            </div>
          );
        }

        return (
          <div className="space-y-10">
            {/* SECTION 1: OWNER SPOTLIGHT (Horizontal row with crown badge) */}
            {sections.owner && sections.owner.length > 0 && (
              <ClipRow
                title="Owner Spotlight"
                subtitle="Official clipper strategies, velocity presets, and masterclasses"
                icon={<Crown className="w-4 h-4 text-warning fill-warning" />}
                badge={
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-warning/15 text-warning border border-warning/30">
                    Official
                  </span>
                }
                clips={sections.owner}
                watchedSet={watchedSet}
                onReportClick={(v) => setReportTargetVideo(v)}
              />
            )}

            {/* SECTION 2: FRESH CLIPS, NEEDS VIEWS (Automatic booster section) */}
            {sections.fresh && sections.fresh.length > 0 && (
              <div id="fresh">
                <ClipRow
                  title="Fresh Clips • Needs Views"
                  subtitle="First-look clips with fewest engagements—watch them to boost fellow clippers!"
                  icon={<Sparkles className="w-4 h-4 text-success" />}
                  badge={
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-success/15 text-success border border-success/30">
                      Auto-Refreshed
                    </span>
                  }
                  clips={sections.fresh}
                  watchedSet={watchedSet}
                  onReportClick={(v) => setReportTargetVideo(v)}
                  isFresh={true}
                />
              </div>
            )}

            {/* SECTION AD SLOT */}
            <AdSlot type="inFeed" />

            {/* SECTION 3: COMMUNITY CLIPS (Vertical Wrapping Grid) */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-surface2 border border-line text-accent">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-fg">
                      Community Clips
                    </h2>
                    <p className="text-xs text-muted font-medium">
                      All clips from indie clippers across TikTok, YouTube, and Instagram
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-muted bg-surface2 px-2.5 py-1 rounded-lg border border-line">
                  {sections.community?.length || 0} clips
                </span>
              </div>

              {/* RESPONSIVE VERTICAL GRID (2 on mobile up to 6 on xl) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {sections.community?.map((clip) => (
                  <VideoCard
                    key={clip.id}
                    video={clip}
                    isWatched={false}
                    onReportClick={(v) => setReportTargetVideo(v)}
                  />
                ))}
              </div>
            </section>

            {/* SECTION 4: PINNED AND VIP (Down at last, only displayed when VIP clips exist) */}
            {sections.pinnedAndVip && sections.pinnedAndVip.length > 0 && (
              <div className="pt-4 border-t border-line">
                <ClipRow
                  title="Pinned & VIP Showcase"
                  subtitle="Promoted clips and top-tier community clippers"
                  icon={<Flame className="w-4 h-4 text-accent fill-accent" />}
                  badge={
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
                      Boosted
                    </span>
                  }
                  seeAllHref="/upgrade"
                  clips={sections.pinnedAndVip}
                  watchedSet={watchedSet}
                  onReportClick={(v) => setReportTargetVideo(v)}
                />
              </div>
            )}
          </div>
        );
      })()}

      {/* REPORT VIDEO MODAL */}
      <ReportModal
        video={reportTargetVideo}
        onClose={() => setReportTargetVideo(null)}
      />
    </div>
  );
}
