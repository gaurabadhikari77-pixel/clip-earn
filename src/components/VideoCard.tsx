"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  MoreVertical,
  Pencil,
  Trash2,
  Ban,
  Copy,
} from "lucide-react";
import { Video } from "@/types";
import { siteConfig, isOwnerEmail } from "@/config/site";
import { useApp } from "@/context/AppContext";
import { clientApi } from "@/lib/client-api";
import { getLivePreviewInfo } from "@/lib/video-parser";
import { EditVideoModal } from "./EditVideoModal";

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
  const { user, startEngagement, showToast } = useApp();
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isOwner = user?.role === "owner" || (user?.email && isOwnerEmail(user.email));

  const platformInfo =
    siteConfig.platforms.find((p) => p.id === video.platform) ||
    siteConfig.platforms[siteConfig.platforms.length - 1];

  const previewInfo = useMemo(() => {
    return getLivePreviewInfo(video.url, video.platform);
  }, [video.url, video.platform]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (previewInfo.previewUrl && !isWatched) {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(() => {
        setIsPlayingPreview(true);
      }, 350);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsPlayingPreview(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startEngagement(video);
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOwnerMenu(false);
    try {
      if (video.isPinned) {
        await clientApi.unpinVideo(video.id);
        showToast("Clip unpinned from Showcase.", "info");
      } else {
        await clientApi.pinVideo(video.id, 24);
        showToast("Clip pinned to Showcase for 24 hours!", "success");
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("clipearn_video_updated", { detail: { videoId: video.id } })
        );
      }
    } catch {
      showToast("Error updating pin state", "error");
    }
  };

  const handleToggleSpotlight = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOwnerMenu(false);
    try {
      await clientApi.toggleOwnerVideo(video.id);
      showToast(
        video.isOwnerVideo
          ? "Removed from Official Owner Spotlight"
          : "Promoted to Official Owner Spotlight (+2 Bonus Slots per viewer)!",
        "success"
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("clipearn_video_updated", { detail: { videoId: video.id } })
        );
      }
    } catch {
      showToast("Error updating spotlight status", "error");
    }
  };

  const handleBanUser = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOwnerMenu(false);
    if (
      !confirm(
        `Are you sure you want to ban creator "${video.userName}" and hide all clips posted by this creator?`
      )
    ) {
      return;
    }
    try {
      await clientApi.banUser(video.userId);
      showToast(`Creator @${video.userName} has been banned. All clips hidden.`, "success");
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("clipearn_video_updated", { detail: { videoId: video.id } })
        );
      }
    } catch {
      showToast("Failed to ban user", "error");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOwnerMenu(false);
    if (!confirm(`Are you sure you want to permanently delete "${video.title}"?`)) {
      return;
    }
    try {
      await clientApi.deleteVideo(video.id);
      showToast("Clip deleted permanently.", "success");
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("clipearn_video_updated", { detail: { videoId: video.id } })
        );
      }
    } catch {
      showToast("Failed to delete clip", "error");
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOwnerMenu(false);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(video.url);
      showToast("Video link copied to clipboard!", "success");
    }
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

        {/* LIVE THUMBNAIL PREVIEW (YouTube, TikTok, Instagram Reels, MP4) */}
        {isPlayingPreview && previewInfo.previewUrl && (
          <div className="absolute inset-0 z-10 bg-black overflow-hidden pointer-events-none transition-opacity duration-300">
            {previewInfo.type === "video" ? (
              <video
                src={previewInfo.previewUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <iframe
                src={previewInfo.previewUrl}
                title={video.title}
                className="w-full h-full object-cover pointer-events-none border-0 scale-105"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            )}

            {/* LIVE PREVIEW BADGE */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/85 backdrop-blur-md text-[9px] font-black uppercase text-white border border-white/20 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>Live Preview</span>
            </div>

            {/* PREVIEW PROGRESS BAR */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 overflow-hidden">
              <div className="h-full bg-accent animate-pulse w-full" />
            </div>
          </div>
        )}

        {/* Soft vignette overlays strictly for text readability over thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40 pointer-events-none" />

        {/* TOP STATUS BADGES & OWNER CONTROLS */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1 z-20">
          {/* Platform Badge (Solid pill) */}
          <span
            className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border border-white/20 bg-black/60 text-white shadow-sm"
          >
            {platformInfo.name}
          </span>

          {/* Section Badges + Owner Three-Dots Button */}
          <div className="flex items-start gap-1.5">
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

            {/* THREE DOTS ON OWNER'S VIEW */}
            {isOwner && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOwnerMenu((prev) => !prev);
                  }}
                  className="p-1 rounded-md bg-black/75 hover:bg-black text-white/90 hover:text-white border border-white/30 transition-all shadow-md active:scale-90"
                  title="Owner Controls (Pin, Edit, Delete, Ban)"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* Owner Actions Dropdown Menu */}
                {showOwnerMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOwnerMenu(false);
                      }}
                    />
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-1 w-48 rounded-xl bg-surface border border-line p-1 shadow-2xl z-50 text-xs text-fg space-y-0.5"
                    >
                      <div className="px-2 py-1 border-b border-line text-[10px] font-black uppercase tracking-wider text-muted flex items-center justify-between">
                        <span>Owner Controls</span>
                        <Crown className="w-3 h-3 text-warning" />
                      </div>

                      {/* Pin / Unpin */}
                      <button
                        type="button"
                        onClick={handleTogglePin}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface2 text-left font-semibold text-fg transition-colors"
                      >
                        <Flame className="w-3.5 h-3.5 text-danger shrink-0" />
                        <span>{video.isPinned ? "Unpin Clip" : "Pin Clip (24h)"}</span>
                      </button>

                      {/* Edit Clip */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowOwnerMenu(false);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface2 text-left font-semibold text-fg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span>Edit Clip</span>
                      </button>

                      {/* Toggle Owner Spotlight */}
                      <button
                        type="button"
                        onClick={handleToggleSpotlight}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface2 text-left font-semibold text-fg transition-colors"
                      >
                        <Crown className="w-3.5 h-3.5 text-warning shrink-0" />
                        <span className="truncate">
                          {video.isOwnerVideo ? "Remove Spotlight" : "Set Owner Spotlight"}
                        </span>
                      </button>

                      {/* Copy URL */}
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface2 text-left font-semibold text-fg transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>Copy URL</span>
                      </button>

                      <div className="border-t border-line my-0.5" />

                      {/* Ban Creator */}
                      <button
                        type="button"
                        onClick={handleBanUser}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-danger/10 text-danger text-left font-semibold transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Ban @{video.userName}</span>
                      </button>

                      {/* Delete Clip */}
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-danger/10 text-danger text-left font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Delete Clip</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
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
              <span className="flex items-center gap-0.5 text-rose-300" title="Likes">
                <Heart className="w-2.5 h-2.5 fill-rose-400/50" />
                {video.likesCount ?? video.engagementsCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* OWNER EDIT MODAL */}
      {isOwner && isEditModalOpen && (
        <EditVideoModal
          video={video}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </motion.div>
  );
}
