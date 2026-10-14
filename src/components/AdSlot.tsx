"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export type AdSlotType =
  | "topBanner"
  | "sidebar"
  | "inFeed"
  | "rewardBanner"
  | "postBanner"
  | "upgradeBanner"
  | "footerBanner";

interface AdSlotProps {
  type: AdSlotType;
  className?: string;
}

export function AdSlot({ type, className = "" }: AdSlotProps) {
  const { user, settings } = useApp();

  // If VIP user and hideAdsForVip is enabled, do not render ads
  const isVip = user?.role === "vip" || user?.role === "owner";
  if (isVip && settings?.hideAdsForVip) {
    return null;
  }

  // Get ad code from settings
  const adCode = settings?.adSlots?.[type];

  // Specific aspect-ratio and dimension bounding boxes to prevent CLS
  const containerStyles: Record<AdSlotType, string> = {
    topBanner: "w-full max-w-5xl mx-auto my-4 min-h-[60px]",
    sidebar: "w-full min-h-[260px] sticky top-24",
    inFeed: "w-full my-6 min-h-[96px]",
    rewardBanner: "w-full my-3 min-h-[48px]",
    postBanner: "w-full my-4 min-h-[60px]",
    upgradeBanner: "w-full my-4 min-h-[60px]",
    footerBanner: "w-full min-h-[48px]",
  };

  return (
    <div
      data-ad-slot={type}
      className={`relative z-10 ${containerStyles[type]} ${className}`}
    >
      {adCode ? (
        <div
          dangerouslySetInnerHTML={{ __html: adCode }}
          className="w-full h-full rounded-2xl bg-surface2 border border-line overflow-hidden"
        />
      ) : (
        <div className="w-full h-full p-3 rounded-2xl border border-line bg-surface2 text-center flex flex-col items-center justify-center gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
            Advertisement
          </span>
          <span className="text-[9px] text-muted/70">
            Sponsored space • {type}
          </span>
        </div>
      )}
    </div>
  );
}
