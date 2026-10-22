"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { db } from "@/lib/store";

export type ThemeId = "midnight" | "graphite" | "ocean" | "forest" | "ember" | "snow";

export interface ThemePreset {
  id: ThemeId;
  name: string;
  isDark: boolean;
  colors: {
    bg: string;
    surface: string;
    surface2: string;
    line: string;
    fg: string;
    muted: string;
    accent: string;
    accentFg: string;
    success: string;
    warning: string;
    danger: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "midnight",
    name: "Midnight",
    isDark: true,
    colors: {
      bg: "#0B0D12",
      surface: "#12151C",
      surface2: "#1A1E28",
      line: "#262B38",
      fg: "#F2F4F8",
      muted: "#8A92A6",
      accent: "#7C5CFF",
      accentFg: "#FFFFFF",
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
    },
  },
  {
    id: "graphite",
    name: "Graphite",
    isDark: true,
    colors: {
      bg: "#0F0F10",
      surface: "#171718",
      surface2: "#202022",
      line: "#2E2E31",
      fg: "#F5F5F5",
      muted: "#9A9A9F",
      accent: "#FF4D6D",
      accentFg: "#FFFFFF",
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    isDark: true,
    colors: {
      bg: "#08121A",
      surface: "#0E1B26",
      surface2: "#14283A",
      line: "#1F3A52",
      fg: "#EAF4FB",
      muted: "#7FA0B8",
      accent: "#00C2FF",
      accentFg: "#04141D",
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
    },
  },
  {
    id: "forest",
    name: "Forest",
    isDark: true,
    colors: {
      bg: "#0A110D",
      surface: "#101A14",
      surface2: "#17261D",
      line: "#223629",
      fg: "#EDF7F0",
      muted: "#86A38F",
      accent: "#3DDC84",
      accentFg: "#06150C",
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
    },
  },
  {
    id: "ember",
    name: "Ember",
    isDark: true,
    colors: {
      bg: "#120C0A",
      surface: "#1B1210",
      surface2: "#261916",
      line: "#3A2823",
      fg: "#FBF1EC",
      muted: "#B39588",
      accent: "#FF7A1A",
      accentFg: "#1A0B02",
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
    },
  },
  {
    id: "snow",
    name: "Snow",
    isDark: false,
    colors: {
      bg: "#F6F7FB",
      surface: "#FFFFFF",
      surface2: "#EEF0F6",
      line: "#DDE1EB",
      fg: "#11141C",
      muted: "#5B6478",
      accent: "#5B3DF5",
      accentFg: "#FFFFFF",
      success: "#16A34A",
      warning: "#D97706",
      danger: "#DC2626",
    },
  },
];

/**
 * Calculates sRGB relative luminance to ensure high contrast WCAG AA readability
 * Returns #000000 for bright accents, #FFFFFF for deep accents.
 */
export function getReadableForeground(hex: string): string {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  if (c.length !== 6) return "#FFFFFF";

  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.45 ? "#000000" : "#FFFFFF";
}

interface ThemeContextType {
  theme: ThemeId;
  customAccent: string | null;
  presets: ThemePreset[];
  currentPreset: ThemePreset;
  setTheme: (id: ThemeId) => void;
  setCustomAccent: (hex: string | null) => void;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("midnight");
  const [customAccent, setCustomAccentState] = useState<string | null>(null);

  // Sync state with DOM, localStorage and cookies
  const applyThemeToDom = useCallback((themeId: ThemeId, accent: string | null) => {
    if (typeof document === "undefined") return;

    document.documentElement.setAttribute("data-theme", themeId);

    if (accent) {
      document.documentElement.style.setProperty("--accent", accent);
      const fg = getReadableForeground(accent);
      document.documentElement.style.setProperty("--accent-fg", fg);
    } else {
      document.documentElement.style.removeProperty("--accent");
      document.documentElement.style.removeProperty("--accent-fg");
    }
  }, []);

  // Initialize theme on client mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    let initialTheme: ThemeId = "midnight";
    const storedTheme = localStorage.getItem("clipearn_theme") as ThemeId | null;

    if (storedTheme && THEME_PRESETS.some((p) => p.id === storedTheme)) {
      initialTheme = storedTheme;
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      initialTheme = "snow";
    }

    const storedAccent = localStorage.getItem("clipearn_custom_accent");

    setThemeState(initialTheme);
    setCustomAccentState(storedAccent);
    applyThemeToDom(initialTheme, storedAccent);
  }, [applyThemeToDom]);

  const setTheme = useCallback(
    (newTheme: ThemeId) => {
      setThemeState(newTheme);
      applyThemeToDom(newTheme, customAccent);

      if (typeof window !== "undefined") {
        localStorage.setItem("clipearn_theme", newTheme);
        document.cookie = `clipearn_theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;

        // Sync with logged-in user profile if exists
        const storedUserId = localStorage.getItem("clipearn_userId");
        if (storedUserId) {
          const u = db.getUserById(storedUserId);
          if (u) {
            u.theme = newTheme;
          }
        }
      }
    },
    [customAccent, applyThemeToDom]
  );

  const setCustomAccent = useCallback(
    (hex: string | null) => {
      setCustomAccentState(hex);
      applyThemeToDom(theme, hex);

      if (typeof window !== "undefined") {
        if (hex) {
          localStorage.setItem("clipearn_custom_accent", hex);
          document.cookie = `clipearn_accent=${encodeURIComponent(hex)}; path=/; max-age=31536000; SameSite=Lax`;
        } else {
          localStorage.removeItem("clipearn_custom_accent");
          document.cookie = `clipearn_accent=; path=/; max-age=0; SameSite=Lax`;
        }

        const storedUserId = localStorage.getItem("clipearn_userId");
        if (storedUserId) {
          const u = db.getUserById(storedUserId);
          if (u) {
            u.customAccent = hex;
          }
        }
      }
    },
    [theme, applyThemeToDom]
  );

  const resetToDefault = useCallback(() => {
    setTheme("midnight");
    setCustomAccent(null);
  }, [setTheme, setCustomAccent]);

  const currentPreset =
    THEME_PRESETS.find((p) => p.id === theme) || THEME_PRESETS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        customAccent,
        presets: THEME_PRESETS,
        currentPreset,
        setTheme,
        setCustomAccent,
        resetToDefault,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
