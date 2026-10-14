import { NextRequest, NextResponse } from "next/server";
import { fetchVideoMetadata } from "@/lib/video-parser";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const meta = await fetchVideoMetadata(url);
    return NextResponse.json(meta);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch metadata" }, { status: 500 });
  }
}
