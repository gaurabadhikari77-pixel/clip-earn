import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/store";
import { fetchVideoMetadata } from "@/lib/video-parser";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase();
    const userId = searchParams.get("userId");

    let videos = db.getVideos();

    // Filter out banned users' videos
    const users = db.getUsers();
    const bannedUserIds = new Set(users.filter((u) => u.isBanned).map((u) => u.id));
    videos = videos.filter((v) => !bannedUserIds.has(v.userId));

    // Filter by platform
    if (platform && platform !== "all") {
      videos = videos.filter((v) => v.platform === platform);
    }

    // Filter by category
    if (category && category !== "all") {
      videos = videos.filter((v) => v.category === category);
    }

    // Filter by search query
    if (search) {
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(search) ||
          v.userName.toLowerCase().includes(search) ||
          (v.sourceTag && v.sourceTag.toLowerCase().includes(search)) ||
          (v.category && v.category.toLowerCase().includes(search))
      );
    }

    // Get engagements if userId provided
    const watchedVideoIds = new Set(
      userId ? db.getUserEngagements(userId).map((e) => e.videoId) : []
    );

    const now = new Date().toISOString();

    const ownerVideos: typeof videos = [];
    const pinnedAndVipVideos: typeof videos = [];
    const freshVideos: typeof videos = [];
    const communityVideos: typeof videos = [];
    const watchedVideos: typeof videos = [];

    // Separate owner, pinned, VIP, fresh, and community
    for (const v of videos) {
      const isWatched = watchedVideoIds.has(v.id);

      if (v.isOwnerVideo) {
        ownerVideos.push(v);
      } else if (isWatched) {
        // Watched videos are never hidden; moved to watched bottom section
        watchedVideos.push(v);
      } else if ((v.isPinned && v.pinnedUntil && v.pinnedUntil > now) || v.userRole === "vip") {
        pinnedAndVipVideos.push(v);
      } else if (v.engagementsCount <= 2) {
        freshVideos.push(v);
      } else {
        communityVideos.push(v);
      }
    }

    const sortByDate = (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    // Fresh clips: sort by fewest engagements first to give them views!
    const sortByFewestEngagements = (a: any, b: any) =>
      (a.engagementsCount || 0) - (b.engagementsCount || 0) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    ownerVideos.sort(sortByDate);
    pinnedAndVipVideos.sort(sortByDate);
    freshVideos.sort(sortByFewestEngagements);
    communityVideos.sort(sortByDate);
    watchedVideos.sort(sortByDate);

    return NextResponse.json({
      sections: {
        owner: ownerVideos,
        pinnedAndVip: pinnedAndVipVideos,
        fresh: freshVideos,
        community: communityVideos,
        watched: watchedVideos,
      },
      watchedVideoIds: Array.from(watchedVideoIds),
      totalCount: videos.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch clips" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, title, thumbnailUrl, userId, userEmail, category, sourceTag } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid video clip link (TikTok, YouTube Shorts, Instagram Reels, etc.)." },
        { status: 400 }
      );
    }

    // 1. Resolve user from NextAuth session, or body/header credentials, ALWAYS UPSERTING
    let user = null;
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      const email = session.user.email.trim().toLowerCase();
      user =
        db.getUserByEmail(email) ||
        db.upsertUser({
          email,
          name: session.user.name || email.split("@")[0],
          avatar: session.user.image || undefined,
        });
    } else if (userEmail) {
      const email = userEmail.trim().toLowerCase();
      user =
        db.getUserByEmail(email) ||
        db.upsertUser({
          email,
          name: body.userName || email.split("@")[0],
          avatar: body.userAvatar || undefined,
        });
    } else if (userId) {
      user = db.getUserById(userId);
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be signed in to upload a clip. Please continue with your Google account.",
          code: "UNAUTHENTICATED",
        },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: "Your account has been suspended. You cannot post clips." },
        { status: 403 }
      );
    }

    // 2. Check duplicate URL in feed
    const existing = db
      .getVideos()
      .find((v) => v.url.trim().toLowerCase() === url.trim().toLowerCase());
    if (existing) {
      return NextResponse.json(
        { error: "This clip link has already been posted to ClipEarn." },
        { status: 400 }
      );
    }

    // 3. Check posting limits & credits (Owner has unlimited posting and needs no credits)
    const isOwner = user.role === "owner";
    const limitStats = db.getUserPostLimitStats(user.id);

    if (!isOwner) {
      // Check credits
      if (limitStats.credits <= 0) {
        return NextResponse.json(
          {
            error:
              "You need at least 1 post credit to submit a clip. Watch and support a fellow creator's clip on the feed to earn a credit!",
            code: "NO_CREDITS",
            limitStats,
          },
          { status: 403 }
        );
      }

      // Check daily post limit
      if (!limitStats.isUnlimited && limitStats.postsUsedToday >= limitStats.totalLimit) {
        const upgradeNote =
          user.role === "user"
            ? " Upgrade to VIP for 20 posts per day, or watch Owner clips for bonus slots."
            : "";
        return NextResponse.json(
          {
            error: `You've hit today's limit of ${limitStats.totalLimit} posts. Resets at 6:00 AM.${upgradeNote}`,
            code: "DAILY_LIMIT_REACHED",
            limitStats,
          },
          { status: 429 }
        );
      }
    }

    // 4. Fetch / parse metadata
    const parsed = await fetchVideoMetadata(url);
    const finalTitle = title?.trim() || parsed.title || "Viral Video Clip";
    const finalThumbnail = thumbnailUrl?.trim() || parsed.thumbnailUrl;
    const finalPlatform = parsed.platform;

    // 5. Deduct 1 credit for non-owner
    if (!isOwner) {
      db.addCredits(user.id, -1);
    }

    // 6. Insert video into store
    const newVideo = db.addVideo({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userRole: user.role,
      title: finalTitle,
      url: url.trim(),
      platform: finalPlatform,
      thumbnailUrl: finalThumbnail,
      category: category || "other",
      sourceTag: sourceTag?.trim() || undefined,
      isOwnerVideo: isOwner,
      isPinned: false,
    });

    const updatedLimitStats = db.getUserPostLimitStats(user.id);

    return NextResponse.json({
      success: true,
      video: newVideo,
      remainingCredits: isOwner ? 9999 : updatedLimitStats.credits,
      limitStats: updatedLimitStats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to post clip. Please try again." },
      { status: 500 }
    );
  }
}
