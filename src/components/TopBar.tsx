"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors,
  Play,
  Search,
  Clock,
  Coins,
  ChevronDown,
  Crown,
  Sparkles,
  UserCheck,
  User,
  Shield,
  LogOut,
  Trophy,
  LogIn,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useApp } from "@/context/AppContext";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

interface TopBarProps {
  onSearchChange?: (val: string) => void;
  searchValue?: string;
}

export function TopBar({ onSearchChange, searchValue = "" }: TopBarProps) {
  const router = useRouter();
  const {
    user,
    limitStats,
    creditAnimationTrigger,
    openLoginModal,
    logout,
    switchUserPersona,
  } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [countdownString, setCountdownString] = useState("");
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Live countdown to 6:00 AM reset
  useEffect(() => {
    const updateCountdown = () => {
      if (!limitStats?.nextReset) return;
      const target = new Date(limitStats.nextReset).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setCountdownString(
        `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [limitStats?.nextReset]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(localSearch);
    } else {
      router.push(`/?search=${encodeURIComponent(localSearch)}`);
    }
  };

  const isOwner = user?.role === "owner";
  const credits = isOwner ? "∞" : (user?.credits ?? user?.postCredits ?? 0);

  return (
    <header className="sticky top-0 z-40 w-full h-[65px] bg-surface border-b border-line px-4 sm:px-6 flex items-center justify-between gap-3 select-none">
      {/* 1. LOGO: Solid styled "Clip" with "Earn" in solid accent + icon */}
      <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
        <div className="relative w-9 h-9 rounded-xl bg-surface2 border border-line p-1 shadow-sm group-hover:border-accent transition-colors flex items-center justify-center">
          <Scissors className="w-4 h-4 text-accent transform -rotate-45" />
          <Play className="w-2 h-2 text-warning fill-warning absolute bottom-1 right-1" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center text-xl font-black tracking-tight text-fg leading-none">
            <span>Clip</span>
            <span className="text-accent">Earn</span>
          </div>
          <span className="text-[9px] uppercase font-bold tracking-wider text-muted mt-0.5 hidden sm:inline">
            {siteConfig.tagline}
          </span>
        </div>
      </Link>

      {/* 2. SEARCH BAR */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex-1 max-w-md hidden md:block mx-2"
      >
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => {
            setLocalSearch(e.target.value);
            if (onSearchChange) onSearchChange(e.target.value);
          }}
          placeholder="Search gaming, podcasts, anime, streamer clips..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </form>

      {/* 3. RIGHT CONTROLS */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* THEME SWITCHER */}
        <ThemeSwitcher />

        {user ? (
          <>
            {/* DAILY LIMIT PILL with countdown */}
            {limitStats && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface2 border border-line text-xs text-fg">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span className="font-semibold text-fg">
                  {isOwner ? (
                    <span className="text-warning">Unlimited</span>
                  ) : (
                    <span>
                      {limitStats.postsUsedToday}/
                      {limitStats.isUnlimited ? "∞" : limitStats.totalLimit || limitStats.dailyLimit} today
                      {limitStats.bonusSlotsEarned > 0 && (
                        <span className="text-warning font-bold ml-1">
                          (+{limitStats.bonusSlotsEarned} bonus)
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <span className="text-line">|</span>
                <span className="text-[11px] text-muted">
                  resets in {countdownString || "06h 00m"}
                </span>
              </div>
            )}

            {/* POST CREDITS BADGE (with celebratory pulse animation) */}
            <motion.div
              key={creditAnimationTrigger}
              animate={
                creditAnimationTrigger > 0
                  ? {
                      scale: [1, 1.25, 1],
                    }
                  : {}
              }
              transition={{ duration: 0.4 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface2 border border-line text-fg shadow-sm"
              title="Post Credits"
            >
              <Coins className="w-4 h-4 text-warning fill-warning/20" />
              <span className="text-xs font-black text-fg">{credits}</span>
              <span className="text-[11px] font-medium hidden sm:inline text-muted">
                {isOwner ? "Credits" : credits === 1 ? "Credit" : "Credits"}
              </span>
            </motion.div>

            {/* AVATAR MENU & PERSONA SWITCHER */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-xl bg-surface2 border border-line hover:border-accent transition-all text-xs text-fg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    user?.avatar ||
                    "https://api.dicebear.com/7.x/bottts/svg?seed=clipearn"
                  }
                  alt="Avatar"
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-line"
                />
                <ChevronDown className="w-3.5 h-3.5 text-muted pr-0.5" />
              </button>

              {/* AVATAR DROPDOWN */}
              <AnimatePresence>
                {roleMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface border border-line p-2 shadow-2xl z-50 text-xs text-fg"
                  >
                    <div className="px-3 py-2 border-b border-line mb-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-fg truncate max-w-[140px]">
                          {user?.name}
                        </p>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            user?.role === "owner"
                              ? "bg-warning/15 text-warning border border-warning/30"
                              : user?.role === "vip"
                              ? "bg-accent/15 text-accent border border-accent/30"
                              : "bg-surface2 text-fg border border-line"
                          }`}
                        >
                          {user?.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    {/* ROLE SWITCHER TESTER */}
                    <div className="space-y-1 mb-2">
                      <p className="px-2 pt-1 text-[9px] uppercase font-bold tracking-wider text-muted">
                        Switch Persona (Live Demo)
                      </p>
                      <button
                        onClick={() => {
                          switchUserPersona("owner");
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          user?.role === "owner"
                            ? "bg-warning/15 text-warning font-bold border border-warning/30"
                            : "hover:bg-surface2 text-muted hover:text-fg"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-warning" /> Owner
                        </span>
                        <span className="text-[10px] text-warning">Unlimited</span>
                      </button>

                      <button
                        onClick={() => {
                          switchUserPersona("vip");
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          user?.role === "vip"
                            ? "bg-accent/15 text-accent font-bold border border-accent/30"
                            : "hover:bg-surface2 text-muted hover:text-fg"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-accent" /> VIP
                        </span>
                        <span className="text-[10px] text-accent">20/day</span>
                      </button>

                      <button
                        onClick={() => {
                          switchUserPersona("user");
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          user?.role === "user"
                            ? "bg-surface2 text-fg font-bold border border-line"
                            : "hover:bg-surface2 text-muted hover:text-fg"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-fg" /> Normal Clipper
                        </span>
                        <span className="text-[10px] text-muted">5/day</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-line space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setRoleMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface2 text-muted hover:text-fg"
                      >
                        <User className="w-3.5 h-3.5 text-accent" /> My Profile & Settings
                      </Link>
                      <Link
                        href="/leaderboard"
                        onClick={() => setRoleMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface2 text-muted hover:text-fg"
                      >
                        <Trophy className="w-3.5 h-3.5 text-warning" /> Leaderboard
                      </Link>
                      {(user?.role === "owner" || user?.role === "admin") && (
                        <Link
                          href="/admin"
                          onClick={() => setRoleMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface2 text-warning font-bold"
                        >
                          <Shield className="w-3.5 h-3.5" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-danger/10 text-danger transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Unauthenticated Visitor Sign In Button */
          <button
            onClick={openLoginModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-fg hover:opacity-90 text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
