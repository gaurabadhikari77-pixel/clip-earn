"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  Server,
  FileText,
  Mail,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10 text-fg">
      {/* HEADER */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>User Privacy & Data Protection</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-fg tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto">
          Last updated: April 2026 • ClipEarn is committed to absolute transparency and protecting creator privacy.
        </p>
      </div>

      {/* CORE PRIVACY PILLARS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-line space-y-2 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-surface2 border border-line flex items-center justify-center text-accent">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-fg">Zero Identity Exposure</h3>
          <p className="text-xs text-muted leading-relaxed">
            Your real Google full name and Gmail address are <strong>never</strong> displayed publicly. Only your custom Clipper Nickname is visible.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-line space-y-2 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-surface2 border border-line flex items-center justify-center text-success">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-fg">No Inbox Access</h3>
          <p className="text-xs text-muted leading-relaxed">
            We strictly request read-only identity scopes (<code className="text-fg">openid</code>, <code className="text-fg">email</code>, <code className="text-fg">profile</code>). We cannot read, send, or touch your Gmail inbox.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-line space-y-2 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-surface2 border border-line flex items-center justify-center text-warning">
            <UserCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-fg">Full Profile Control</h3>
          <p className="text-xs text-muted leading-relaxed">
            You can modify your public clipper nickname, avatar, bio, and social handle at any time in your Creator Profile settings.
          </p>
        </div>
      </div>

      {/* DETAILED PRIVACY CLAUSES */}
      <div className="space-y-8 p-6 sm:p-8 rounded-2xl bg-surface border border-line shadow-xl text-xs sm:text-sm leading-relaxed text-muted">
        {/* Section 1 */}
        <section className="space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold text-fg flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface2 border border-line text-xs flex items-center justify-center text-accent font-black">
              1
            </span>
            <span>Information We Collect</span>
          </h2>
          <p>
            When you use ClipEarn, we collect the minimum necessary data to maintain a fair, mutual content reward ecosystem:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li>
              <strong className="text-fg">Authentication Credentials:</strong> When signing in with Google via Firebase Authentication, we receive your Firebase UID, email address, and default profile image for verification purposes.
            </li>
            <li>
              <strong className="text-fg">Public Clipper Profile:</strong> Your chosen Clipper Nickname, bio, social handle (Instagram/TikTok), and custom avatar.
            </li>
            <li>
              <strong className="text-fg">Platform Activity:</strong> Clips uploaded, watch-time duration records, confirmed likes on community clips, daily post slots, and credit balances.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-2.5 pt-4 border-t border-line">
          <h2 className="text-base sm:text-lg font-bold text-fg flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface2 border border-line text-xs flex items-center justify-center text-accent font-black">
              2
            </span>
            <span>How We Use Your Data</span>
          </h2>
          <p>We use collected data solely to deliver and protect the platform features:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li>
              To award post credits fairly when creators watch for 13+ seconds and like fellow clippers&apos; videos.
            </li>
            <li>
              To manage upload limits (e.g. 1 post for normal clippers, 20 posts for VIP creators) and fair 6-hour credit refreshes.
            </li>
            <li>
              To power the 3-minute fair shuffle rotation on the community feed, ensuring every clipper receives equal exposure.
            </li>
            <li>
              To detect automated bot activity and fraudulent engagement spoofing.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2.5 pt-4 border-t border-line">
          <h2 className="text-base sm:text-lg font-bold text-fg flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface2 border border-line text-xs flex items-center justify-center text-accent font-black">
              3
            </span>
            <span>Zero Third-Party Advertising & Data Selling</span>
          </h2>
          <p>
            We do not sell, rent, monetize, or trade your personal data with third-party advertising networks, data brokers, or marketing agencies. Period.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2.5 pt-4 border-t border-line">
          <h2 className="text-base sm:text-lg font-bold text-fg flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface2 border border-line text-xs flex items-center justify-center text-accent font-black">
              4
            </span>
            <span>Local Storage & Cookies</span>
          </h2>
          <p>
            ClipEarn uses client-side Local Storage solely for functional needs:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li>
              <code className="text-fg">clipearn_theme</code>: Remembers your selected solid visual theme (Midnight, Snow, Amber, Emerald, Cyberpunk, etc.).
            </li>
            <li>
              <code className="text-fg">clipearn_userId</code>: Persists your active login session across browser refreshes.
            </li>
            <li>
              <code className="text-fg">clipearn_local_store_v7</code>: Fast local client caching for offline responsiveness and rapid static rendering.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-2.5 pt-4 border-t border-line">
          <h2 className="text-base sm:text-lg font-bold text-fg flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface2 border border-line text-xs flex items-center justify-center text-accent font-black">
              5
            </span>
            <span>Third-Party Services</span>
          </h2>
          <p>We work with trusted industry-standard infrastructure providers:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li>
              <strong className="text-fg">Google Firebase Authentication & Firestore:</strong> Manages secure OAuth identity tokens and cloud persistence according to Google Cloud Security Standards.
            </li>
            <li>
              <strong className="text-fg">Stripe:</strong> Encrypted payment infrastructure for VIP upgrades and video pins. We never receive or store raw credit card numbers.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-2.5 pt-4 border-t border-line">
          <h2 className="text-base sm:text-lg font-bold text-fg flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface2 border border-line text-xs flex items-center justify-center text-accent font-black">
              6
            </span>
            <span>Your Rights & Account Deletion</span>
          </h2>
          <p>
            You have full ownership of your data. You may edit your public nickname, bio, or avatar at any time in{" "}
            <Link href="/profile" className="text-accent underline font-semibold">
              My Profile
            </Link>
            . If you wish to delete your account and all associated video clips permanently, simply contact our team via Instagram or email.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pt-4 border-t border-line">
          <h2 className="text-base sm:text-lg font-bold text-fg flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-surface2 border border-line text-xs flex items-center justify-center text-accent font-black">
              7
            </span>
            <span>Contact Information</span>
          </h2>
          <p>For any privacy questions or data requests, contact us directly:</p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="https://www.instagram.com/gaurabb_adk/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-surface2 border border-line hover:border-pink-500/50 text-pink-400 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <span>Instagram: @gaurabb_adk</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="mailto:iamdeathflow11@gmail.com"
              className="px-4 py-2.5 rounded-xl bg-surface2 border border-line hover:border-accent text-accent font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email: iamdeathflow11@gmail.com</span>
            </a>
          </div>
        </section>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="flex items-center justify-between text-xs text-muted pt-4 border-t border-line">
        <Link href="/" className="hover:text-accent font-bold transition-colors">
          &larr; Back to Community Feed
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-accent transition-colors">
            About ClipEarn
          </Link>
          <Link href="/contact" className="hover:text-accent transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
