import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET() {
  try {
    const users = db.getUsers().filter((u) => !u.isBanned);
    const videos = db.getVideos();
    const engagements = db.getAllEngagements();

    const leaderboard = users.map((user) => {
      // Engagements given by this user
      const given = engagements.filter((e) => e.userId === user.id).length;

      // User's videos and engagements received
      const userVideos = videos.filter((v) => v.userId === user.id);
      const received = userVideos.reduce((acc, v) => acc + (v.engagementsCount || 0), 0);
      const totalViews = userVideos.reduce((acc, v) => acc + (v.viewsCount || 0), 0);

      // Total clipper score: 2 points per engagement given + 1 point per support received
      const score = (given * 2) + received + (userVideos.length * 5);

      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        engagementsGiven: given,
        engagementsReceived: received,
        totalViews,
        clipsCount: userVideos.length,
        score,
      };
    });

    // Sort by highest score first
    leaderboard.sort((a, b) => b.score - a.score || b.engagementsGiven - a.engagementsGiven);

    return NextResponse.json({
      leaderboard,
      topThree: leaderboard.slice(0, 3),
      totalParticipants: leaderboard.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
