"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Crown,
  Sparkles,
  Coins,
  Clock,
  Flame,
  Award,
  TrendingUp,
  Heart,
  Video as VideoIcon,
  Calendar,
  CheckCircle2,
  BookmarkCheck,
  Palette,
  Check,
  RotateCcw,
  Edit3,
  User as UserIcon,
  Image as ImageIcon,
  Shuffle,
  AtSign,
  FileText,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { Video } from "@/types";
import { VideoCard } from "@/components/VideoCard";
import { clientApi } from "@/lib/client-api";

const AVATAR_PRESETS = [
  { label: "Bot Neon", url: "https://api.dicebear.com/7.x/bottts/svg?seed=neon_clipper" },
  { label: "Cyber Punk", url: "https://api.dicebear.com/7.x/bottts/svg?seed=cyber_vibe" },
  { label: "Pixel Hero", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=clip_master" },
  { label: "Retro Gamer", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=retro_gamer" },
  { label: "Cool Cat", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=cool_clipper" },
  { label: "Ninja Edit", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=ninja_shorts" },
];

export default function ProfilePage() {
  const { user, limitStats, showToast, refreshUserData, setUser } = useApp();
  const { theme, presets, setTheme, customAccent, setCustomAccent } = useTheme();

  const [activeTab, setActiveTab] = useState<"my-clips" | "watched" | "pinned" | "edit-profile" | "settings">("my-clips");
  const [myClips, setMyClips] = useState<Video[]>([]);
  const [watchedClips, setWatchedClips] = useState<Video[]>([]);
  const [pinnedClips, setPinnedClips] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile customization state
  const [editNickname, setEditNickname] = useState(user?.nickname || user?.name || "");
  const [editAvatar, setEditAvatar] = useState(user?.avatar || "");
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [editSocialHandle, setEditSocialHandle] = useState(user?.socialHandle || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditNickname(user.nickname || user.name || "");
      setEditAvatar(user.avatar || "");
      setEditBio(user.bio || "");
      setEditSocialHandle(user.socialHandle || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const cleanNick = editNickname.trim();
    if (!cleanNick) {
      showToast("Please enter a nickname", "error");
      return;
    }
    if (cleanNick.length < 3 || cleanNick.length > 25) {
      showToast("Nickname must be between 3 and 25 characters", "error");
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await clientApi.updateUserProfile(user.id, {
        nickname: cleanNick,
        avatar: editAvatar.trim() || undefined,
        bio: editBio.trim(),
        socialHandle: editSocialHandle.trim(),
      });

      if (updated) {
        setUser({
          ...user,
          nickname: cleanNick,
          name: cleanNick,
          avatar: editAvatar.trim() || user.avatar,
          bio: editBio.trim(),
          socialHandle: editSocialHandle.trim(),
        });
      }

      showToast("Profile updated successfully!", "success");
      await refreshUserData();
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const quickAccents = [
    { label: "Purple", hex: "#7C5CFF" },
    { label: "Pink", hex: "#FF4D6D" },
    { label: "Ocean", hex: "#00C2FF" },
    { label: "Emerald", hex: "#3DDC84" },
    { label: "Orange", hex: "#FF7A1A" },
    { label: "Amber", hex: "#F59E0B" },
    { label: "Rose", hex: "#E11D48" },
    { label: "Violet", hex: "#8B5CF6" },
  ];

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      clientApi.getVideos({ userId: user.id })
        .then((data) => {
          const all: Video[] = [
            ...(data.sections?.owner || []),
            ...(data.sections?.pinnedAndVip || []),
            ...(data.sections?.fresh || []),
            ...(data.sections?.community || []),
            ...(data.sections?.watched || []),
          ];

          // 1. User's own clips
          const mine = all.filter((v) => v.userId === user.id);
          setMyClips(mine);

          // 2. Watched clips
          setWatchedClips(data.sections?.watched || []);

          // 3. User's pinned clips
          setPinnedClips(mine.filter((v) => v.isPinned));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const isOwner = user?.role === "owner";
  const isVip = user?.role === "vip";

  // Calculate stats
  const totalEngagementsReceived = myClips.reduce((acc, v) => acc + (v.engagementsCount || 0), 0);
  const engagementsGiven = watchedClips.length || 3;
  const streakDays = 7;
  const levelTitle = isOwner ? "Platform Founder" : isVip ? "Diamond Clipper" : "Gold Clipper";
  const levelNumber = isOwner ? 99 : isVip ? 15 : 6;

  // 7-day view trend mock data
  const weeklyViews = [
    { day: "Mon", views: 240 },
    { day: "Tue", views: 380 },
    { day: "Wed", views: 510 },
    { day: "Thu", views: 420 },
    { day: "Fri", views: 690 },
    { day: "Sat", views: 850 },
    { day: "Sun", views: 920 },
  ];
  const maxWeekly = Math.max(...weeklyViews.map((w) => w.views));

  const displayClips =
    activeTab === "my-clips"
      ? myClips
      : activeTab === "watched"
      ? watchedClips
      : pinnedClips;

  return (
    <div className="w-full min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 pb-24 lg:pb-12 text-fg">
      {/* 1. HEADER: Avatar, Username, Role Badge, Join Date */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 rounded-2xl bg-surface border border-line shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=clipearn"}
              alt="Avatar"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-accent/30 shadow-md"
            />
            {isOwner && (
              <span className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-warning text-black shadow-md">
                <Crown className="w-3.5 h-3.5 fill-black" />
              </span>
            )}
            {isVip && !isOwner && (
              <span className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-accent text-accent-fg shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-fg">
                {user?.nickname || user?.name || "Clipper"}
              </h1>
              {isOwner ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-warning/15 text-warning border border-warning/30">
                  Owner
                </span>
              ) : isVip ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
                  VIP Member
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface2 text-muted border border-line">
                  Clipper
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-accent">@{user?.nickname || "clipper"}</span>
              {user?.socialHandle && (
                <span className="text-[11px] text-muted">&bull; {user.socialHandle}</span>
              )}
            </div>
            {user?.bio && (
              <p className="text-xs text-fg/80 italic max-w-md pt-0.5">{user.bio}</p>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-muted pt-0.5">
              <Calendar className="w-3 h-3 text-accent" />
              <span>Joined April 2026 • Verified Clipper</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <button
            onClick={() => setActiveTab("edit-profile")}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-surface2 border border-line hover:border-accent text-fg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-accent" />
            <span>Edit Profile</span>
          </button>
          <Link
            href="/post"
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-accent text-accent-fg font-extrabold text-xs shadow-md hover:opacity-95 transition-opacity text-center"
          >
            Upload Clip
          </Link>
          {!isVip && !isOwner && (
            <Link
              href="/upgrade"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-surface2 border border-accent/30 hover:border-accent text-accent font-bold text-xs text-center transition-colors"
            >
              Get VIP (20 Posts)
            </Link>
          )}
        </div>
      </div>

      {/* 2. STATS CARDS IN A BENTO GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Bento 1: Clips Posted */}
        <div className="p-4 rounded-2xl bg-surface border border-line space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Clips Posted</span>
            <VideoIcon className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-black text-fg">{myClips.length}</p>
        </div>

        {/* Bento 2: Verified Engagements Received */}
        <div className="p-4 rounded-2xl bg-surface border border-line space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Supports Received</span>
            <Heart className="w-4 h-4 text-accent fill-accent/20" />
          </div>
          <p className="text-2xl font-black text-accent">{totalEngagementsReceived}</p>
        </div>

        {/* Bento 3: Engagements Given (Watched) */}
        <div className="p-4 rounded-2xl bg-surface border border-line space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Engagements Given</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-black text-success">{engagementsGiven}</p>
        </div>

        {/* Bento 4: Credits Balance */}
        <div className="p-4 rounded-2xl bg-surface border border-line space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Credit Balance</span>
            <Coins className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-black text-warning">
            {isOwner ? "∞" : user?.postCredits || 0}
          </p>
        </div>

        {/* Bento 5: Posts Used Today */}
        <div className="p-4 rounded-2xl bg-surface border border-line space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Posts Used Today</span>
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <p className="text-xl font-black text-fg">
            {isOwner ? "Unlimited" : `${limitStats?.postsUsedToday || 0} / ${limitStats?.dailyLimit || 5}`}
          </p>
        </div>

        {/* Bento 6: Active Streak */}
        <div className="p-4 rounded-2xl bg-surface border border-line space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-warning fill-warning/20" />
          </div>
          <p className="text-xl font-black text-warning">{streakDays} Days 🔥</p>
        </div>

        {/* Bento 7: Rank / Level */}
        <div className="p-4 rounded-2xl bg-surface border border-line space-y-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Rank Tier</span>
            <Award className="w-4 h-4 text-accent" />
          </div>
          <p className="text-sm font-black text-accent truncate">{levelTitle}</p>
          <span className="text-[10px] text-muted">Level {levelNumber}</span>
        </div>

        {/* Bento 8: 7-Day Views Mini Chart */}
        <div className="p-4 rounded-2xl bg-surface border border-line space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>7-Day Views</span>
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
          </div>
          {/* Bar Chart Visualization */}
          <div className="flex items-end justify-between gap-1 h-12 pt-1">
            {weeklyViews.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-accent"
                  style={{
                    height: `${Math.max(15, (item.views / maxWeekly) * 100)}%`,
                  }}
                  title={`${item.day}: ${item.views} views`}
                />
                <span className="text-[8px] text-muted">{item.day[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TABS CONTROLS */}
      <div className="space-y-6 pt-4 border-t border-line">
        <div className="flex items-center gap-2 border-b border-line pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("my-clips")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "my-clips"
                ? "bg-accent text-accent-fg shadow-sm"
                : "text-muted hover:text-fg hover:bg-surface2"
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>My Clips ({myClips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("watched")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "watched"
                ? "bg-accent text-accent-fg shadow-sm"
                : "text-muted hover:text-fg hover:bg-surface2"
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Watched & Supported ({watchedClips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("pinned")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "pinned"
                ? "bg-accent text-accent-fg shadow-sm"
                : "text-muted hover:text-fg hover:bg-surface2"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Pinned ({pinnedClips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("edit-profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "edit-profile"
                ? "bg-accent text-accent-fg shadow-sm"
                : "text-muted hover:text-fg hover:bg-surface2"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "settings"
                ? "bg-accent text-accent-fg shadow-sm"
                : "text-muted hover:text-fg hover:bg-surface2"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Appearance</span>
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "edit-profile" ? (
          <form onSubmit={handleSaveProfile} className="space-y-8 p-6 sm:p-8 rounded-2xl bg-surface border border-line shadow-xl max-w-2xl">
            {/* Header */}
            <div>
              <h2 className="text-lg font-bold text-fg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-accent" />
                <span>Customize Clipper Profile</span>
              </h2>
              <p className="text-xs text-muted mt-1">
                Update your public clipper identity. Your email and Google personal data are never shown.
              </p>
            </div>

            {/* 1. Clipper Nickname */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-fg">Clipper Nickname (Publicly Shown)</label>
                <button
                  type="button"
                  onClick={() => {
                    const random =
                      ["VelocityClip", "AuraEdits", "ApexShorts", "PulseClipper", "ZenCutter", "NovaStream", "ShadowClip"][
                        Math.floor(Math.random() * 7)
                      ] +
                      "_" +
                      Math.floor(10 + Math.random() * 90);
                    setEditNickname(random);
                  }}
                  className="flex items-center gap-1 text-accent hover:underline font-semibold text-[11px]"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Randomize</span>
                </button>
              </div>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={25}
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  placeholder="e.g. ApexShorts"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface2 border border-line text-xs font-bold text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <p className="text-[11px] text-muted">
                This is the name other clippers see on your videos and on the leaderboard.
              </p>
            </div>

            {/* 2. Avatar Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-fg block">Choose Avatar</label>

              {/* Current Avatar Preview */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-surface2 border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editAvatar || user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=clipearn"}
                  alt="Avatar Preview"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-accent/30 shadow-md"
                />
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-bold text-fg">Active Avatar Preview</p>
                  <p className="text-[11px] text-muted">Pick from presets below or paste a custom image URL.</p>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-muted font-medium">Avatar Presets:</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((p) => {
                    const isSelected = editAvatar === p.url;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setEditAvatar(p.url)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                          isSelected
                            ? "border-accent bg-surface2 ring-2 ring-accent/30 shadow-sm"
                            : "border-line bg-surface hover:bg-surface2"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={p.label} className="w-10 h-10 rounded-lg object-cover" />
                        <span className="text-[10px] font-bold text-fg truncate w-full">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Avatar URL */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-medium text-muted">Or Custom Image URL (optional):</label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-fg block">Bio / Clipper About (optional)</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-muted absolute left-3 top-3" />
                <textarea
                  maxLength={150}
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="e.g. Gaming & anime clippers. Posting daily shorts, let's exchange watch time!"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted">
                <span>Short intro displayed on your profile.</span>
                <span>{editBio.length}/150</span>
              </div>
            </div>

            {/* 4. Social Handle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-fg block">Instagram or TikTok Handle (optional)</label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={40}
                  value={editSocialHandle}
                  onChange={(e) => setEditSocialHandle(e.target.value)}
                  placeholder="e.g. @yourclippingchannel"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="p-3.5 rounded-xl bg-surface2 border border-line text-xs text-muted flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <span>
                <strong>100% Identity Privacy:</strong> Your Google login details and Gmail address are strictly protected. Other users will only see your custom nickname, avatar, and social handle.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-3 rounded-xl bg-accent hover:opacity-90 text-accent-fg font-black text-xs shadow-md transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : activeTab === "settings" ? (
          <div className="space-y-8 p-6 sm:p-8 rounded-2xl bg-surface border border-line shadow-xl">
            {/* Header */}
            <div>
              <h2 className="text-lg font-bold text-fg flex items-center gap-2">
                <Palette className="w-5 h-5 text-accent" />
                <span>Theme & Appearance Settings</span>
              </h2>
              <p className="text-xs text-muted mt-1">
                Personalize your workspace palette. Changes apply across all pages instantly and persist with zero flash.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">
                Preset Palettes (WCAG AA Compliant)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {presets.map((preset) => {
                  const isCurrent = theme === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setTheme(preset.id)}
                      className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-28 ${
                        isCurrent
                          ? "border-accent bg-surface2 ring-2 ring-accent/30 shadow-md"
                          : "border-line bg-surface hover:bg-surface2"
                      }`}
                      style={{
                        backgroundColor: preset.colors.surface,
                        borderColor: isCurrent ? preset.colors.accent : preset.colors.line,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span
                            className="text-sm font-bold block"
                            style={{ color: preset.colors.fg }}
                          >
                            {preset.name}
                          </span>
                          <span
                            className="text-[10px] block"
                            style={{ color: preset.colors.muted }}
                          >
                            {preset.isDark ? "Dark theme" : "Light theme"}
                          </span>
                        </div>
                        {isCurrent && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                            style={{
                              backgroundColor: preset.colors.accent,
                              color: preset.colors.accentFg,
                            }}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Swatches preview */}
                      <div className="flex items-center gap-1.5 pt-2 border-t" style={{ borderColor: preset.colors.line }}>
                        <div
                          className="w-5 h-5 rounded-md border"
                          style={{
                            backgroundColor: preset.colors.bg,
                            borderColor: preset.colors.line,
                          }}
                          title="Background"
                        />
                        <div
                          className="w-5 h-5 rounded-md border"
                          style={{
                            backgroundColor: preset.colors.surface2,
                            borderColor: preset.colors.line,
                          }}
                          title="Surface"
                        />
                        <div
                          className="w-5 h-5 rounded-md border"
                          style={{
                            backgroundColor: preset.colors.line,
                            borderColor: preset.colors.line,
                          }}
                          title="Border"
                        />
                        <div
                          className="w-5 h-5 rounded-md shadow-sm ml-auto"
                          style={{
                            backgroundColor: preset.colors.accent,
                          }}
                          title="Accent"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Accent Color Picker */}
            <div className="space-y-4 pt-4 border-t border-line">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted block">
                    Custom Accent Color
                  </label>
                  <p className="text-xs text-muted mt-0.5">
                    Text color (--accent-fg) is automatically calculated via sRGB luminance to guarantee WCAG AA contrast.
                  </p>
                </div>
                {customAccent && (
                  <button
                    onClick={() => setCustomAccent(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-fg hover:bg-surface2 transition-colors border border-line"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Theme Default</span>
                  </button>
                )}
              </div>

              {/* Quick Accent Swatches + HTML Color Picker */}
              <div className="flex flex-wrap items-center gap-2.5">
                {quickAccents.map((qa) => {
                  const isSelected = customAccent?.toLowerCase() === qa.hex.toLowerCase();
                  return (
                    <button
                      key={qa.hex}
                      onClick={() => setCustomAccent(qa.hex)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm ${
                        isSelected ? "ring-2 ring-fg ring-offset-2 ring-offset-bg scale-105" : ""
                      }`}
                      style={{ backgroundColor: qa.hex }}
                      title={qa.label}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </button>
                  );
                })}

                {/* Native HTML Color Input */}
                <label
                  className="h-9 px-3 rounded-xl border border-line bg-surface2 hover:bg-line/40 flex items-center gap-2 cursor-pointer transition-colors text-xs font-medium text-fg"
                  title="Pick any custom hex color"
                >
                  <input
                    type="color"
                    value={customAccent || "#7C5CFF"}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span>Custom Color {customAccent ? `(${customAccent.toUpperCase()})` : ""}</span>
                </label>
              </div>

              {/* Live Preview Button */}
              <div className="pt-2">
                <span className="text-[11px] text-muted block mb-1.5">Interactive Accent Preview:</span>
                <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-surface2 border border-line">
                  <button className="px-4 py-2 rounded-lg bg-accent text-accent-fg font-bold text-xs shadow-sm">
                    Primary Accent Button
                  </button>
                  <span className="text-xs font-semibold text-accent">Accent Text Link</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-accent/15 text-accent border border-accent/30">
                    Badge
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* SHORTS-STYLE RESPONSIVE GRID (2 on mobile up to 6 on desktop) */}
            {loading ? (
              <div className="py-12 text-center text-xs text-muted">Loading clips...</div>
            ) : displayClips.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-surface border border-line space-y-2">
                <VideoIcon className="w-8 h-8 text-muted mx-auto" />
                <p className="text-sm font-bold text-fg">No clips in this tab</p>
                <p className="text-xs text-muted">
                  {activeTab === "my-clips"
                    ? "Upload a clip to start getting views from the community!"
                    : activeTab === "watched"
                    ? "Watch clips on the feed to earn post credits."
                    : "Pin your video for 24h to appear at the very top of the platform."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {displayClips.map((clip) => (
                  <VideoCard
                    key={clip.id}
                    video={clip}
                    isWatched={activeTab === "watched"}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
