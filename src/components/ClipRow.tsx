"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Video } from "@/types";
import { VideoCard } from "./VideoCard";

interface ClipRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  seeAllHref?: string;
  actionButton?: React.ReactNode;
  clips: Video[];
  watchedSet?: Set<string>;
  onReportClick?: (v: Video) => void;
  isFresh?: boolean;
}

export function ClipRow({
  title,
  subtitle,
  icon,
  badge,
  seeAllHref,
  actionButton,
  clips,
  watchedSet,
  onReportClick,
  isFresh = false,
}: ClipRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [clips]);

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!clips || clips.length === 0) return null;

  return (
    <div className="space-y-3 relative group/row">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="p-1.5 rounded-xl bg-surface2 border border-line text-accent">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-fg flex items-center gap-2">
                {title}
              </h2>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-muted font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actionButton}
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-xs font-bold text-accent hover:opacity-80 flex items-center gap-1 transition-opacity mr-1"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* ARROW BUTTONS */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-1.5 rounded-xl border transition-all ${
                canScrollLeft
                  ? "bg-surface2 border-line text-fg hover:bg-line"
                  : "bg-surface border-line/40 text-muted/40 cursor-not-allowed"
              }`}
              title="Previous clips"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-1.5 rounded-xl border transition-all ${
                canScrollRight
                  ? "bg-surface2 border-line text-fg hover:bg-line"
                  : "bg-surface border-line/40 text-muted/40 cursor-not-allowed"
              }`}
              title="More clips"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SWIPEABLE HORIZONTAL ROW WITH SNAP SCROLLING */}
      <div
        ref={rowRef}
        onScroll={checkScroll}
        className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3 pt-1 px-1 -mx-1"
      >
        {clips.map((clip) => (
          <div
            key={clip.id}
            className="snap-start w-[145px] sm:w-[165px] md:w-[180px] shrink-0"
          >
            <VideoCard
              video={clip}
              isWatched={watchedSet?.has(clip.id)}
              onReportClick={onReportClick}
              isFresh={isFresh}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
