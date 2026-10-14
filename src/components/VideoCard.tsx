"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Flame,
  Crown,
  Sparkles,
  CheckCircle2,
  Eye,
  Heart,
  Radio,
  Gamepad2,
  Tv,
  Film,
  Sparkle,
  Zap,
} from "lucide-react";
import { Video } from "@/types";
import { siteConfig } from "@/config/site";
import { useApp } from "@/context/AppContext";

interface VideoCardProps {
  video: Video;
  isWatched?: boolean;
  onReportClick?: (video: Video) => void;
  className?: string;
  isFresh?: boolean;
}

export function VideoCard({
  video,
  isWatched = false,
  className = "",
  isFresh = false,
}: VideoCardProps) {
  const { user, startEngagement } = useApp();
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const platformInfo =
    siteConfig.platforms.find((p) => p.id === video.platform) ||
    siteConfig.platforms[siteConfig.platforms.length - 1];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startEngagement(video);
  };

  const isVipWatchingVip =
    user?.role === "vip" && video.userRole === "vip" && !video.isOwnerVideo;

  // Category Icon lookup
  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case "podcast":
        return <Radio className="w-2.5 h-2.5" />;
      case "gaming":
        return <Gamepad2 className="w-2.5 h-2.5" />;
      case "streamer":
        return <Tv className="w-2.5 h-2.5" />;
      case "anime":
        return <Sparkle className="w-2.5 h-2.5" />;
      case "movies":
        return <Film className="w-2.5 h-2.5" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`group relative flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden border select-none transition-all duration-200 ${
        video.isOwnerVideo
          ? "border-warning/70 hover:border-warning shadow-md shadow-warning/10"
          : video.isPinned
          ? "border-danger/60 hover:border-danger shadow-md shadow-danger/10"
          : video.userRole === "vip"
          ? "border-accent/60 hover:border-accent shadow-md shadow-accent/10"
          : isFresh
          ? "border-success/60 hover:border-success shadow-md shadow-success/10"
          : isWatched
          ? "border-line opacity-75 hover:opacity-100"
          : "border-line hover:border-accent"
      } bg-surface ${className}`}
    >
      {/* 9:16 VERTICAL SHORTS THUMBNAIL CONTAINER */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-surface2">
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          /* Solid surface fallback if image fails to load */
          <div className="w-full h-full bg-surface2 flex flex-col items-center justify-center p-3 text-center">
            <Play className="w-8 h-8 text-muted mb-2" />
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider line-clamp-2">
              {video.category || "Clip"}
            </span>
          </div>
        )}

        {/* Soft vignette overlays strictly for text readability over thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40 pointer-events-none" />

        {/* TOP STATUS BADGES */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1 z-10">
          {/* Platform Badge (Solid pill) */}
          <span
            className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border border-white/20 bg-black/60 text-white shadow-sm"
          >
            {platformInfo.name}
          </span>

          {/* Section Badges */}
          <div className="flex flex-col items-end gap-1">
            {video.isOwnerVideo && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-warning text-black shadow-sm flex items-center gap-1 border border-warning/50">
                <Crown className="w-2.5 h-2.5 fill-black" />
                <span>Bonus +2</span>
              </span>
            )}

            {video.isPinned && !video.isOwnerVideo && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-danger text-white shadow-sm flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-white" />
                <span>Pinned</span>
              </span>
            )}

            {video.userRole === "vip" && !video.isOwnerVideo && !video.isPinned && (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-accent text-accent-fg flex items-center gap-0.5 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" />
                <span>VIP</span>
              </span>
            )}

            {isFresh && !video.isOwnerVideo && !video.isPinned && (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-success text-white shadow-sm">
                New
              </span>
            )}

            {isWatched && (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-black/80 border border-white/20 text-emerald-300 flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>Watched</span>
              </span>
            )}
          </div>
        </div>

        {/* HOVER "WATCH & EARN" SLIDE-IN BUTTON */}
        <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none">
          <motion.div
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.88,
              y: isHovered ? 0 : 10,
            }}
            transition={{ duration: 0.15 }}
            className={`px-3 py-2 rounded-xl font-extrabold text-[10px] tracking-wide uppercase shadow-lg flex items-center gap-1.5 pointer-events-auto border ${
              video.isOwnerVideo
                ? "bg-warning text-black border-warning font-black"
                : isVipWatchingVip
                ? "bg-surface2 text-muted border-line"
                : "bg-accent text-accent-fg border-accent"
            }`}
          >
            {video.isOwnerVideo ? (
              <>
                <Zap className="w-3 h-3 fill-black text-black" />
                <span>Watch & Earn +2 Slots</span>
              </>
            ) : isVipWatchingVip ? (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Watch (No VIP Reward)</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Watch & Earn +1</span>
              </>
            )}
          </motion.div>
        </div>

        {/* BOTTOM METADATA OVERLAY (Compact Shorts details) */}
        <div className="absolute bottom-0 inset-x-0 p-2.5 space-y-1.5 z-10">
          {/* Category Chip or Source Tag */}
          <div className="flex items-center gap-1">
            {video.category && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] font-bold text-white capitalize">
                {getCategoryIcon(video.category)}
                <span>{video.category}</span>
              </span>
            )}
            {video.sourceTag && (
              <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-white text-[9px] font-semibold truncate max-w-[85px]">
                {video.sourceTag}
              </span>
            )}
            {isVipWatchingVip && (
              <span className="px-1 py-0.5 rounded bg-black/70 text-zinc-300 text-[8px] font-medium truncate">
                VIP clips: 0 reward
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-bold text-xs text-white line-clamp-2 leading-snug drop-shadow-sm group-hover:text-zinc-100 transition-colors">
            {video.title}
          </h4>

          {/* Creator & Stats Row */}
          <div className="flex items-center justify-between pt-1 border-t border-white/15 text-[10px] text-zinc-300">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.userAvatar}
                alt={video.userName}
                className="w-4 h-4 rounded-full object-cover ring-1 ring-white/20 shrink-0"
              />
              <span className="truncate max-w-[65px] font-medium text-white">
                {video.userName}
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-300 shrink-0">
              <span className="flex items-center gap-0.5">
                <Eye className="w-2.5 h-2.5" />
                {video.viewsCount || 0}
              </span>
              <span className="flex items-center gap-0.5 text-rose-300">
                <Heart className="w-2.5 h-2.5 fill-rose-400/50" />
                {video.engagementsCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
