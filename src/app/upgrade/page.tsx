"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crown,
  Sparkles,
  Flame,
  Check,
  Shield,
  Zap,
  ArrowRight,
  Video as VideoIcon,
  CreditCard,
  History,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { AdSlot } from "@/components/AdSlot";
import { Video, Transaction } from "@/types";
import { db } from "@/lib/store";

export default function UpgradePage() {
  const router = useRouter();
  const { user, settings, showToast, refreshUserData } = useApp();
  const [loadingType, setLoadingType] = useState<"vip" | "pin" | null>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [selectedPinVideoId, setSelectedPinVideoId] = useState<string>("");
  const [purchaseHistory, setPurchaseHistory] = useState<Transaction[]>([]);

  const vipPrice = settings?.vipMonthlyPrice || 12.99;
  const pinPrice = settings?.pinVideoPrice || 5.0;

  useEffect(() => {
    if (user?.id) {
      // Fetch user's videos for pinning
      fetch(`/api/videos?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const sectionsObj = data.sections || {};
          const allUserVideos: Video[] = Object.values(sectionsObj)
            .flat()
            .filter((v: any) => v && v.userId === user.id) as Video[];

          setUserVideos(allUserVideos);
          if (allUserVideos.length > 0) {
            setSelectedPinVideoId(allUserVideos[0].id);
          }
        })
        .catch(console.error);
    }
  }, [user?.id]);

  const handleCheckout = async (type: "vip" | "pin") => {
    if (!user) {
      showToast("Please log in to upgrade", "error");
      return;
    }

    if (type === "pin" && !selectedPinVideoId) {
      showToast("Please select one of your videos to pin, or post a video first!", "error");
      return;
    }

    setLoadingType(type);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          type,
          targetVideoId: type === "pin" ? selectedPinVideoId : undefined,
          redirectOrigin: window.location.origin,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch {
      // Fallback for static hosting (GitHub Pages)
    }

    // Redirect to owner's Instagram for VIP upgrade and pins
    if (type === "vip") {
      if (typeof window !== "undefined") {
        window.location.href = "https://www.instagram.com/gaurabb_adk/";
      }
      return;
    } else if (type === "pin") {
      if (typeof window !== "undefined") {
        window.location.href = "https://www.instagram.com/gaurabb_adk/";
      }
      return;
    }
    setLoadingType(null);
  };

  return (
    <div className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-fg">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Banner Ad */}
        <AdSlot type="upgradeBanner" />

        {/* HEADER */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Monetization & Creator Growth</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-fg tracking-tight">
            Accelerate Your Video Reach
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Get 20 posts per day, exclusive VIP badges, and pin your viral clips to the very
            top of the platform feed for guaranteed visibility.
          </p>
        </div>

        {/* DIRECT INSTAGRAM VIP PURCHASE BANNER */}
        <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-surface border-2 border-pink-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-fg flex items-center gap-2">
                <span>Want to Buy VIP Premium?</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-pink-500/15 text-pink-400 border border-pink-500/30">
                  Instant Support
                </span>
              </p>
              <p className="text-xs text-muted">
                Contact owner directly on Instagram:{" "}
                <a
                  href="https://www.instagram.com/gaurabb_adk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 font-bold underline"
                >
                  https://www.instagram.com/gaurabb_adk/
                </a>{" "}
                for instant VIP upgrades, custom limits & pins!
              </p>
            </div>
          </div>
          <a
            href="https://www.instagram.com/gaurabb_adk/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 text-white font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center gap-2"
          >
            <span>Message @gaurabb_adk &rarr;</span>
          </a>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* CARD 1: VIP MEMBERSHIP */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative rounded-2xl bg-surface border-2 border-accent p-8 shadow-xl flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 text-[10px] font-extrabold uppercase tracking-wider">
              Most Popular
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-surface2 border border-line flex items-center justify-center text-accent">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-fg">VIP Creator Plan</h3>
                  <p className="text-xs text-muted">High-volume clipper membership</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1 text-fg">
                <span className="text-4xl sm:text-5xl font-black">${vipPrice}</span>
                <span className="text-xs text-muted font-semibold">/ month</span>
              </div>

              <ul className="space-y-3 text-xs text-muted">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent shrink-0" />
                  <span>
                    <strong className="text-fg">20 Posts Per Day</strong> (Normal clippers get 1)
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent shrink-0" />
                  <span>
                    <strong className="text-fg">VIP Feed Section:</strong> Clips featured in the VIP Section
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent shrink-0" />
                  <span>
                    <strong className="text-fg">VIP Profile Badge:</strong> Stand out to all community members
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent shrink-0" />
                  <span>
                    <strong className="text-fg">Ad-Free Experience:</strong> Zero ads across the platform
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-8 space-y-2.5">
              <a
                href="https://www.instagram.com/gaurabb_adk/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white active:scale-[0.98]"
              >
                <Crown className="w-4 h-4" />
                <span>DM on Instagram to Buy VIP (@gaurabb_adk)</span>
              </a>

              <button
                onClick={() => handleCheckout("vip")}
                disabled={loadingType === "vip" || user?.role === "vip"}
                className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                  user?.role === "vip"
                    ? "bg-surface2 text-muted border border-line cursor-default"
                    : "bg-surface2 hover:bg-line border border-line text-fg"
                }`}
              >
                {loadingType === "vip" ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : user?.role === "vip" ? (
                  <>
                    <Check className="w-4 h-4 text-success" />
                    <span>Active VIP Member</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Instant Demo Upgrade (${vipPrice}/mo)</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* CARD 2: PIN A VIDEO */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative rounded-2xl bg-surface border-2 border-line hover:border-warning/60 p-8 shadow-xl flex flex-col justify-between transition-colors"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-surface2 border border-line flex items-center justify-center text-warning">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-fg">24h Video Pin</h3>
                  <p className="text-xs text-muted">Guaranteed top feed exposure</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1 text-fg">
                <span className="text-4xl sm:text-5xl font-black">${pinPrice}</span>
                <span className="text-xs text-muted font-semibold">/ 24 hours</span>
              </div>

              <ul className="space-y-3 text-xs text-muted">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-warning shrink-0" />
                  <span>
                    <strong className="text-fg">Top Pinned Section:</strong> Sits directly under the owner clips
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-warning shrink-0" />
                  <span>
                    <strong className="text-fg">Glowing Flame Badge:</strong> Draws maximum eyes from active viewers
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-warning shrink-0" />
                  <span>Up to 2 videos can be pinned simultaneously per creator</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-warning shrink-0" />
                  <span>Full 24-hour duration from moment of confirmation</span>
                </li>
              </ul>

              {/* VIDEO SELECTOR FOR PINNING */}
              <div className="pt-2 space-y-1.5">
                <label className="block text-xs font-bold text-fg">
                  Select your video to pin:
                </label>
                {userVideos.length > 0 ? (
                  <select
                    value={selectedPinVideoId}
                    onChange={(e) => setSelectedPinVideoId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-line text-xs text-fg focus:outline-none focus:border-warning transition-colors"
                  >
                    {userVideos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title} ({v.platform})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-surface2 border border-line text-xs text-muted">
                    No videos posted yet.{" "}
                    <Link href="/post" className="text-accent underline font-semibold">
                      Post a video first
                    </Link>{" "}
                    to pin it!
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 space-y-2.5">
              <a
                href="https://www.instagram.com/gaurabb_adk/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white font-black text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Flame className="w-4 h-4" />
                <span>DM on Instagram to Pin Video (@gaurabb_adk)</span>
              </a>

              <button
                onClick={() => handleCheckout("pin")}
                disabled={loadingType === "pin" || userVideos.length === 0}
                className="w-full py-2.5 rounded-xl bg-surface2 hover:bg-line border border-line text-fg font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingType === "pin" ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-warning" />
                    <span>Instant Demo Pin (${pinPrice})</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* SECURITY & GUARANTEES */}
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-surface border border-line flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left text-xs text-muted">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-accent" />
            <div>
              <p className="font-bold text-fg">Stripe Verified</p>
              <p className="text-[11px]">256-bit SSL encrypted checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-warning" />
            <div>
              <p className="font-bold text-fg">Instant Activation</p>
              <p className="text-[11px]">Automated webhooks unlock perks immediately</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-success" />
            <div>
              <p className="font-bold text-fg">Fair Community</p>
              <p className="text-[11px]">Genuine organic clipper traffic</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
