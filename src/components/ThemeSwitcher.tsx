"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, RotateCcw, Sparkles } from "lucide-react";
import { useTheme, THEME_PRESETS, ThemeId, getReadableForeground } from "@/context/ThemeContext";

const QUICK_ACCENTS = [
  "#7C5CFF", // Purple
  "#FF4D6D", // Pink
  "#00C2FF", // Cyan
  "#3DDC84", // Green
  "#FF7A1A", // Amber
  "#F43F5E", // Rose
  "#EAB308", // Yellow
  "#3B82F6", // Blue
];

export function ThemeSwitcher() {
  const { theme, customAccent, setTheme, setCustomAccent, resetToDefault } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAccent(e.target.value);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme palette"
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface hover:bg-surface2 text-fg border border-line hover:border-accent transition-colors shadow-sm"
        title="Change theme palette"
      >
        <Palette className="w-4 h-4 text-accent" />
      </button>

      {/* DROPDOWN POPOVER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 rounded-2xl bg-surface border border-line shadow-2xl p-4 z-50 text-fg space-y-4 select-none"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Palette className="w-3.5 h-3.5 text-accent" />
                <span>Theme & Color Palette</span>
              </div>
              <button
                type="button"
                onClick={resetToDefault}
                className="flex items-center gap-1 text-[11px] text-muted hover:text-fg hover:underline transition-colors"
                title="Reset to default theme"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* PRESET THEME CARDS */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((p) => {
                  const isActive = theme === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTheme(p.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isActive
                          ? "border-accent bg-surface2 font-bold shadow-sm"
                          : "border-line bg-surface hover:bg-surface2 text-muted hover:text-fg"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* 3 Color swatch dots: bg, surface, accent */}
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: p.colors.bg }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: p.colors.surface }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: p.colors.accent }}
                          />
                        </div>
                        <span className="text-xs">{p.name}</span>
                      </div>

                      {isActive && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOM ACCENT COLOR PICKER */}
            <div className="space-y-2 pt-2 border-t border-line">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Custom Accent
                </span>
                {customAccent && (
                  <button
                    type="button"
                    onClick={() => setCustomAccent(null)}
                    className="text-[10px] text-muted hover:text-fg hover:underline"
                  >
                    Clear override
                  </button>
                )}
              </div>

              {/* Quick accent swatches */}
              <div className="flex items-center justify-between gap-1.5">
                {QUICK_ACCENTS.map((hex) => {
                  const isPicked = customAccent?.toLowerCase() === hex.toLowerCase();
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setCustomAccent(hex)}
                      aria-label={`Select accent ${hex}`}
                      className={`w-6 h-6 rounded-lg transition-transform ${
                        isPicked ? "scale-110 ring-2 ring-fg" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
              </div>

              {/* Native Color Picker Row */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-line overflow-hidden shrink-0 cursor-pointer">
                  <input
                    type="color"
                    value={customAccent || "#7C5CFF"}
                    onChange={handleColorChange}
                    className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                    title="Choose custom color"
                  />
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: customAccent || "var(--accent)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-muted uppercase truncate">
                    {customAccent || "Theme Default"}
                  </p>
                  <p className="text-[10px] text-muted">
                    Auto-calculates WCAG contrast foreground
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
