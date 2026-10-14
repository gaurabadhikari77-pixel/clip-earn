import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/store";
import { isOwnerEmail } from "@/config/site";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // 1. Try NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const email = session.user.email.trim().toLowerCase();
      const user =
        db.getUserByEmail(email) ||
        db.upsertUser({
          email,
          name: session.user.name || email.split("@")[0],
          avatar: session.user.image || undefined,
        });

      const limitStats = db.getUserPostLimitStats(user.id);
      return NextResponse.json({ user, limitStats });
    }

    // 2. Fallback to userId param if explicitly provided
    if (userId) {
      const user = db.getUserById(userId);
      if (user) {
        const limitStats = db.getUserPostLimitStats(user.id);
        return NextResponse.json({ user, limitStats });
      }
    }

    // 3. Visitor / unauthenticated state
    return NextResponse.json({ user: null, limitStats: null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch user state" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, avatar, role } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required to authenticate." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isOwner = isOwnerEmail(cleanEmail);

    const user = db.upsertUser({
      email: cleanEmail,
      name: name || cleanEmail.split("@")[0],
      avatar,
      role: isOwner ? "owner" : (role || "user"),
    });

    const limitStats = db.getUserPostLimitStats(user.id);
    return NextResponse.json({ user, limitStats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to upsert user" }, { status: 500 });
  }
}
