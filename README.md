# ClipEarn ✂️ — Watch. Support. Get Seen.

> **ClipEarn** is a full-stack, responsive website platform where video clippers and content creators engage with each other's videos to earn post credits and grow their organic reach across TikTok, YouTube Shorts, Instagram Reels, and other platforms.

---

## 🌟 What's New: Owner Bonus System & Google Login

### 1. Fix "User Not Found" (Server Upsert Engine)
- Uploads and engagements never fail with "user not found".
- Every authentication attempt, session retrieval, and API route automatically **UPSERTS** user records in the users table (`id`, `email`, `name`, `avatar`, `role`, `vip_until`, `daily_limit_override`, `bonus_slots_today`, `credits`, `created_at`).
- All limits, credits, and role permissions are strictly enforced on the server.

### 2. Google Sign-In (Identity Only)
- Secure authentication with Google using NextAuth.
- **Strict Scope Restriction**: Requests **ONLY** `openid`, `email`, and `profile`.
- **Privacy First**: Explicitly disclaims Gmail/inbox access:
  > *"We only use your Google account to identify you. We never access your inbox."*
- **Public Browsing**: Visitors can browse the community feed freely without signing in. Clicking **Upload Clip** or **Watch & Earn** prompts the Google Login modal.
- Built-in **Dev Quick Login** lets you test roles (Owner, VIP, Normal, Fresh New User) instantly in local development without waiting for external API keys.

### 3. Owner Bonus System
Rewarding community members for watching and engaging with verified Owner clips:

| Role | Base Daily Limit | Reward per Verified Owner Clip | Max Bonus Slots | Max Daily Total | Note on VIP Clips |
|---|---|---|---|---|---|
| **Normal User** | 5 posts / day | **+2 upload slots** & **+2 post credits** | +5 slots | **10 posts / day** | Normal clips earn 1 credit |
| **VIP Member** | 20 posts / day | **+2 upload slots** & **+2 post credits** | +10 slots | **30 posts / day** | VIP clips grant **0 rewards** to VIP members |
| **Owner** | Unlimited | Unlimited | N/A | **Unlimited** | 0 credits needed |

- **Duplicate Protection**: Unique tracking table prevents any Owner clip from being rewarded more than once per user.
- **Daily Reset**: Bonus slots reset alongside the base limit every morning at **6:00 AM**.
- **UI Enhancements**:
  - Glowing **"Bonus +2"** badge on Owner clip cards.
  - Interactive hover button: **"Watch & Earn +2 Slots"**.
  - Two-colored daily limit progress bar (e.g. `7/10 used (+4 bonus earned)`).
  - Unlock hint: *"Watch Owner clips to unlock up to X more uploads today!"*
  - Celebratory confetti burst + `"+2 upload slots unlocked & +2 credits earned!"` on verification.

---

## 🚀 Core Features

### 1. **Shorts-Style Vertical 9:16 Video Feed**
- Compact vertical cards (150-200px desktop width, 2-per-row mobile grid, swipeable horizontal rows).
- Dynamic platform badges (TikTok, YouTube Shorts, Instagram Reels).
- Visual status indicators: **Owner Bonus +2**, **Pinned Flame**, **VIP Purple**, and **New Fresh Clips**.

### 2. **Ordered Feed Hierarchy**
1. **Owner Spotlight Section**: Videos posted by the owner with special bonus rewards.
2. **Pinned Boosts Section**: 24-hour paid pinned clips with flame badges.
3. **VIP Section**: Exclusive showcase for VIP member creators.
4. **Fresh Clips (Needs Views)**: Automatically surfaced unwatched clips with fewest engagements to guarantee fair views.
5. **Community Feed**: Newest clips with category filters (Gaming, Podcasts, Streamers, Anime, Movies).
6. **Watched Section**: Supported clips are **never hidden**; they move to the bottom with a "Watched" badge.

### 3. **Floating Engagement Tracker**
- Uses HTML5 **Page Visibility API** and **Window Focus/Blur APIs** to calculate actual time spent on the video platform.
- Minimum watch time of **13 seconds** enforced on the server.
- Interactive support checklist: *Watched 13s+*, *Liked*, *Commented*, *Followed/Subscribed*.
- Confetti celebration and instant credit increment on the navbar.

---

## ⚙️ Google Cloud OAuth Setup Guide

To configure Google Sign-In with real Google credentials:

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and select **New Project**.
3. Name your project (e.g., `ClipEarn Platform`) and click **Create**.

