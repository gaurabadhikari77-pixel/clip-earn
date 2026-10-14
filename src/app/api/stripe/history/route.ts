import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let txs = db.getTransactions();
    if (userId) {
      txs = txs.filter((t) => t.userId === userId);
    }

    return NextResponse.json({ transactions: txs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
