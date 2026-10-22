"use client";

import React from "react";
import Link from "next/link";
import { Scissors, Play, Heart, Sparkles } from "lucide-react";
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
                <Link href="/leaderboard" className="hover:text-accent transition-colors">
                  Clipper Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/upgrade" className="hover:text-accent transition-colors">
                  VIP Membership
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-fg mb-3">
              About & Legal
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link href="/about" className="hover:text-accent font-semibold transition-colors">
                  About ClipEarn
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-accent font-semibold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent font-semibold transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <span>13s Watch & Like Standard</span>
              </li>
            </ul>
          </div>

          {/* Clipper Community & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-fg mb-3">
              Community & Owner
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <a
                  href="https://www.instagram.com/gaurabb_adk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Instagram: @gaurabb_adk</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:iamdeathflow11@gmail.com"
                  className="hover:text-accent transition-colors"
                >
                  Email: iamdeathflow11@gmail.com
                </a>
              </li>
              <li>
                <span>Anti-Abuse Verification</span>
              </li>
              <li>
                <span>6-Hour Credit Refresh</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ECOSYSTEM & VALUE PROPOSITION */}
        <div className="py-8 border-t border-line space-y-4">
          <div className="space-y-1">
            <h5 className="text-xs font-bold uppercase tracking-wider text-fg flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Real Views & Algorithmic Engagement for Short-Form Clippers</span>
            </h5>
            <p className="text-xs text-muted leading-relaxed max-w-4xl">
              ClipEarn helps clippers, stream editors, and video creators get genuine views, high retention signals, and real algorithmic momentum across TikTok, YouTube Shorts, and Instagram Reels. By connecting clippers in a transparent watch-and-earn ecosystem, every creator gets noticed and rewarded fairly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="text-muted font-bold text-[10px] uppercase tracking-wider">Related Topics:</span>
            {[
              "Content Reward",
              "Real Video Views",
              "Genuine Engagement",
              "TikTok Clippers",
              "YouTube Shorts Reach",
              "Instagram Reels Growth",
              "Stream Clippers (Twitch & Kick)",
              "Clipper Rewards",
              "Watch and Earn Video Clips",
              "Short Form Video Exchange",
              "Viral Clips Boost",
              "Organic View Exchange",
              "Algorithm Watch-Time Booster",
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
          <div className="flex items-center gap-3 text-[11px]">
            <Link href="/about" className="hover:text-accent font-medium transition-colors">
              About
            </Link>
            <span className="text-line">&bull;</span>
            <Link href="/privacy" className="hover:text-accent font-medium transition-colors">
              Privacy Policy
            </Link>
            <span className="text-line">&bull;</span>
            <Link href="/contact" className="hover:text-accent font-medium transition-colors">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span>Designed for creators with</span>
            <Heart className="w-3.5 h-3.5 text-danger fill-danger" />
            <span>Watch. Like. Get Seen.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
