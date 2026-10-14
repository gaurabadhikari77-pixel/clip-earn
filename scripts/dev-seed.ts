/**
 * Dev Seed Script for ClipEarn
 * Seeds:
 * 1. Owner account (owner@clipearn.com) - unlimited uploads, crown badge
 * 2. VIP account (sarah.clips@example.com) - 20 daily posts, VIP until next month
 * 3. Normal user (alex.cliper@gmail.com) - 5 daily posts, 2 starting credits
 */

import { db } from "../src/lib/store";

export function seedDevAccounts() {
  console.log("Seeding ClipEarn development accounts...");

  const owner = db.upsertUser({
    id: "usr_owner_01",
    email: "owner@clipearn.com",
    name: "ClipEarn Owner",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=owner",
    role: "owner",
  });
  console.log(`👑 Owner seeded: ${owner.email} (${owner.name}) - Unlimited uploads`);

  const vip = db.upsertUser({
    id: "usr_vip_01",
    email: "sarah.clips@example.com",
    name: "Sarah Edits (VIP)",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=sarah",
    role: "vip",
    vipUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  });
  console.log(`⭐ VIP seeded: ${vip.email} (${vip.name}) - 20 posts/day`);

  const normal = db.upsertUser({
    id: "usr_normal_01",
    email: "alex.cliper@gmail.com",
    name: "Alex Clipper",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=alex",
    role: "user",
  });
  console.log(`🎬 Normal user seeded: ${normal.email} (${normal.name}) - 5 posts/day`);

  console.log("✅ Dev accounts seeded successfully!");
}

if (require.main === module) {
  seedDevAccounts();
}
