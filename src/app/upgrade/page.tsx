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

export default function UpgradePage() {
  const router = useRouter();
  const { user, settings, showToast } = useApp();
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

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to start checkout", "error");
        setLoadingType(null);
        return;
      }

      if (data.url) {
        // Redirect to Stripe checkout (or simulated demo checkout)
        window.location.href = data.url;
      }
    } catch {
      showToast("Network error initiating checkout", "error");
      setLoadingType(null);
    }
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
                    <strong className="text-fg">20 Posts Per Day</strong> (Normal users get 5)
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
                    <strong className="text-fg">Ad-Free Experience:</strong> Zero banner ads across the platform
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-accent shrink-0" />
                  <span>Cancel anytime with 1-click in your Stripe portal</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handleCheckout("vip")}
                disabled={loadingType === "vip" || user?.role === "vip"}
                className={`w-full py-3.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
                  user?.role === "vip"
                    ? "bg-surface2 text-muted border border-line cursor-default"
                    : "bg-accent hover:opacity-95 text-accent-fg transform active:scale-98"
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
                    <span>Upgrade to VIP (${vipPrice}/mo)</span>
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

            <div className="pt-8">
              <button
                onClick={() => handleCheckout("pin")}
                disabled={loadingType === "pin" || userVideos.length === 0}
                className="w-full py-3.5 rounded-xl bg-warning hover:opacity-95 text-black font-black text-xs tracking-wider uppercase transition-opacity shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-98"
              >
                {loadingType === "pin" ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>Pin Selected Video (${pinPrice})</span>
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
