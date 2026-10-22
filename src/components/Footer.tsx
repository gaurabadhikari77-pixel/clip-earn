"use client";

import React from "react";
import Link from "next/link";
import { Scissors, Play, Heart, Shield, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { AdSlot } from "./AdSlot";

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-line mt-20 relative z-20 text-fg">
      {/* Footer banner ad */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <AdSlot type="footerBanner" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 select-none">
              <div className="relative w-8 h-8 rounded-xl bg-accent p-[1px]">
                <div className="w-full h-full bg-surface rounded-[11px] flex items-center justify-center relative">
                  <Scissors className="w-4 h-4 text-accent transform -rotate-45" />
                  <Play className="w-2 h-2 text-accent fill-accent absolute bottom-1 right-1" />
                </div>
              </div>
              <div className="flex items-center text-xl font-black tracking-tight text-fg">
                <span>Clip</span>
                <span className="text-accent">Earn</span>
              </div>
            </Link>

            <p className="text-xs text-muted max-w-sm leading-relaxed">
              {siteConfig.description}
            </p>

            <p className="text-[11px] text-muted/80">
              Built exclusively as a web platform for video clippers. No app store downloads required—access seamlessly from any web browser.
            </p>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-fg mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  Community Feed
                </Link>
              </li>
              <li>
                <Link href="/post" className="hover:text-accent transition-colors">
                  Post Your Clip
                </Link>
              </li>
              <li>
                <Link href="/upgrade" className="hover:text-accent transition-colors">
                  VIP Membership
                </Link>
              </li>
              <li>
                <Link href="/my-videos" className="hover:text-accent transition-colors">
                  Creator Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Clipper Community & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-fg mb-3">
              Community & Rules
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <span>Mutual Support Standard</span>
              </li>
              <li>
                <span>13s Minimum Engagement</span>
              </li>
              <li>
                <span>Anti-Abuse Verification</span>
              </li>
              <li>
                <Link href="/admin" className="text-warning hover:opacity-80 transition-opacity flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* SEO ECOSYSTEM & KEYWORD CLUSTER: Whop Clipster, Noisy.la, Content Rewards */}
        <div className="py-8 border-t border-line space-y-4">
          <div className="space-y-1">
            <h5 className="text-xs font-bold uppercase tracking-wider text-fg flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>The Premier Content Reward Platform for Short-Form Clippers</span>
            </h5>
            <p className="text-xs text-muted leading-relaxed max-w-4xl">
              ClipEarn is the open community alternative to platforms like <strong>Whop Clipster</strong>, <strong>Whop Video Rewards</strong>, and <strong>Noisy.la</strong>. Rather than paying expensive subscriptions or dealing with inactive bot networks, ClipEarn empowers video clippers to exchange authentic watch time, earn post credits, and accelerate organic algorithmic reach across TikTok, YouTube Shorts, and Instagram Reels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="text-muted font-bold text-[10px] uppercase tracking-wider">Related Topics:</span>
            {[
              "Content Reward",
              "Whop Clipster",
              "Whop Alternative",
              "Clipster Video Exchange",
              "Noisy.la Alternative",
              "Noisy Clip Farm",
              "TikTok Clippers",
              "YouTube Shorts Views",
              "Instagram Reels Growth",
              "Stream Clippers (Twitch & Kick)",
              "Clipper Rewards",
              "Watch and Earn Video Clips",
              "Short Form Video Exchange",
              "Viral Clips Boost",
              "Organic View Exchange",
            ].map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-surface2 border border-line text-muted hover:text-fg hover:border-accent transition-colors select-none"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name} Website Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span>Designed for creators with</span>
            <Heart className="w-3.5 h-3.5 text-danger fill-danger" />
            <span>Watch. Support. Get Seen.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
