import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET() {
  try {
    const reports = db.getReports();
    return NextResponse.json({ reports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, status, deleteVideo: shouldDelete } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: "reportId and status are required" }, { status: 400 });
    }

    const report = db.getReports().find((r) => r.id === reportId);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    db.updateReportStatus(reportId, status);

    if (shouldDelete && report.videoId) {
      db.deleteVideo(report.videoId);
    }

    return NextResponse.json({ success: true, reportId, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
