import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET() {
  try {
    const settings = db.getSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminUserId, ...updates } = body;

    // Verify admin/owner role
    if (adminUserId) {
      const user = db.getUserById(adminUserId);
      if (!user || (user.role !== "owner" && user.role !== "admin")) {
        return NextResponse.json(
          { error: "Unauthorized: Only platform owner or admin can update settings." },
          { status: 403 }
        );
      }
    }

    const updated = db.updateSettings(updates);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
