"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Video as VideoIcon,
  Eye,
  Heart,
  PlusCircle,
  ExternalLink,
  Trash2,
  Flame,
  Crown,
  Coins,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Video } from "@/types";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/store";

export default function MyVideosPage() {
  const { user, refreshUserData, showToast } = useApp();
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyVideos = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const filtered = db.getVideos().filter((v) => v.userId === user.id);
      setMyVideos(filtered);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVideos();
  }, [user?.id]);

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to remove this video from ClipEarn?")) return;
    try {
      db.deleteVideo(videoId);
      showToast("Video deleted successfully", "success");
      setMyVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch {
      showToast("Error deleting video", "error");
    }
  };

  const totalViews = myVideos.reduce((acc, v) => acc + (v.viewsCount || 0), 0);
  const totalSupports = myVideos.reduce((acc, v) => acc + (v.engagementsCount || 0), 0);

  return (
    <div className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-fg">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-fg tracking-tight flex items-center gap-2.5">
              <span>My Videos & Analytics</span>
              {user?.role === "owner" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30 uppercase">
                  Owner
                </span>
              )}
              {user?.role === "vip" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 uppercase">
                  VIP
                </span>
              )}
            </h1>
            <p className="text-xs text-muted mt-1">
              Track authentic views, likes, and comments received from fellow community clippers.
            </p>
          </div>

          <Link
            href="/post"
            className="px-4 py-2 rounded-xl bg-accent hover:opacity-95 text-accent-fg font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-opacity"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Clip</span>
          </Link>
        </div>

        {/* ANALYTICS STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface border border-line space-y-1">
            <span className="text-xs font-semibold text-muted">Total Clips Posted</span>
            <p className="text-2xl font-black text-fg">{myVideos.length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-line space-y-1">
            <span className="text-xs font-semibold text-muted">Total Views Received</span>
            <p className="text-2xl font-black text-accent flex items-center gap-1.5">
              <Eye className="w-5 h-5 text-accent" />
              {totalViews}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-line space-y-1">
            <span className="text-xs font-semibold text-muted">Community Supports Earned</span>
            <p className="text-2xl font-black text-warning flex items-center gap-1.5">
              <Heart className="w-5 h-5 text-warning" />
              {totalSupports}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-line space-y-1">
            <span className="text-xs font-semibold text-muted">Available Post Credits</span>
            <p className="text-2xl font-black text-success flex items-center gap-1.5">
              <Coins className="w-5 h-5 text-success" />
              {user?.role === "owner" ? "∞" : user?.postCredits || 0}
            </p>
          </div>
        </div>

        {/* VIDEOS LIST */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-fg">Active Feed Posts</h2>

          {loading ? (
            <div className="text-center py-12 text-muted text-xs">
              Loading your posted clips...
            </div>
          ) : myVideos.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface border border-line space-y-3">
              <VideoIcon className="w-10 h-10 text-muted mx-auto" />
              <p className="text-sm font-bold text-fg">You haven&apos;t posted any videos yet</p>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Paste your TikTok, YouTube, or Instagram clip to start gaining verified views!
              </p>
              <Link
                href="/post"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-fg font-bold text-xs hover:opacity-90 shadow-md transition-opacity"
              >
                Post Your First Video
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myVideos.map((video) => (
                <div
                  key={video.id}
                  className="rounded-2xl bg-surface border border-line overflow-hidden space-y-3 p-4 flex flex-col justify-between shadow-md"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-surface2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-surface text-fg border border-line">
                          {video.platform}
                        </span>
                        {video.isPinned && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-warning text-black flex items-center gap-1 font-black">
                            <Flame className="w-3 h-3 fill-black" /> Pinned
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-fg line-clamp-2">
                      {video.title}
                    </h4>
                  </div>

                  <div className="pt-3 border-t border-line space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-muted" />
                        {video.viewsCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-accent" />
                        {video.engagementsCount} supports
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open Native Video
                      </a>

                      <button
                        onClick={() => handleDelete(video.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-surface2 transition-colors"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
