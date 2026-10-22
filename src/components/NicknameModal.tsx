"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, Shuffle, Check, ShieldCheck, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { clientApi } from "@/lib/client-api";

const NICKNAME_SUGGESTIONS = [
  "VelocityClip",
  "AuraEdits",
  "ApexShorts",
  "PulseClipper",
  "EchoViral",
  "ZenCutter",
  "NovaStream",
  "ShadowClip",
  "PixelGrind",
  "HyperShort",
  "VibeCrafter",
  "AeroClipper",
];

interface NicknameModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function NicknameModal({ forceOpen, onClose }: NicknameModalProps) {
  const { user, setUser, showToast, refreshUserData } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      if (user?.nickname && !user.nickname.startsWith("Clipper_")) {
        setNicknameInput(user.nickname);
      }
      return;
    }

    if (!user) {
      setIsOpen(false);
      return;
    }

    // Check if user has already dismissed or set permanent nickname
    const dismissedKey = `clipearn_nickname_prompted_${user.id}`;
    const wasDismissed = typeof window !== "undefined" ? localStorage.getItem(dismissedKey) : null;

    const isDefaultGenerated = !user.nickname || user.nickname.startsWith("Clipper_");
    if (!wasDismissed && isDefaultGenerated) {
      // Auto-open on first login
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [user, forceOpen]);

  if (!isOpen || !user) return null;

  const handleRandomize = () => {
    const random =
      NICKNAME_SUGGESTIONS[Math.floor(Math.random() * NICKNAME_SUGGESTIONS.length)] +
      "_" +
      Math.floor(10 + Math.random() * 90);
    setNicknameInput(random);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNick = nicknameInput.trim();
    if (!cleanNick) {
      showToast("Please enter a nickname", "error");
      return;
    }
    if (cleanNick.length < 3 || cleanNick.length > 25) {
      showToast("Nickname must be between 3 and 25 characters", "error");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await clientApi.updateUserProfile(user.id, {
        nickname: cleanNick,
      });

      if (updated) {
        setUser({ ...user, nickname: cleanNick, name: cleanNick });
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(`clipearn_nickname_prompted_${user.id}`, "true");
      }

      showToast(`Clipper nickname set to: ${cleanNick}!`, "success");
      setIsOpen(false);
      if (onClose) onClose();
      await refreshUserData();
    } catch (err: any) {
      showToast(err.message || "Failed to update nickname", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`clipearn_nickname_prompted_${user.id}`, "true");
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Solid dim backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/75"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-surface border border-line rounded-2xl shadow-2xl p-6 md:p-7 z-10 space-y-5"
        >
          {/* Top accent accent border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent rounded-t-2xl" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 text-muted hover:text-fg rounded-lg hover:bg-surface2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Clipper Identity</span>
            </div>
            <h2 className="text-xl font-black text-fg tracking-tight">
              Choose Your Clipper Nickname
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              This is the <strong>only</strong> name shown on your clips and the leaderboard.
              Your Gmail name and email address will <strong>never</strong> be visible to anyone.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-fg">Public Clipper Nickname</label>
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="flex items-center gap-1 text-accent hover:underline font-semibold text-[11px]"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Randomize</span>
                </button>
              </div>

              <div className="relative">
                <User className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={25}
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder={user.nickname || "e.g. ApexShorts"}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface2 border border-line text-xs font-bold text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-muted font-medium">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {NICKNAME_SUGGESTIONS.slice(0, 6).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setNicknameInput(sug)}
                    className="px-2.5 py-1 rounded-lg bg-surface2 border border-line hover:border-accent text-[11px] text-fg hover:text-accent font-semibold transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="p-3 rounded-xl bg-surface2 border border-line text-[11px] text-muted flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <span>
                <strong>100% Privacy Protected:</strong> Your Gmail credentials are strictly
                used for secure authentication. Only your chosen nickname is published.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2.5 rounded-xl bg-surface2 hover:bg-line border border-line text-xs font-bold text-muted hover:text-fg transition-colors"
              >
                Skip For Now
              </button>
              <button
                type="submit"
                disabled={!nicknameInput.trim() || isSaving}
                className="flex-1 py-2.5 rounded-xl bg-accent hover:opacity-90 text-accent-fg text-xs font-black shadow-md transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Nickname</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
