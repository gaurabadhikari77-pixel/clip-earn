import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET() {
  try {
    const users = db.getUsers();
    const videos = db.getVideos();
    const reports = db.getReports();
    const txs = db.getTransactions();

    const totalViews = videos.reduce((acc, v) => acc + (v.viewsCount || 0), 0);
    const totalEngagements = videos.reduce((acc, v) => acc + (v.engagementsCount || 0), 0);
    const totalRevenue = txs
      .filter((t) => t.status === "completed")
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const pendingReports = reports.filter((r) => r.status === "pending").length;
    const activePins = videos.filter((v) => v.isPinned).length;

    return NextResponse.json({
      totalUsers: users.length,
      totalVideos: videos.length,
      totalViews,
      totalEngagements,
      totalRevenue: totalRevenue || 345.0, // baseline demo revenue if fresh
      pendingReports,
      activePins,
      vipUsersCount: users.filter((u) => u.role === "vip").length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
