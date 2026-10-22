"use client";

import React from "react";
import Link from "next/link";
import {
  Scissors,
  Play,
  Sparkles,
  Flame,
  CheckCircle2,
  Users,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Shuffle,
  ThumbsUp,
  Clock,
  Crown,
} from "lucide-react";
import { siteConfig } from "@/config/site";

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12 text-fg">
      {/* 1. HERO HEADER */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The #1 Content Reward Platform for Clippers</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-fg tracking-tight">
          Helping Video Creators Get Views, Watch Time & Engagement
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-2xl mx-auto leading-relaxed">
          ClipEarn was built to solve the biggest frustration in content creation: spending hours editing clips only to get trapped at 200 views. We connect creators in a transparent, mutual watch-and-support community.
        </p>
      </div>

      {/* 2. THE PROBLEM VS THE CLIPEARN SOLUTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-surface border border-line space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-danger/15 text-danger border border-danger/30">
            The Algorithmic Trap
          </div>
          <h3 className="text-lg font-black text-fg">Why Most Clips Die at 200 Views</h3>
          <p className="text-xs text-muted leading-relaxed">
            Short-form algorithms (TikTok, YouTube Shorts, Instagram Reels) test new clips on small test batches. If viewers scroll past in the first 3 seconds without liking, the algorithm marks the video as low retention and kills distribution immediately.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface border-2 border-accent space-y-3 shadow-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
            The ClipEarn Fix
          </div>
          <h3 className="text-lg font-black text-fg">High-Retention Human Engagement</h3>
          <p className="text-xs text-muted leading-relaxed">
            On ClipEarn, genuine fellow creators watch your clip for <strong>13+ seconds</strong> and leave a confirmed <strong>like</strong>. This sends powerful positive retention signals directly to platform algorithms, triggering organic algorithmic recommendation pushes!
          </p>
        </div>
      </div>

      {/* 3. HOW CLIPEARN WORKS (4 STEP FLOW) */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-fg tracking-tight">How the Platform Works</h2>
          <p className="text-xs text-muted">A fair, meritocratic cycle designed to reward active creators</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-surface border border-line space-y-3 relative">
            <span className="w-7 h-7 rounded-xl bg-accent text-accent-fg font-black text-xs flex items-center justify-center shadow-sm">
              1
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-fg flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span>Watch 13+ Seconds</span>
              </h4>
              <p className="text-[11px] text-muted leading-relaxed">
                Click any clip from the feed. Active tab detection tracks real watch-time with an on-screen timer.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-surface border border-line space-y-3 relative">
            <span className="w-7 h-7 rounded-xl bg-accent text-accent-fg font-black text-xs flex items-center justify-center shadow-sm">
              2
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-fg flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-accent" />
                <span>Like to Verify</span>
              </h4>
              <p className="text-[11px] text-muted leading-relaxed">
                Liking the clip is mandatory for reward claiming, ensuring all clippers receive genuine community support.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-surface border border-line space-y-3 relative">
            <span className="w-7 h-7 rounded-xl bg-accent text-accent-fg font-black text-xs flex items-center justify-center shadow-sm">
              3
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-fg flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-warning" />
                <span>Earn Post Credits</span>
              </h4>
              <p className="text-[11px] text-muted leading-relaxed">
                Earn 1 credit per community clip. Watch verified Owner clips for <strong>+2 credits & +2 bonus upload slots</strong>!
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-surface border border-line space-y-3 relative">
            <span className="w-7 h-7 rounded-xl bg-accent text-accent-fg font-black text-xs flex items-center justify-center shadow-sm">
              4
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-fg flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5 text-success" />
                <span>3-Min Fair Shuffle</span>
              </h4>
              <p className="text-[11px] text-muted leading-relaxed">
                Spend 1.5 credits to post your clip. Clips cycle through the feed every 3 minutes so everyone gets equal exposure!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PLATFORM VALUES & ANTI-ABUSE */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-line space-y-6 shadow-xl">
        <h3 className="text-xl font-black text-fg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-success" />
          <span>Our Community Standards & Rules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface2 border border-line space-y-1.5">
            <p className="font-bold text-fg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>No Bots or Artificial Click Farms</span>
            </p>
            <p className="text-muted leading-relaxed text-[11px]">
              Every single user on ClipEarn authenticates via verified Google accounts. Automated scrapers and fake bot views are strictly blocked.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface2 border border-line space-y-1.5">
            <p className="font-bold text-fg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Full Identity Privacy Guaranteed</span>
            </p>
            <p className="text-muted leading-relaxed text-[11px]">
              Your Gmail address and real name are never exposed publicly. You choose your custom Clipper Nickname and avatar.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface2 border border-line space-y-1.5">
            <p className="font-bold text-fg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Daily Limits & Fair Play</span>
            </p>
            <p className="text-muted leading-relaxed text-[11px]">
              Normal clippers have a base limit of 1 post upon joining, unlocking up to 5 additional slots by supporting fellow creators. All limits and credits refresh every 6 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface2 border border-line space-y-1.5">
            <p className="font-bold text-fg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>VIP & 48h Pinned Showcases</span>
            </p>
            <p className="text-muted leading-relaxed text-[11px]">
              High-volume clippers can upgrade to VIP for 20 posts per day and zero ads, or pin videos for 24h guaranteed top feed placement.
            </p>
          </div>
        </div>
      </div>

      {/* 5. CALL TO ACTION */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900/40 via-surface to-accent/10 border border-accent/30 text-center space-y-4 shadow-xl">
        <h3 className="text-2xl sm:text-3xl font-black text-fg tracking-tight">
          Ready to Explode Your Clip Reach?
        </h3>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto">
          Join hundreds of active streamers, editors, and clippers already exchanging genuine watch time on ClipEarn today.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-accent text-accent-fg font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span>Explore Community Feed</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/upgrade"
            className="px-6 py-3 rounded-xl bg-surface2 border border-line hover:border-pink-500/40 text-pink-400 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            <span>VIP Creator Perks</span>
          </Link>
        </div>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="flex items-center justify-between text-xs text-muted pt-4 border-t border-line">
        <Link href="/" className="hover:text-accent font-bold transition-colors">
          &larr; Back to Community Feed
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-accent transition-colors">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-accent transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
