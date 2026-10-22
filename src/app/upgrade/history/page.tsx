"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { History, Crown, Flame, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { Transaction } from "@/types";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/store";

export default function PurchaseHistoryPage() {
  const { user } = useApp();
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const txs = db.getTransactions().filter((t) => t.userId === user.id);
      setHistory(txs);
      setLoading(false);
    }
  }, [user?.id]);

  return (
    <div className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-fg">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/upgrade"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to VIP Plans</span>
        </Link>

        <div>
          <h1 className="text-3xl font-black text-fg tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-accent" />
            <span>Purchase History</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            Receipts and transaction records for your VIP subscriptions and video pins.
          </p>
        </div>

        <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted">Loading receipts...</div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <History className="w-10 h-10 text-muted mx-auto" />
              <p className="text-sm font-bold text-fg">No purchases found</p>
              <p className="text-xs text-muted">
                You haven&apos;t purchased any VIP upgrades or video pins yet.
              </p>
              <Link
                href="/upgrade"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-accent hover:opacity-95 text-accent-fg font-bold text-xs shadow-md transition-opacity"
              >
                Explore Upgrades
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {history.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface2/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border border-line ${
                        tx.type === "vip"
                          ? "bg-accent/15 text-accent"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {tx.type === "vip" ? (
                        <Crown className="w-5 h-5" />
                      ) : (
                        <Flame className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-fg">
                        {tx.type === "vip" ? "VIP Creator Membership" : "24h Pinned Video Boost"}
                      </p>
                      <p className="text-[11px] text-muted">
                        {new Date(tx.createdAt).toLocaleDateString()} at{" "}
                        {new Date(tx.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <p className="text-sm font-black text-fg">
                        ${Number(tx.amount).toFixed(2)} USD
                      </p>
                      <span className="text-[10px] font-bold text-success uppercase">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
