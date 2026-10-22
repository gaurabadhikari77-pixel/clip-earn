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

export function extractTikTokId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const videoMatch = parsed.pathname.match(/\/video\/(\d+)/i) || parsed.pathname.match(/\/v\/(\d+)/i);
    if (videoMatch && videoMatch[1]) {
      return videoMatch[1];
    }
    return null;
  } catch {
    return null;
  }
}

export function extractInstagramShortcode(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/(reel|p)\/([a-zA-Z0-9_-]+)/i);
    if (match && match[2]) {
      return match[2];
    }
    return null;
  } catch {
    return null;
  }
}

export interface LivePreviewData {
  type: "youtube" | "tiktok" | "instagram" | "video" | "none";
  previewUrl: string | null;
}

export function getLivePreviewInfo(url: string, platform: PlatformType): LivePreviewData {
  try {
    if (!url || typeof url !== "string") return { type: "none", previewUrl: null };
    const trimmed = url.trim();

    // Direct MP4 / WebM video stream
    if (trimmed.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
      return { type: "video", previewUrl: trimmed };
    }

    if (platform === "youtube" || trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
      const ytId = extractYouTubeId(trimmed);
      if (ytId) {
        return {
          type: "youtube",
          previewUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&modestbranding=1&rel=0&playsinline=1&disablekb=1&fs=0`,
        };
      }
    }

    if (platform === "tiktok" || trimmed.includes("tiktok.com")) {
      const tiktokId = extractTikTokId(trimmed);
      if (tiktokId) {
        return {
          type: "tiktok",
          previewUrl: `https://www.tiktok.com/player/v1/${tiktokId}?autoplay=1&mute=1&controls=0`,
        };
      }
    }

    if (platform === "instagram" || trimmed.includes("instagram.com")) {
      const shortcode = extractInstagramShortcode(trimmed);
      if (shortcode) {
        return {
          type: "instagram",
          previewUrl: `https://www.instagram.com/reel/${shortcode}/embed/`,
        };
      }
    }
  } catch {}
  return { type: "none", previewUrl: null };
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
    const tiktokId = extractTikTokId(trimmed);
    title = tiktokId ? `Trending TikTok Clip #${tiktokId.slice(-4)}` : "Trending TikTok Clip";
    thumbnailUrl = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80";

    try {
      const oembedRes = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(trimmed)}`,
        { headers: { "User-Agent": "ClipEarn-Bot/1.0" }, next: { revalidate: 3600 } }
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.title) title = data.title;
        if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
      }
    } catch {}
  } else if (platform === "instagram") {
    const shortcode = extractInstagramShortcode(trimmed);
    title = shortcode ? `Instagram Reel #${shortcode}` : "Instagram Reel Clip";
    thumbnailUrl = "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&auto=format&fit=crop&q=80";
  }

  return {
    platform,
    title,
    thumbnailUrl,
    originalUrl: trimmed,
    isValid: true,
  };
}
