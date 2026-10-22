"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pin,
  Flame,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  Copy,
  Check,
  Zap,
  Shuffle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface PinVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PinVideoModal({ isOpen, onClose }: PinVideoModalProps) {
  const { user, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [clipLink, setClipLink] = useState("");

  if (!isOpen) return null;

  const instaProfile = "https://www.instagram.com/gaurabb_adk/";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(instaProfile);
    setCopied(true);
    showToast("Instagram link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-surface border-2 border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 space-y-6 text-fg overflow-hidden"
        >
          {/* Top amber accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted hover:text-fg rounded-xl hover:bg-surface2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>48-Hour Priority Showcase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-fg tracking-tight">
              Pin Your Video for 48 Hours
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
              Guarantee maximum community views, watch time, and authentic algorithmic likes by featuring your clip at the top of ClipEarn!
            </p>
          </div>

          {/* INSTAGRAM MSG CALLOUT BANNER */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 font-black text-xs text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>How to Pin Your Clip:</span>
            </div>
            <p className="text-xs text-fg leading-relaxed">
              Message on Instagram for <strong>48 hours of pinned video</strong>! Send your clip link directly to owner profile:
            </p>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-surface border border-line">
              <a
                href={instaProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-pink-400 hover:text-pink-300 underline truncate flex items-center gap-1.5"
              >
                <span>https://www.instagram.com/gaurabb_adk/</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 rounded-lg bg-surface2 border border-line hover:border-accent text-[11px] font-semibold text-muted hover:text-fg shrink-0 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* PERKS LIST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface2 border border-line space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-fg">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>48 Hours Duration</span>
              </div>
              <p className="text-[11px] text-muted">
                Full 48 hours of uninterrupted placement from the moment of confirmation.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface2 border border-line space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-fg">
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>Fair Pinned Rotation</span>
              </div>
              <p className="text-[11px] text-muted">
                Pinned videos shuffle every 3 minutes among pinned clips so every pinned creator gets top exposure.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface2 border border-line space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-fg">
                <Flame className="w-3.5 h-3.5 text-warning fill-warning" />
                <span>Glowing Flame Badge</span>
              </div>
              <p className="text-[11px] text-muted">
                Highlighted with glowing badges and boosted indicators on the community feed.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface2 border border-line space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-fg">
                <Zap className="w-3.5 h-3.5 text-success" />
                <span>Instant Activation</span>
              </div>
              <p className="text-[11px] text-muted">
                Direct DM confirmation with owner on Instagram for immediate activation.
              </p>
            </div>
          </div>

          {/* OPTIONAL CLIP URL INPUT TO CARRY ALONG */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-fg block">
              Enter your clip link to send:
            </label>
            <input
              type="url"
              value={clipLink}
              onChange={(e) => setClipLink(e.target.value)}
              placeholder="https://www.tiktok.com/@user/video/... or YouTube Shorts link"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-2 pt-1">
            <a
              href={instaProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>Message @gaurabb_adk on Instagram for 48h Pin &rarr;</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-surface2 hover:bg-line border border-line text-xs font-bold text-muted hover:text-fg transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