### Step 2: Configure the OAuth Consent Screen
1. In the sidebar, navigate to **APIs & Services** > **OAuth consent screen**.
2. Select **External** and click **Create**.
3. Fill in:
   - **App name**: `ClipEarn`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **Save and Continue**.
5. On the **Scopes** page, click **Add or Remove Scopes**.
   - Select only:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - **DO NOT** select any Gmail, Drive, or restricted scopes.
6. Click **Save and Continue**.
7. Under **Test users**, add your own Google email address (so you can test while in Development mode).
8. Click **Save and Continue**.

### Step 3: Create OAuth 2.0 Credentials
1. In the sidebar, navigate to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Set **Application type** to **Web application**.
4. Set **Name** to `ClipEarn Web Client`.
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google`
7. Click **Create**.
8. Copy the **Client ID** and **Client Secret**.

### Step 4: Add Keys to `.env.local`
Open `.env.local` in `clipearn/` and paste your credentials:
```env
OWNER_EMAIL=your-email@example.com
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=clipearn-development-jwt-secret-key-32chars

# Firebase Backend Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAKpF61DrBhuvOjtZBVHxewI2kOrslV9P8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=clipearn-6ff40.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=clipearn-6ff40
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=clipearn-6ff40.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1014656683711
NEXT_PUBLIC_FIREBASE_APP_ID=1:1014656683711:web:cc02f3ef28f6ab6d6e400a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-NGMYFW1MWW
```

---

## 🔥 Firebase Backend & Firestore Collections

ClipEarn uses Firebase for Authentication, Cloud Firestore for persistence, and Firebase Storage:

### 1. Collections Structure
- **`users`**: User records (`id`, `email`, `name`, `avatar`, `role`, `credits`, `bonusSlotsToday`, `vipUntil`, `createdAt`).
- **`videos`**: 9:16 vertical clip submissions (`id`, `userId`, `title`, `url`, `platform`, `thumbnailUrl`, `category`, `sourceTag`, `isOwnerVideo`, `isPinned`, `viewsCount`, `engagementsCount`, `createdAt`).
- **`engagements`**: Verified user watches and checklist engagement confirmations (`id`, `userId`, `videoId`, `watchedSeconds`, `liked`, `commented`, `followed`, `verifiedAt`).
- **`ownerRewards`**: Unique tracking table for the Owner Bonus System (`id`, `userId`, `clipId`, `slotsAwarded`, `creditsAwarded`, `createdAt`).
- **`settings`**: Global platform configuration (`minWatchSeconds`, `dailyPostLimitNormal`, `dailyPostLimitVip`, `ownerBonusSlots`, etc.).

### 2. Firestore Security Rules
The file [`firestore.rules`](file:///C:/Users/gaurab/Downloads/app/clipearn/firestore.rules) contains the production security rules. To apply them in Firebase Console:
1. Open the [Firebase Console](https://console.firebase.google.com/project/clipearn-6ff40/firestore/rules).
2. Go to **Firestore Database** > **Rules**.
3. Paste the contents of `firestore.rules` and click **Publish**.

### 3. Firebase Authorized Domains
In Firebase Console > **Authentication** > **Settings** > **Authorized domains**, make sure the following are listed:
- `localhost`
- `clipearn-6ff40.firebaseapp.com`
- Your custom production domain (e.g. `clipearn.com`)

---

## 🧪 Testing & Verification

### Run the Dev Seed Script
To populate the platform with 1 Owner, 1 VIP, and 1 Normal user:
```bash
npx tsx scripts/dev-seed.ts
```

### Run the Automated 6-Scenario Test Suite
To verify all 6 required test cases (new user upload, normal hitting 5 limit, normal watching owner reaching 10 limit, VIP watching VIP receiving 0, VIP watching owner reaching 30 limit, and owner unlimited uploads):
```bash
npx tsx scripts/test-owner-bonus.ts
```

### Run the App Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 👑 Role Architecture
- **Owner**: Any account whose email matches `OWNER_EMAIL` (comma-separated list supported in `.env`). Unlimited uploads, 0 credit costs, clips placed in Owner Spotlight.
- **VIP**: Granted via Stripe checkout subscription, stored with `vip_until` expiration date. Auto-downgraded to `user` on expiry.
- **User**: Standard clipper account. Base 5 posts/day, expandable up to 10 via verified Owner clip watches.
