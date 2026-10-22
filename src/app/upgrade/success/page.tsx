"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, ArrowRight, Flame, Crown } from "lucide-react";
import { useApp } from "@/context/AppContext";

import { db } from "@/lib/store";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUserData, triggerRewardMoment } = useApp();

  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const sessionId = searchParams.get("session_id") || "";
  const type = (searchParams.get("type") as "vip" | "pin") || "vip";
  const videoId = searchParams.get("videoId") || "";

  useEffect(() => {
    async function activate() {
      if (!user?.id) return;

      try {
        if (type === "vip") {
          db.updateUserRole(user.id, "vip");
        } else if (type === "pin" && videoId) {
          db.pinVideo(videoId, 24);
        }
        setConfirmed(true);
        triggerRewardMoment();
        await refreshUserData();
      } catch (e) {
        console.error("Activation error", e);
      } finally {
        setLoading(false);
      }
    }

    activate();
  }, [user?.id, type, videoId, sessionId, refreshUserData, triggerRewardMoment]);

  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center py-12 px-4 text-fg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full rounded-2xl bg-surface border border-line p-8 text-center space-y-6 shadow-xl"
      >
        <div className="w-16 h-16 rounded-full bg-surface2 border border-line flex items-center justify-center mx-auto">
          {type === "vip" ? (
            <Crown className="w-8 h-8 text-accent" />
          ) : (
            <Flame className="w-8 h-8 text-warning" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-fg">
            {type === "vip" ? "VIP Membership Activated!" : "Video Pinned to Top!"}
          </h2>
          <p className="text-xs text-muted">
            {type === "vip"
              ? "Your 20 daily posts limit, VIP section placement, and ad-free browsing are now active."
              : "Your selected video is now pinned at the very top of the Pinned section for 24 hours."}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface2 border border-line text-xs text-fg space-y-1">
          <div className="flex justify-between">
            <span className="text-muted">Transaction ID:</span>
            <span className="font-mono text-fg truncate max-w-[150px]">
              {sessionId || "sim_tx_complete"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Status:</span>
            <span className="text-success font-bold">Confirmed & Active</span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full py-3.5 rounded-xl bg-accent hover:opacity-95 text-accent-fg font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity shadow-md"
          >
            <span>Return to Community Feed</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted">Processing activation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
