"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Crown, Flame, Image, Tag, Tv } from "lucide-react";
import { Video, ClipCategory, PlatformType } from "@/types";
import { useApp } from "@/context/AppContext";
import { clientApi } from "@/lib/client-api";

interface EditVideoModalProps {
  video: Video | null;
  onClose: () => void;
  onSaved?: (updated: Video) => void;
}

export function EditVideoModal({ video, onClose, onSaved }: EditVideoModalProps) {
  const { showToast } = useApp();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ClipCategory>("podcast");
  const [platform, setPlatform] = useState<PlatformType>("tiktok");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sourceTag, setSourceTag] = useState("");
  const [isOwnerVideo, setIsOwnerVideo] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (video) {
      setTitle(video.title || "");
      setCategory(video.category || "podcast");
      setPlatform(video.platform || "tiktok");
      setThumbnailUrl(video.thumbnailUrl || "");
      setSourceTag(video.sourceTag || "");
      setIsOwnerVideo(!!video.isOwnerVideo);
      setIsPinned(!!video.isPinned);
    }
  }, [video]);

  if (!video) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await clientApi.updateVideo(video.id, {
        title: title.trim() || video.title,
        category,
        platform,
        thumbnailUrl: thumbnailUrl.trim() || video.thumbnailUrl,
        sourceTag: sourceTag.trim() || undefined,
        isOwnerVideo,
        isPinned,
        pinnedUntil: isPinned
          ? video.pinnedUntil || new Date(Date.now() + 24 * 3600 * 1000).toISOString()
          : null,
      });

      if (updated) {
        showToast("Video updated successfully!", "success");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("clipearn_video_updated", { detail: { videoId: video.id } })
          );
        }
        if (onSaved) onSaved(updated);
      }
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to save video changes", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl bg-surface border border-line p-6 shadow-2xl space-y-5 text-fg my-8"
        >
          {/* Accent top stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent rounded-t-2xl" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2 font-black text-base text-fg">
              <Pencil className="w-4 h-4 text-accent" />
              <span>Edit Video (Owner Controls)</span>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-surface2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Title */}
            <div className="space-y-1">
              <label className="font-bold text-fg block">Video Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Clip headline or description..."
                className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Category & Platform */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-fg block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ClipCategory)}
                  className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-xs text-fg focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="podcast">Podcast</option>
                  <option value="gaming">Gaming</option>
                  <option value="streamer">Streamer</option>
                  <option value="anime">Anime</option>
                  <option value="movies">Movies & TV</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-fg block">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformType)}
                  className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-xs text-fg focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube Shorts</option>
                  <option value="instagram">Instagram Reels</option>
                  <option value="twitter">X / Twitter</option>
                  <option value="twitch">Twitch Clip</option>
                  <option value="kick">Kick Clip</option>
                </select>
              </div>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-1">
              <label className="font-bold text-fg flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-muted" />
                <span>Thumbnail Image URL</span>
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Source Tag / Creator Handle */}
            <div className="space-y-1">
              <label className="font-bold text-fg flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-muted" />
                <span>Source Tag / Origin Creator</span>
              </label>
              <input
                type="text"
                value={sourceTag}
                onChange={(e) => setSourceTag(e.target.value)}
                placeholder="@streamer or channel name"
                className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Checkboxes: Owner Spotlight & Pinned */}
            <div className="p-3 rounded-xl bg-surface2 border border-line space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-fg">
                <input
                  type="checkbox"
                  checked={isOwnerVideo}
                  onChange={(e) => setIsOwnerVideo(e.target.checked)}
                  className="w-4 h-4 rounded text-warning focus:ring-warning"
                />
                <span className="flex items-center gap-1 text-warning">
                  <Crown className="w-3.5 h-3.5 fill-warning" />
                  <span>Feature in Official Owner Spotlight (+2 Bonus Slots per viewer)</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-fg">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-danger focus:ring-danger"
                />
                <span className="flex items-center gap-1 text-danger">
                  <Flame className="w-3.5 h-3.5 fill-danger" />
                  <span>Pin to Showcase Section</span>
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-surface2 border border-line text-muted hover:text-fg font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-accent hover:opacity-90 text-accent-fg font-extrabold shadow-sm transition-opacity disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
