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
  // Ads placeholder removed for now
  return null;
}
