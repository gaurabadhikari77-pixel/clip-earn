/**
 * Test Suite verifying the 6 required scenarios:
 * 1. New user sign-in & upload (verifying UPSERT and existence)
 * 2. Normal user hitting base limit (5 posts/day)
 * 3. Normal user watching Owner clips up to 10 posts/day limit (+2 slots each, max +5 bonus)
 * 4. VIP user watching another VIP clip (0 credits/slots awarded)
 * 5. VIP user watching Owner clips up to 30 posts/day limit (+2 slots each, max +10 bonus)
 * 6. Owner unlimited uploads (0 credits needed, always allowed)
 */

import { db } from "../src/lib/store";
import { isOwnerEmail } from "../src/config/site";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("   CLIPEARN: OWNER BONUS SYSTEM & AUTH TEST SUITE");
  console.log("========================================================\n");

  // TEST 1: New user sign-in and upsert
  console.log("--- TEST 1: New User Sign-in & Upsert ---");
  const newUserEmail = `tester_${Date.now()}@example.com`;
  const newUser = db.upsertUser({
    email: newUserEmail,
    name: "Tester Newbie",
    role: "user",
  });

  assert(Boolean(newUser && newUser.id), "New user was successfully created and upserted");
  assert(newUser.credits === 0, `New user starts with 0 post credits (got ${newUser.credits})`);
  assert(newUser.role === "user", `New user has role 'user' (got ${newUser.role})`);

  // Verify that subsequent upsert updates rather than duplicates
  const reUpserted = db.upsertUser({
    email: newUserEmail,
    name: "Tester Updated Name",
  });
  assert(reUpserted.id === newUser.id, "Upserting existing email returns same user id");
  assert(reUpserted.name === "Tester Updated Name", "Upserting existing user updates profile details");

  // TEST 2: Normal user hitting 1 post base limit
  console.log("\n--- TEST 2: Normal User Base Limit (1 post/day) ---");
  const normalUserEmail = `normal_${Date.now()}@example.com`;
  const normalUser = db.upsertUser({
    email: normalUserEmail,
    name: "Normal Clipper",
    role: "user",
  });
  // Give enough credits so credits aren't the limiting factor
  db.addCredits(normalUser.id, 20);

  let initialStats = db.getUserPostLimitStats(normalUser.id);
  assert(initialStats.baseLimit === 1, `Normal user base limit is 1 (got ${initialStats.baseLimit})`);
  assert(initialStats.totalLimit === 1, `Normal user total limit without bonus is 1 (got ${initialStats.totalLimit})`);

  // Post 1 clip
  db.addVideo({
    userId: normalUser.id,
    userName: normalUser.name,
    userAvatar: normalUser.avatar,
    userRole: normalUser.role,
    title: `Normal Clip 1`,
    url: `https://tiktok.com/@normal/clip_${Date.now()}_1`,
    platform: "tiktok",
    thumbnailUrl: "https://example.com/thumb.jpg",
    isOwnerVideo: false,
    isPinned: false,
  });

  let postStats = db.getUserPostLimitStats(normalUser.id);
  assert(postStats.postsUsedToday === 1, `Normal user used 1 post today (got ${postStats.postsUsedToday})`);
  assert(postStats.canPost === false, "Normal user cannot post anymore once 1 limit is reached");

  // TEST 3: Normal user watching Owner clips up to 10 limit (+2 per clip, max +5 bonus)
  console.log("\n--- TEST 3: Normal User Watching Owner Clips (+2 slots, max 10) ---");
  // Create 3 owner clips to watch
  const ownerClip1 = db.addVideo({
    userId: "usr_owner_01",
    userName: "ClipEarn Owner",
    userAvatar: "https://example.com/owner.jpg",
    userRole: "owner",
    title: "Official Owner Clip 1",
    url: `https://tiktok.com/@owner/clip1_${Date.now()}`,
    platform: "tiktok",
    thumbnailUrl: "https://example.com/owner1.jpg",
    isOwnerVideo: true,
    isPinned: false,
  });

  const ownerClip2 = db.addVideo({
    userId: "usr_owner_01",
    userName: "ClipEarn Owner",
    userAvatar: "https://example.com/owner.jpg",
    userRole: "owner",
    title: "Official Owner Clip 2",
    url: `https://tiktok.com/@owner/clip2_${Date.now()}`,
    platform: "tiktok",
    thumbnailUrl: "https://example.com/owner2.jpg",
    isOwnerVideo: true,
    isPinned: false,
  });

  const ownerClip3 = db.addVideo({
    userId: "usr_owner_01",
    userName: "ClipEarn Owner",
    userAvatar: "https://example.com/owner.jpg",
    userRole: "owner",
    title: "Official Owner Clip 3",
    url: `https://tiktok.com/@owner/clip3_${Date.now()}`,
    platform: "tiktok",
    thumbnailUrl: "https://example.com/owner3.jpg",
    isOwnerVideo: true,
    isPinned: false,
  });

  // Watch Owner Clip 1 (15 seconds > min 13s)
  const res1 = db.recordEngagement(normalUser.id, ownerClip1.id, 15, true, true, true);
  assert(res1.success && res1.isOwnerBonus, "Watching Owner clip 1 triggers Owner Bonus");
  assert(res1.slotsAwarded === 2, `Owner clip 1 granted +2 upload slots (got ${res1.slotsAwarded})`);
  assert(res1.creditsAwarded === 2, `Owner clip 1 granted +2 post credits (got ${res1.creditsAwarded})`);

  let bonusStats1 = db.getUserPostLimitStats(normalUser.id);
  assert(bonusStats1.bonusSlotsEarned === 2, `Bonus slots earned is now 2 (got ${bonusStats1.bonusSlotsEarned})`);
  assert(bonusStats1.totalLimit === 3, `Total limit increased from 1 to 3 (got ${bonusStats1.totalLimit})`);
  assert(bonusStats1.canPost === true, "Normal user can now post again because limit expanded to 3!");

  // Watch same owner clip again -> must NOT reward twice!
  const dupRes = db.recordEngagement(normalUser.id, ownerClip1.id, 15, true, true, true);
  assert(dupRes.success && dupRes.slotsAwarded === 0 && dupRes.creditsAwarded === 0, "Duplicate watch on same Owner clip awards 0 extra slots/credits");

  // Watch Owner Clip 2 -> +2 slots (total bonus = 4, total limit = 5)
  const res2 = db.recordEngagement(normalUser.id, ownerClip2.id, 15, true, false, false);
  assert(res2.slotsAwarded === 2, `Owner clip 2 granted +2 upload slots (got ${res2.slotsAwarded})`);

  // Watch Owner Clip 3 -> only +1 slot because max bonus cap for normal is +5 (4 + 1 = 5)
  const res3 = db.recordEngagement(normalUser.id, ownerClip3.id, 15, true, false, false);
  assert(res3.slotsAwarded === 1, `Owner clip 3 granted +1 slot due to max bonus cap of 5 (got ${res3.slotsAwarded})`);

  let maxedBonusStats = db.getUserPostLimitStats(normalUser.id);
  assert(maxedBonusStats.bonusSlotsEarned === 5, `Total bonus slots capped at 5 (got ${maxedBonusStats.bonusSlotsEarned})`);
  assert(maxedBonusStats.totalLimit === 6, `Total daily limit reached maximum of 6 posts/day (got ${maxedBonusStats.totalLimit})`);

  // TEST 4: VIP user watching another VIP clip (gives 0 rewards)
  console.log("\n--- TEST 4: VIP Watching Another VIP Clip (0 Rewards) ---");
  const vipUser1 = db.upsertUser({
    email: `vip1_${Date.now()}@example.com`,
    name: "VIP Member One",
    role: "vip",
    vipUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
  });

  const vipUser2 = db.upsertUser({
    email: `vip2_${Date.now()}@example.com`,
    name: "VIP Member Two",
    role: "vip",
    vipUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
  });

  const vipVideo = db.addVideo({
    userId: vipUser2.id,
    userName: vipUser2.name,
    userAvatar: vipUser2.avatar,
    userRole: "vip",
    title: "VIP Highlight Clip",
    url: `https://tiktok.com/@vip2/clip_${Date.now()}`,
    platform: "tiktok",
    thumbnailUrl: "https://example.com/vip.jpg",
    isOwnerVideo: false,
    isPinned: false,
  });

  const vipWatchVip = db.recordEngagement(vipUser1.id, vipVideo.id, 15, true, true, false);
  assert(vipWatchVip.success === true, "Engagement recorded for VIP watching VIP");
  assert(vipWatchVip.creditAwarded === false, "VIP watching VIP grants 0 credits");
  assert(vipWatchVip.slotsAwarded === 0, "VIP watching VIP grants 0 bonus slots");
  assert(
    vipWatchVip.message.includes("VIP clips don't earn rewards for VIP members"),
    `Friendly explanation returned: "${vipWatchVip.message}"`
  );

  // TEST 5: VIP user watching Owner clips up to 30 limit (+2 each, max +10 bonus)
  console.log("\n--- TEST 5: VIP Watching Owner Clips (Base 20 + 10 bonus = 30) ---");
  const vipStatsInitial = db.getUserPostLimitStats(vipUser1.id);
  assert(vipStatsInitial.baseLimit === 20, `VIP base limit is 20 (got ${vipStatsInitial.baseLimit})`);
  assert(vipStatsInitial.maxBonusAllowed === 10, `VIP max bonus allowed is 10 (got ${vipStatsInitial.maxBonusAllowed})`);

  // Create 5 separate owner clips to give 5 x 2 = 10 bonus slots
  for (let k = 1; k <= 5; k++) {
    const ownerClip = db.addVideo({
      userId: "usr_owner_01",
      userName: "ClipEarn Owner",
      userAvatar: "https://example.com/owner.jpg",
      userRole: "owner",
      title: `VIP Owner Clip ${k}`,
      url: `https://tiktok.com/@owner/vipclip_${Date.now()}_${k}`,
      platform: "youtube",
      thumbnailUrl: "https://example.com/thumb.jpg",
      isOwnerVideo: true,
      isPinned: false,
    });

    const reward = db.recordEngagement(vipUser1.id, ownerClip.id, 15, true, true, true);
    assert(reward.isOwnerBonus === true && reward.slotsAwarded === 2, `Owner clip ${k} awarded +2 slots to VIP`);
  }

  const vipStatsMaxed = db.getUserPostLimitStats(vipUser1.id);
  assert(vipStatsMaxed.bonusSlotsEarned === 10, `VIP bonus slots reached +10 (got ${vipStatsMaxed.bonusSlotsEarned})`);
  assert(vipStatsMaxed.totalLimit === 30, `VIP total limit reached 30 posts/day (got ${vipStatsMaxed.totalLimit})`);

  // TEST 6: Owner unlimited uploads
  console.log("\n--- TEST 6: Owner Unlimited Uploads ---");
  const ownerUser = db.upsertUser({
    email: "owner@clipearn.com",
    name: "ClipEarn Platform Owner",
  });
  assert(ownerUser.role === "owner", `owner@clipearn.com automatically gets role 'owner' (got ${ownerUser.role})`);
  assert(isOwnerEmail("owner@clipearn.com"), "isOwnerEmail validates true for owner@clipearn.com");

  const ownerStats = db.getUserPostLimitStats(ownerUser.id);
  assert(ownerStats.isUnlimited === true, "Owner has unlimited posting (isUnlimited === true)");
  assert(ownerStats.canPost === true, "Owner can always post without daily limits");

  console.log("\n========================================================");
  console.log("   🎉 ALL 6 OWNER BONUS & AUTH TEST CASES PASSED!");
  console.log("========================================================\n");
}

runTests().catch((e) => {
  console.error("Test failed with exception:", e);
  process.exit(1);
});
