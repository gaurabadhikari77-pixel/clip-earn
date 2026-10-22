"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  ThumbsUp,
  MessageSquare,
  UserPlus,
  ExternalLink,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Crown,
  Zap,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { AdSlot } from "./AdSlot";

export function FloatingEngagementTracker() {
  const {
    user,
    activeSession,
    closeEngagement,
    toggleChecklist,
    confirmAndVerifyEngagement,
  } = useApp();

  const [minimized, setMinimized] = useState(false);

  if (!activeSession) return null;

  const {
    video,
    totalTimeAwaySeconds,
    isAway,
    minSecondsRequired,
    hasMetTime,
    liked,
    commented,
    followed,
    isVerifying,
    isVerified,
  } = activeSession;

  const currentSeconds = Math.min(minSecondsRequired, Math.floor(totalTimeAwaySeconds));
  const progressPercent = Math.min(100, (totalTimeAwaySeconds / minSecondsRequired) * 100);

  // SVG Circular progress ring calculations
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const isOwnerClip = video.isOwnerVideo;
  const isVipWatchingVip =
    user?.role === "vip" && video.userRole === "vip" && !video.isOwnerVideo;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed bottom-20 right-3 sm:bottom-5 sm:right-5 z-50 w-[calc(100%-24px)] max-w-sm sm:max-w-md shadow-2xl"
      >
        <div
          className={`relative rounded-3xl bg-surface border p-4 sm:p-5 overflow-hidden shadow-2xl ${
            isOwnerClip ? "border-warning/70" : "border-line"
          }`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isOwnerClip
                      ? "bg-warning"
                      : isAway
                      ? "bg-accent"
                      : "bg-success"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isOwnerClip
                      ? "bg-warning"
                      : isAway
                      ? "bg-accent"
                      : "bg-success"
                  }`}
                />
              </span>
              <h3 className="font-bold text-xs sm:text-sm text-fg tracking-tight flex items-center gap-1.5">
                Engagement Tracker
                {isOwnerClip ? (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-warning text-black uppercase flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5" /> Bonus +2
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-surface2 text-muted border border-line uppercase">
                    {isAway ? "Watching clip..." : "Active"}
                  </span>
                )}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1 rounded-lg text-muted hover:text-fg hover:bg-surface2 transition-colors"
                title={minimized ? "Expand" : "Minimize"}
              >
                {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={closeEngagement}
                className="p-1 rounded-lg text-muted hover:text-danger hover:bg-surface2 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ACTIVE CLIP SNIPPET & CIRCULAR TIMER */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface2 border border-line mb-3">
            {/* Circular Timer Ring */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-line"
                  fill="transparent"
                />
                <circle
                  cx="30"
                  cy="30"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={`transition-all duration-300 ${
                    isOwnerClip
                      ? "text-warning"
                      : hasMetTime
                      ? "text-success"
                      : "text-accent"
                  }`}
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {hasMetTime ? (
                  <CheckCircle2
                    className={`w-5 h-5 ${isOwnerClip ? "text-warning" : "text-success"}`}
                  />
                ) : (
                  <>
                    <span className="text-[11px] font-black text-fg leading-none">
                      {currentSeconds}s
                    </span>
                    <span className="text-[8px] text-muted leading-none mt-0.5">
                      /{minSecondsRequired}s
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Video preview meta */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-black uppercase text-accent">
                  {video.platform}
                </span>
                <span className="text-muted">•</span>
                <span className="text-[10px] text-muted truncate">
                  by {video.userName}
                </span>
              </div>
              <p className="text-xs font-bold text-fg truncate">{video.title}</p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline mt-0.5"
              >
                <span>Re-open video tab</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {!minimized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* ENCOURAGEMENT BANNER */}
              <div
                className={`px-3 py-2 rounded-xl border text-[10px] flex items-start gap-2 ${
                  isOwnerClip
                    ? "bg-warning/15 border-warning/30 text-fg"
                    : isVipWatchingVip
                    ? "bg-surface2 border-line text-muted"
                    : "bg-surface2 border-line text-fg"
                }`}
              >
                {isOwnerClip ? (
                  <Zap className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5 fill-warning" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                )}
                <span>
                  {isOwnerClip ? (
                    <>
                      <strong>Owner Clip Reward:</strong> Verifying grants{" "}
                      <strong>+2 post slots today</strong> &{" "}
                      <strong>+2 post credits</strong>!
                    </>
                  ) : isVipWatchingVip ? (
                    <>
                      <strong>VIP Note:</strong> VIP clips don&apos;t earn rewards for fellow VIP
                      members. Watch community or Owner clips to earn credits!
                    </>
                  ) : (
                    <>
                      <strong>Clipper Rule:</strong> Liking and commenting boosts the algorithm for
                      all creators!
                    </>
                  )}
                </span>
              </div>

              {/* CHECKLIST */}
              <div className="space-y-1.5">
                {/* 1. Watched 13+ seconds (Automatic) */}
                <div
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                    hasMetTime
                      ? "bg-success/15 border-success/30 text-fg font-semibold"
                      : "bg-surface2 border-line text-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        hasMetTime ? "bg-success text-white font-bold" : "bg-line text-muted"
                      }`}
                    >
                      ✓
                    </div>
                    <span>Watched {minSecondsRequired}+ seconds</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-muted">
                    {hasMetTime ? "Done" : "Auto-tracked"}
                  </span>
                </div>

                {/* 2. Liked (MANDATORY REQUIREMENT) */}
                <button
                  type="button"
                  onClick={() => toggleChecklist("liked")}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs text-left transition-all ${
                    liked
                      ? "bg-accent/15 border-accent text-fg font-semibold shadow-sm"
                      : hasMetTime
                      ? "bg-warning/15 border-warning text-fg font-semibold ring-1 ring-warning"
                      : "bg-surface2 border-line hover:border-line/80 text-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${
                        liked ? "text-accent fill-accent" : hasMetTime ? "text-warning" : "text-muted"
                      }`}
                    />
                    <div className="flex items-center gap-1.5">
                      <span>Liked the video</span>
                      <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-warning/20 text-warning border border-warning/30">
                        Required
                      </span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold ${liked ? "text-success font-black" : "text-warning"}`}>
                    {liked ? "Confirmed ✓" : "Click to confirm *"}
                  </span>
                </button>

                {/* 3. Commented (Self-confirmed) */}
                <button
                  type="button"
                  onClick={() => toggleChecklist("commented")}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs text-left transition-all ${
                    commented
                      ? "bg-surface2 border-accent text-fg font-semibold"
                      : "bg-surface2 border-line hover:border-line/80 text-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare
                      className={`w-3.5 h-3.5 ${commented ? "text-accent fill-accent" : "text-muted"}`}
                    />
                    <span>Left a comment (Optional)</span>
                  </div>
                  <span className="text-[9px] font-bold text-muted">
                    {commented ? "Confirmed ✓" : "Click to confirm"}
                  </span>
                </button>

                {/* 4. Followed (Self-confirmed) */}
                <button
                  type="button"
                  onClick={() => toggleChecklist("followed")}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs text-left transition-all ${
                    followed
                      ? "bg-surface2 border-accent text-fg font-semibold"
                      : "bg-surface2 border-line hover:border-line/80 text-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserPlus
                      className={`w-3.5 h-3.5 ${followed ? "text-accent" : "text-muted"}`}
                    />
                    <span>Followed / Subscribed (Optional)</span>
                  </div>
                  <span className="text-[9px] font-bold text-muted">
                    {followed ? "Confirmed ✓" : "Click to confirm"}
                  </span>
                </button>
              </div>

              {/* AD BANNER ON REWARD */}
              {isVerified && <AdSlot type="rewardBanner" />}

              {/* ACTION BUTTON */}
              {isVerified ? (
                <div className="p-3 rounded-2xl border border-line bg-surface2 text-center space-y-1.5">
                  <div
                    className={`flex items-center justify-center gap-1.5 font-extrabold text-xs ${
                      isOwnerClip ? "text-warning" : "text-success"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isOwnerClip
                        ? "Verified! +2 Upload Slots & +2 Credits Earned!"
                        : isVipWatchingVip
                        ? "Verified! (No rewards for VIP clips)"
                        : "Verified! You earned 1 post credit."}
                    </span>
                  </div>
                  <button
                    onClick={closeEngagement}
                    className="w-full py-2 rounded-xl bg-accent text-accent-fg font-extrabold text-xs transition-opacity hover:opacity-90 shadow-sm"
                  >
                    Done & Return to Feed
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!hasMetTime || isVerifying}
                  onClick={hasMetTime && !liked ? () => toggleChecklist("liked") : confirmAndVerifyEngagement}
                  className={`w-full py-3 rounded-2xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-sm ${
                    hasMetTime && liked && !isVerifying
                      ? isOwnerClip
                        ? "bg-warning text-black hover:opacity-90 cursor-pointer active:scale-98"
                        : "bg-accent text-accent-fg hover:opacity-90 cursor-pointer active:scale-98"
                      : hasMetTime && !liked
                      ? "bg-warning/20 border-2 border-warning text-warning hover:bg-warning/30 cursor-pointer animate-pulse"
                      : "bg-surface2 text-muted border border-line cursor-not-allowed opacity-60"
                  }`}
                >
                  {isVerifying ? (
                    <span>Verifying with Server...</span>
                  ) : hasMetTime && liked ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {isOwnerClip
                          ? "Verify & Claim +2 Slots & +2 Credits"
                          : isVipWatchingVip
                          ? "Verify Clip (0 VIP Rewards)"
                          : "Verify & Claim +1 Post Credit"}
                      </span>
                    </>
                  ) : hasMetTime && !liked ? (
                    <>
                      <ThumbsUp className="w-4 h-4 text-warning fill-warning/20" />
                      <span>Confirm Like to Claim Reward</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Watch clip ({minSecondsRequired - currentSeconds}s remaining)</span>
                    </>
                  )}
                </button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
