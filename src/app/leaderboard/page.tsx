"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Heart,
  Eye,
  CheckCircle2,
  Video as VideoIcon,
  Flame,
  ArrowUpRight,
} from "lucide-react";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="w-full min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 pb-24 lg:pb-12 text-fg">
      {/* HEADER */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/15 border border-warning/30 text-warning text-xs font-bold uppercase">
          <Trophy className="w-3.5 h-3.5" />
          <span>Top Community Clippers</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-fg tracking-tight">
          Clipper Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Ranked by mutual community support—watching fellow clippers&apos; clips and earning views for your own.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-muted">Loading standings...</div>
      ) : (
        <div className="space-y-8">
          {/* TOP 3 PODIUM CARDS */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {/* #2 SILVER (Rendered 1st on desktop for podium layout) */}
              {topThree[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="sm:order-1 p-5 rounded-2xl bg-surface border border-line flex flex-col items-center text-center space-y-3 relative overflow-hidden shadow-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-surface2 text-fg border border-line font-black text-xs flex items-center justify-center absolute top-3 left-3 shadow-md">
                    2
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={topThree[1].avatar}
                    alt={topThree[1].name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-line shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-fg">{topThree[1].name}</h3>
                    <span className="text-[10px] text-muted capitalize">{topThree[1].role} Clipper</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted pt-1">
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {topThree[1].engagementsGiven} given
                    </span>
                    <span className="flex items-center gap-1 text-accent">
                      <Heart className="w-3.5 h-3.5" />
                      {topThree[1].engagementsReceived} earned
                    </span>
                  </div>
                  <div className="w-full pt-2 border-t border-line text-center">
                    <span className="text-xs font-black text-fg">{topThree[1].score} Pts</span>
                  </div>
                </motion.div>
              )}

              {/* #1 GOLD CHAMPION (Center) */}
              {topThree[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sm:order-2 p-6 rounded-2xl bg-surface border-2 border-warning/60 flex flex-col items-center text-center space-y-3 relative overflow-hidden shadow-xl sm:-translate-y-3"
                >
                  <div className="w-9 h-9 rounded-full bg-warning text-black font-black text-xs flex items-center justify-center absolute top-3 left-3 shadow-md">
                    <Crown className="w-4 h-4 fill-black" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-warning/15 text-warning text-[10px] font-black uppercase tracking-wider absolute top-3 right-3 border border-warning/30">
                    #1 Champion
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={topThree[0].avatar}
                    alt={topThree[0].name}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-warning/40 shadow-md"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-fg">{topThree[0].name}</h3>
                    <span className="text-[11px] text-warning font-bold uppercase tracking-wider">
                      Top Supporter
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted pt-1">
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {topThree[0].engagementsGiven} given
                    </span>
                    <span className="flex items-center gap-1 text-accent">
                      <Heart className="w-3.5 h-3.5" />
                      {topThree[0].engagementsReceived} earned
                    </span>
                  </div>
                  <div className="w-full pt-2 border-t border-line text-center">
                    <span className="text-sm font-black text-warning">{topThree[0].score} Total Pts</span>
                  </div>
                </motion.div>
              )}

              {/* #3 BRONZE (Right) */}
              {topThree[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="sm:order-3 p-5 rounded-2xl bg-surface border border-line flex flex-col items-center text-center space-y-3 relative overflow-hidden shadow-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-surface2 text-fg border border-line font-black text-xs flex items-center justify-center absolute top-3 left-3 shadow-md">
                    3
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={topThree[2].avatar}
                    alt={topThree[2].name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-line shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-fg">{topThree[2].name}</h3>
                    <span className="text-[10px] text-muted capitalize">{topThree[2].role} Clipper</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted pt-1">
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {topThree[2].engagementsGiven} given
                    </span>
                    <span className="flex items-center gap-1 text-accent">
                      <Heart className="w-3.5 h-3.5" />
                      {topThree[2].engagementsReceived} earned
                    </span>
                  </div>
                  <div className="w-full pt-2 border-t border-line text-center">
                    <span className="text-xs font-black text-fg">{topThree[2].score} Pts</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* LEADERBOARD TABLE */}
          <div className="rounded-2xl border border-line overflow-hidden bg-surface shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface2 text-muted font-bold uppercase tracking-wider border-b border-line text-[10px]">
                  <tr>
                    <th className="p-4 w-12 text-center">Rank</th>
                    <th className="p-4">Clipper</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Clips Given</th>
                    <th className="p-4">Supports Earned</th>
                    <th className="p-4">Clips Posted</th>
                    <th className="p-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-fg">
                  {leaderboard.map((item, index) => (
                    <tr key={item.id} className="hover:bg-surface2/50 transition-colors">
                      <td className="p-4 text-center font-black">
                        {index === 0 ? "🥇 1" : index === 1 ? "🥈 2" : index === 2 ? "🥉 3" : index + 1}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-7 h-7 rounded-xl object-cover ring-1 ring-line shrink-0"
                          />
                          <span className="font-bold text-fg">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface2 text-muted border border-line">
                          {item.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-success">
                        {item.engagementsGiven}
                      </td>
                      <td className="p-4 font-mono font-semibold text-accent">
                        {item.engagementsReceived}
                      </td>
                      <td className="p-4 font-mono text-muted">{item.clipsCount}</td>
                      <td className="p-4 text-right font-black text-fg">{item.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
