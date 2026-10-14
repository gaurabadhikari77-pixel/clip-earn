import { PlatformType } from "@/types";

export interface ParsedVideoInfo {
  platform: PlatformType;
  title: string;
  thumbnailUrl: string;
  originalUrl: string;
  isValid: boolean;
  error?: string;
}

export function detectPlatform(url: string): PlatformType {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      return "youtube";
    }
    if (host.includes("tiktok.com")) {
      return "tiktok";
    }
    if (host.includes("instagram.com")) {
      return "instagram";
    }
    return "other";
  } catch {
    return "other";
  }
}

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("?")[0] || null;
    }
    if (parsed.pathname.includes("/shorts/")) {
      const parts = parsed.pathname.split("/shorts/");
      return parts[1]?.split("?")[0] || null;
    }
    return parsed.searchParams.get("v") || null;
  } catch {
    return null;
  }
}

/**
 * Server-side / client-side video link parser & oEmbed retriever.
 */
export async function fetchVideoMetadata(rawUrl: string): Promise<ParsedVideoInfo> {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      platform: "other",
      title: "",
      thumbnailUrl: "",
      originalUrl: trimmed,
      isValid: false,
      error: "Please enter a valid video link.",
    };
  }

  let validUrl: URL;
  try {
    validUrl = new URL(trimmed);
    if (!["http:", "https:"].includes(validUrl.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return {
      platform: "other",
      title: "",
      thumbnailUrl: "",
      originalUrl: trimmed,
      isValid: false,
      error: "Please enter a valid HTTP or HTTPS video URL.",
    };
  }

  const platform = detectPlatform(trimmed);
  let title = "Viral Video Clip";
  let thumbnailUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";

  if (platform === "youtube") {
    const ytId = extractYouTubeId(trimmed);
    if (ytId) {
      thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`,
        { headers: { "User-Agent": "ClipEarn-Bot/1.0" }, next: { revalidate: 3600 } }
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.title) title = data.title;
        if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
      } else if (ytId) {
        title = `YouTube Clip #${ytId}`;
      }
    } catch {
      if (ytId) title = `YouTube Clip #${ytId}`;
    }
  } else if (platform === "tiktok") {
    try {
      const oembedRes = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(trimmed)}`,
        { headers: { "User-Agent": "ClipEarn-Bot/1.0" }, next: { revalidate: 3600 } }
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.title) title = data.title;
        if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
      } else {
        title = "Trending TikTok Clip";
        thumbnailUrl = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80";
      }
    } catch {
      title = "Trending TikTok Clip";
      thumbnailUrl = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80";
    }
  } else if (platform === "instagram") {
    title = "Instagram Reel Clip";
    thumbnailUrl = "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80";
  }

  return {
    platform,
    title,
    thumbnailUrl,
    originalUrl: trimmed,
    isValid: true,
  };
}
