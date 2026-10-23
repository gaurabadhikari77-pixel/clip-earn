"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Video as VideoIcon,
  Crown,
  DollarSign,
  AlertTriangle,
  Settings as SettingsIcon,
  PlusCircle,
  Trash2,
  Ban,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Save,
  Flame,
  Search,
  Flag,
  Coins,
  Copy,
  Check,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Video, User, Report, SiteSettings, UserRole } from "@/types";
import { clientApi } from "@/lib/client-api";
import { db } from "@/lib/store";
import { isOwnerEmail } from "@/config/site";
import { OwnerCreditTransferModal } from "@/components/OwnerCreditTransferModal";

export default function AdminPage() {
  const { user, showToast, refreshSettings } = useApp();

  useEffect(() => {
    if (!user || !isOwnerEmail(user.email)) {
      if (typeof window !== "undefined") {
        window.location.href = "https://www.instagram.com/gaurabb_adk/";
      }
    }
  }, [user]);

  const [activeTab, setActiveTab] = useState<
    "overview" | "owner-videos" | "videos" | "users" | "reports" | "settings"
  >("overview");

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalViews: 0,
    totalEngagements: 0,
    totalRevenue: 0,
    pendingReports: 0,
    activePins: 0,
    vipUsersCount: 0,
  });

  // Data collections
  const [videos, setVideos] = useState<Video[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);

  // New Owner Video Form
  const [ownerVidUrl, setOwnerVidUrl] = useState("");
  const [ownerVidTitle, setOwnerVidTitle] = useState("");
  const [ownerVidThumbnail, setOwnerVidThumbnail] = useState("");
  const [creatingOwnerVid, setCreatingOwnerVid] = useState(false);

  // Filter / Search in users & videos
  const [userSearch, setUserSearch] = useState("");
  const [videoSearch, setVideoSearch] = useState("");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetUserId, setTransferTargetUserId] = useState<string | undefined>(undefined);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      // Stats
      const statsData = await clientApi.getAdminStats();
      setStats(statsData as any);

      // Videos
      const vidData = await clientApi.getVideos();
      const all: Video[] = Object.values(vidData.sections || {})
        .flat()
        .filter(Boolean) as Video[];
      setVideos(all);

      // Users
      const usersData = db.getUsers();
      setUsersList(usersData);

      // Reports
      const repData = await clientApi.getAdminReports();
      setReports(repData);

      // Settings
      const setData = await clientApi.getSettings();
      setSettingsForm(setData);
    } catch (e) {
      console.error("Failed to load admin data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Upload Owner Video handler
  const handleCreateOwnerVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerVidUrl.trim()) return;

    setCreatingOwnerVid(true);
    try {
      await clientApi.postVideo({
        userId: user?.id || "owner_user",
        userEmail: user?.email || "owner@clipearn.com",
        userName: user?.name || "ClipEarn Owner",
        url: ownerVidUrl.trim(),
        title: ownerVidTitle.trim() || undefined,
        thumbnailUrl: ownerVidThumbnail.trim() || undefined,
      });

      showToast("Official Owner video uploaded to Spotlight!", "success");
      setOwnerVidUrl("");
      setOwnerVidTitle("");
      setOwnerVidThumbnail("");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to post owner video", "error");
    } finally {
      setCreatingOwnerVid(false);
    }
  };

  // Video Deletion
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to permanently remove this video?")) return;
    try {
      await clientApi.deleteVideo(videoId);
      showToast("Video removed from platform", "success");
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch {
      showToast("Error deleting video", "error");
    }
  };

  // User role / ban / custom limit updates
  const handleUpdateUser = async (
    targetUserId: string,
    updates: { role?: UserRole; customDailyLimit?: number | null; isBanned?: boolean }
  ) => {
    try {
      await clientApi.updateAdminUser(targetUserId, updates);
      showToast("User updated successfully", "success");
      loadData();
    } catch {
      showToast("Network error updating user", "error");
    }
  };

  // Report resolution
  const handleResolveReport = async (reportId: string, status: "resolved" | "dismissed", deleteVideo = false) => {
    try {
      db.updateReportStatus(reportId, status);
      if (deleteVideo) {
        const rep = db.getReports().find((r) => r.id === reportId);
        if (rep?.videoId) db.deleteVideo(rep.videoId);
      }
      showToast(`Report marked as ${status}`, "success");
      loadData();
    } catch {
      showToast("Error updating report", "error");
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;

    try {
      await clientApi.updateSettings(settingsForm);
      showToast("Platform settings saved successfully!", "success");
      refreshSettings();
    } catch {
      showToast("Error saving settings", "error");
    }
  };

  if (!user || !isOwnerEmail(user.email)) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-warning/10 border border-warning/20 text-warning flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-fg">Owner Access Restricted</h2>
        <p className="text-xs text-muted max-w-md">
          Only the owner (iamdeathflow11@gmail.com) can access this control center. Redirecting...
        </p>
        <a
          href="https://www.instagram.com/gaurabb_adk/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent font-semibold underline"
        >
          Click here to contact Owner on Instagram (@gaurabb_adk)
        </a>
      </div>
    );
  }

  const isOwner = user?.role === "owner";

  return (
    <div className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-fg">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-line">
          <div>
            <div className="flex items-center gap-2 text-warning font-extrabold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Owner & Admin Control Center</span>
            </div>
            <h1 className="text-3xl font-black text-fg tracking-tight mt-1">
              Platform Administration
            </h1>
            <p className="text-xs text-muted">
              Manage video feeds, individual user posting limits, monetization pricing, and moderation reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-warning/15 border border-warning/30 text-warning font-bold text-xs flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-warning" />
              <span>Signed in: {user?.email}</span>
            </span>
          </div>
        </div>

        {/* ADMIN NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-line">
          {[
            { id: "overview", label: "Dashboard Overview", icon: DollarSign },
            { id: "owner-videos", label: "Owner Spotlight", icon: Crown },
            { id: "videos", label: "Videos Management", icon: VideoIcon },
            { id: "users", label: "Users & Custom Limits", icon: Users },
            { id: "reports", label: `Reports (${stats.pendingReports})`, icon: Flag },
            { id: "settings", label: "Settings & Ad Slots", icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-accent text-accent-fg shadow-sm"
                    : "bg-surface border border-line text-muted hover:text-fg hover:bg-surface2"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-surface border border-line space-y-2">
                <span className="text-xs font-semibold text-muted">Total Clippers</span>
                <p className="text-3xl font-black text-fg">{stats.totalUsers}</p>
                <span className="text-[11px] text-accent font-medium">
                  {stats.vipUsersCount} VIP Members
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-line space-y-2">
                <span className="text-xs font-semibold text-muted">Active Posted Clips</span>
                <p className="text-3xl font-black text-fg">{stats.totalVideos}</p>
                <span className="text-[11px] text-warning font-medium">
                  {stats.activePins} Currently Pinned
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-line space-y-2">
                <span className="text-xs font-semibold text-muted">Total Verified Views</span>
                <p className="text-3xl font-black text-accent">{stats.totalViews}</p>
                <span className="text-[11px] text-muted">
                  {stats.totalEngagements} community supports
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-line space-y-2">
                <span className="text-xs font-semibold text-muted">Platform Revenue</span>
                <p className="text-3xl font-black text-success">
                  ${Number(stats.totalRevenue).toFixed(2)}
                </p>
                <span className="text-[11px] text-success/80">From VIP & Pins</span>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-6 rounded-2xl bg-surface border border-line space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-fg">Owner Shortcuts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("owner-videos")}
                  className="p-4 rounded-xl bg-surface2 hover:bg-line border border-line text-left space-y-1 transition-colors"
                >
                  <Crown className="w-5 h-5 text-warning" />
                  <p className="text-xs font-bold text-fg">Add Owner Video</p>
                  <p className="text-[11px] text-muted">Upload directly to top spotlight</p>
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className="p-4 rounded-xl bg-surface2 hover:bg-line border border-line text-left space-y-1 transition-colors"
                >
                  <Users className="w-5 h-5 text-accent" />
                  <p className="text-xs font-bold text-fg">Set Custom Limits</p>
                  <p className="text-[11px] text-muted">Set unlimited or custom daily posts</p>
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="p-4 rounded-xl bg-surface2 hover:bg-line border border-line text-left space-y-1 transition-colors"
                >
                  <SettingsIcon className="w-5 h-5 text-accent" />
                  <p className="text-xs font-bold text-fg">Ad Codes & Pricing</p>
                  <p className="text-[11px] text-muted">Edit VIP price, min watch sec, ads</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OWNER SPOTLIGHT VIDEOS */}
        {activeTab === "owner-videos" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-surface border border-warning/30 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-warning font-bold text-sm">
                <Crown className="w-5 h-5" />
                <span>Upload Official Owner Video</span>
              </div>
              <p className="text-xs text-muted">
                Videos posted by the owner have NO daily limit, cost 0 credits, and ALWAYS appear at the very top of the feed in the Owner Section.
              </p>

              <form onSubmit={handleCreateOwnerVideo} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-fg">Video URL</label>
                    <input
                      type="url"
                      required
                      value={ownerVidUrl}
                      onChange={(e) => setOwnerVidUrl(e.target.value)}
                      placeholder="YouTube, TikTok, or Instagram link..."
                      className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-warning transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-fg">Title</label>
                    <input
                      type="text"
                      value={ownerVidTitle}
                      onChange={(e) => setOwnerVidTitle(e.target.value)}
                      placeholder="Official Clip Title (leave empty to auto-fetch)..."
                      className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-warning transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg">Thumbnail Image URL (Optional)</label>
                  <input
                    type="url"
                    value={ownerVidThumbnail}
                    onChange={(e) => setOwnerVidThumbnail(e.target.value)}
                    placeholder="https://... custom thumbnail link"
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-warning transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingOwnerVid || !ownerVidUrl}
                  className="px-5 py-2.5 rounded-xl bg-warning hover:opacity-95 text-black font-extrabold text-xs flex items-center gap-2 shadow-md transition-opacity"
                >
                  {creatingOwnerVid ? "Adding..." : "Add to Owner Section"}
                </button>
              </form>
            </div>

            {/* List of Owner Videos */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-fg">Current Owner Section Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos
                  .filter((v) => v.isOwnerVideo)
                  .map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-2xl bg-surface border border-line flex items-center gap-3 shadow-md"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.thumbnailUrl}
                        alt={v.title}
                        className="w-16 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-fg line-clamp-1">{v.title}</p>
                        <p className="text-[11px] text-muted">{v.viewsCount} views • {v.platform}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteVideo(v.id)}
                        className="p-2 text-muted hover:text-danger hover:bg-surface2 rounded-lg transition-colors"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VIDEOS MANAGEMENT */}
        {activeTab === "videos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  placeholder="Filter videos..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <span className="text-xs text-muted">{videos.length} Total Videos</span>
            </div>

            <div className="rounded-2xl border border-line overflow-hidden bg-surface shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface2 text-muted font-semibold border-b border-line">
                    <tr>
                      <th className="p-3">Video</th>
                      <th className="p-3">Creator</th>
                      <th className="p-3">Platform</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Views</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-fg">
                    {videos
                      .filter(
                        (v) =>
                          !videoSearch ||
                          v.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
                          v.userName.toLowerCase().includes(videoSearch.toLowerCase())
                      )
                      .map((v) => (
                        <tr key={v.id} className="hover:bg-surface2/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2 max-w-xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={v.thumbnailUrl}
                                alt={v.title}
                                className="w-10 h-7 rounded object-cover shrink-0"
                              />
                              <span className="font-medium text-fg truncate">{v.title}</span>
                            </div>
                          </td>
                          <td className="p-3">{v.userName}</td>
                          <td className="p-3 uppercase text-[10px] font-bold text-accent">
                            {v.platform}
                          </td>
                          <td className="p-3">
                            {v.isOwnerVideo ? (
                              <span className="text-warning font-bold">Owner</span>
                            ) : v.isPinned ? (
                              <span className="text-warning font-bold">Pinned</span>
                            ) : v.userRole === "vip" ? (
                              <span className="text-accent font-bold">VIP</span>
                            ) : (
                              <span className="text-muted">Community</span>
                            )}
                          </td>
                          <td className="p-3">{v.viewsCount}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <a
                                href={v.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-muted hover:text-fg rounded hover:bg-surface2 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleDeleteVideo(v.id)}
                                className="p-1.5 text-muted hover:text-danger rounded hover:bg-surface2 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USERS & CUSTOM DAILY LIMITS */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by ID, nickname, name, or email..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTransferTargetUserId(undefined);
                    setIsTransferModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-black font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all active:scale-95 shrink-0"
                >
                  <Coins className="w-4 h-4 text-black" />
                  <span>Transfer Free Credits</span>
                </button>
                <span className="text-xs text-muted font-medium">{usersList.length} Registered Users</span>
              </div>
            </div>

            <div className="rounded-2xl border border-line overflow-hidden bg-surface shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface2 text-muted font-semibold border-b border-line">
                    <tr>
                      <th className="p-3">User & ID</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Credits</th>
                      <th className="p-3">Today Posts</th>
                      <th className="p-3">Custom Daily Limit</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-fg">
                    {usersList
                      .filter(
                        (u) =>
                          !userSearch ||
                          u.id.toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
                          (u.nickname && u.nickname.toLowerCase().includes(userSearch.toLowerCase())) ||
                          (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
                      )
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-surface2/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-line"
                              />
                              <div>
                                <p className="font-bold text-fg flex items-center gap-1">
                                  <span>{u.nickname || u.name}</span>
                                  {u.nickname && u.name && (
                                    <span className="text-[10px] text-muted font-normal">
                                      ({u.name})
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-muted">{u.email}</p>
                                <div className="flex items-center gap-1 text-[10px] text-muted font-mono pt-0.5">
                                  <span className="truncate max-w-[130px]">ID: {u.id}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(u.id);
                                      setCopiedUserId(u.id);
                                      showToast("User ID copied!", "success");
                                      setTimeout(() => setCopiedUserId(null), 2000);
                                    }}
                                    className="text-accent hover:underline flex items-center gap-0.5 ml-0.5"
                                    title="Copy full User ID"
                                  >
                                    {copiedUserId === u.id ? (
                                      <Check className="w-2.5 h-2.5 text-success" />
                                    ) : (
                                      <Copy className="w-2.5 h-2.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleUpdateUser(u.id, { role: e.target.value as UserRole })
                              }
                              className="px-2 py-1 rounded bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-accent transition-colors"
                            >
                              <option value="owner">Owner</option>
                              <option value="admin">Admin</option>
                              <option value="vip">VIP</option>
                              <option value="user">User</option>
                            </select>
                          </td>
                          <td className="p-3 font-mono font-bold text-success">
                            {u.role === "owner" ? "∞" : u.postCredits}
                          </td>
                          <td className="p-3">{u.postsTodayCount || 0}</td>
                          <td className="p-3">
                            {/* Custom Daily Limit Configurator */}
                            <div className="flex items-center gap-1.5">
                              <select
                                value={
                                  u.customDailyLimit === -1
                                    ? "unlimited"
                                    : u.customDailyLimit !== null
                                    ? String(u.customDailyLimit)
                                    : "default"
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  let newLimit: number | null = null;
                                  if (val === "unlimited") newLimit = -1;
                                  else if (val === "default") newLimit = null;
                                  else newLimit = parseInt(val, 10);
                                  handleUpdateUser(u.id, { customDailyLimit: newLimit });
                                }}
                                className="px-2 py-1 rounded bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-accent transition-colors"
                              >
                                <option value="default">Default Role Limit</option>
                                <option value="unlimited">Unlimited (-1)</option>
                                <option value="1">1 / day</option>
                                <option value="3">3 / day</option>
                                <option value="10">10 / day</option>
                                <option value="25">25 / day</option>
                                <option value="50">50 / day</option>
                                <option value="100">100 / day</option>
                              </select>
                            </div>
                          </td>
                          <td className="p-3">
                            {u.isBanned ? (
                              <span className="px-2 py-0.5 rounded bg-danger/15 text-danger font-bold text-[10px] border border-danger/30">
                                Banned
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-success/15 text-success font-bold text-[10px] border border-success/30">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setTransferTargetUserId(u.id);
                                  setIsTransferModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 transition-colors flex items-center gap-1"
                                title="Transfer Free Credits to this clipper"
                              >
                                <Coins className="w-3 h-3 text-warning" />
                                <span>Send Credits</span>
                              </button>
                              <button
                                onClick={() => handleUpdateUser(u.id, { isBanned: !u.isBanned })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                  u.isBanned
                                    ? "bg-success/15 text-success hover:bg-success/25 border border-success/30"
                                    : "bg-danger/15 text-danger hover:bg-danger/25 border border-danger/30"
                                }`}
                              >
                                {u.isBanned ? "Unban" : "Ban"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REPORTS MODERATION */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-fg">Community Video Reports</h3>
            {reports.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface border border-line text-xs text-muted shadow-md">
                No reports submitted. The community feed is clear!
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-2xl bg-surface border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-fg text-xs">{rep.videoTitle}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rep.status === "pending"
                              ? "bg-danger/15 text-danger border border-danger/30"
                              : "bg-surface2 text-muted border border-line"
                          }`}
                        >
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        Reason: <strong className="text-danger">{rep.reason}</strong>
                      </p>
                      {rep.details && <p className="text-[11px] text-muted">{rep.details}</p>}
                      <p className="text-[10px] text-muted/70">Reported by: {rep.reporterEmail}</p>
                    </div>

                    {rep.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolveReport(rep.id, "dismissed")}
                          className="px-3 py-1.5 rounded-lg bg-surface2 hover:bg-line text-xs text-fg border border-line transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, "resolved", true)}
                          className="px-3 py-1.5 rounded-lg bg-danger hover:opacity-90 text-xs font-bold text-white shadow-md transition-opacity"
                        >
                          Delete Video & Resolve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS & AD SLOTS */}
        {activeTab === "settings" && settingsForm && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
            {/* PLATFORM RULES */}
            <div className="p-6 rounded-2xl bg-surface border border-line space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-fg">Platform Core Parameters</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg">
                    Min Watch Time (Seconds)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={settingsForm.minWatchSeconds}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, minWatchSeconds: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-accent transition-colors"
                  />
                  <p className="text-[10px] text-muted">Default: 13 seconds</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg">
                    Daily Limit (Normal Users)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={settingsForm.dailyPostLimitNormal}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        dailyPostLimitNormal: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-accent transition-colors"
                  />
                  <p className="text-[10px] text-muted">Default: 5 posts / day</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg">
                    Daily Limit (VIP Members)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={settingsForm.dailyPostLimitVip}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        dailyPostLimitVip: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-accent transition-colors"
                  />
                  <p className="text-[10px] text-muted">Default: 20 posts / day</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg">
                    Credit & Limit Refresh Interval (Hours, Default: 6)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={settingsForm.resetHour}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, resetHour: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg">VIP Monthly Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settingsForm.vipMonthlyPrice}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        vipMonthlyPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg">24h Pin Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settingsForm.pinVideoPrice}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        pinVideoPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* VIP AD-FREE TOGGLE */}
              <div className="pt-4 border-t border-line flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-fg">Hide Ads for VIP Members</p>
                  <p className="text-[11px] text-muted">
                    Automatically suppress all banner and native ads for VIP subscribers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.hideAdsForVip}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, hideAdsForVip: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-accent focus:ring-accent"
                />
              </div>
            </div>

            {/* OWNER BONUS SYSTEM SETTINGS */}
            <div className="p-6 rounded-2xl bg-surface border border-warning/30 space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-bold text-fg">Owner Bonus System Parameters</h3>
              </div>
              <p className="text-xs text-muted">
                Reward clippers who watch and support platform owner clips. Each verified owner clip grants bonus daily post slots and post credits.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg">
                    Bonus Slots / Clip
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={settingsForm.ownerBonusSlots ?? 2}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        ownerBonusSlots: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-warning transition-colors"
                  />
                  <p className="text-[10px] text-muted">Default: +2 slots</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg">
                    Credits Awarded / Clip
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={settingsForm.ownerBonusCredits ?? 2}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        ownerBonusCredits: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-warning transition-colors"
                  />
                  <p className="text-[10px] text-muted">Default: +2 credits</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg">
                    Max Bonus (Normal User)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={settingsForm.maxBonusSlotsNormal ?? 5}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        maxBonusSlotsNormal: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-warning transition-colors"
                  />
                  <p className="text-[10px] text-muted">5 base + 5 bonus = 10 max</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg">
                    Max Bonus (VIP User)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={settingsForm.maxBonusSlotsVip ?? 10}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        maxBonusSlotsVip: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-warning transition-colors"
                  />
                  <p className="text-[10px] text-muted">20 base + 10 bonus = 30 max</p>
                </div>
              </div>
            </div>

            {/* AD SLOTS EDITABLE CODES */}
            <div className="p-6 rounded-2xl bg-surface border border-line space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-fg">Ad Slot Codes (Google AdSense / Custom)</h3>
              <p className="text-xs text-muted">
                Paste HTML / Google AdSense script tags here. The owner earns from every ad shown on the platform.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-fg mb-1">
                    Top Banner (under Navbar)
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.adSlots?.topBanner || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        adSlots: { ...settingsForm.adSlots, topBanner: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-surface2 border border-line font-mono text-[11px] text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-fg mb-1">
                    Desktop Sticky Sidebar Ad
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.adSlots?.sidebar || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        adSlots: { ...settingsForm.adSlots, sidebar: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-surface2 border border-line font-mono text-[11px] text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-fg mb-1">
                    In-Feed Native Ad (every 6 cards)
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.adSlots?.inFeed || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        adSlots: { ...settingsForm.adSlots, inFeed: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-surface2 border border-line font-mono text-[11px] text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-fg mb-1">
                    Reward & Verified Screen Banner
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.adSlots?.rewardBanner || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        adSlots: { ...settingsForm.adSlots, rewardBanner: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-surface2 border border-line font-mono text-[11px] text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-accent hover:opacity-95 text-accent-fg font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 shadow-md transition-opacity"
            >
              <Save className="w-4 h-4" />
              <span>Save Platform Settings</span>
            </button>
          </form>
        )}
      </div>

      {/* OWNER FREE CREDIT TRANSFER & USER ID SEARCH MODAL */}
      <OwnerCreditTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          loadData();
        }}
        initialUserId={transferTargetUserId}
      />
    </div>
  );
}
