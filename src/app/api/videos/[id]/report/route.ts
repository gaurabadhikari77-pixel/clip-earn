import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    const body = await req.json();
    const { reporterId, reason, details } = body;

    if (!reporterId || !reason) {
      return NextResponse.json(
        { error: "Reporter ID and reason are required." },
        { status: 400 }
      );
    }

    const reporter = db.getUserById(reporterId);
    const reporterEmail = reporter ? reporter.email : "anonymous@clipearn.com";

    const report = db.reportVideo(videoId, reporterId, reporterEmail, reason, details);
    if (!report) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully. Our admin team will review it.",
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit report" },
      { status: 500 }
    );
  }
}
