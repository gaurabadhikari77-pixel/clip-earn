"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scissors, Play, ShieldCheck, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { signInWithGoogle } from "@/lib/firebase";
import { firebaseDb } from "@/lib/firebase-db";
import { useApp } from "@/context/AppContext";
import { siteConfig, isOwnerEmail } from "@/config/site";
import { clientApi } from "@/lib/client-api";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, showToast, refreshUserData } = useApp();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const isOwner = isOwnerEmail(cleanEmail);
      const data = await clientApi.upsertUser({
        email: cleanEmail,
        name: name.trim() || cleanEmail.split("@")[0],
      });
      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("clipearn_userId", data.user.id);
      }
      await firebaseDb.upsertUser(data.user);
      await refreshUserData();
      showToast(
        isOwner
          ? "Logged in as Platform Owner (Unlimited Perks Activated)!"
          : "Welcome to ClipEarn!",
        "success"
      );
      router.push("/");
    } catch {
      showToast("Login error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const cred = await signInWithGoogle();
      const fbUser = cred.user;
      if (fbUser && fbUser.email) {
        const data = await clientApi.upsertUser({
          id: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email.split("@")[0],
          avatar: fbUser.photoURL || undefined,
        });
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("clipearn_userId", data.user.id);
        }
        await firebaseDb.upsertUser(data.user);
        await refreshUserData();
        showToast(`Welcome to ClipEarn, ${data.user.name}!`, "success");
        router.push("/");
      }
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        showToast(err.message || "Could not start Google sign in.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-12 px-4 text-fg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full rounded-2xl bg-surface border border-line p-8 space-y-6 shadow-xl"
      >
        {/* LOGO */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-accent p-[1.5px]">
              <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center relative">
                <Scissors className="w-4 h-4 text-accent transform -rotate-45" />
                <Play className="w-2 h-2 text-accent fill-accent absolute bottom-1 right-1" />
              </div>
            </div>
            <div className="text-2xl font-black text-fg">
              Clip
              <span className="text-accent">Earn</span>
            </div>
          </Link>
          <h2 className="text-xl font-bold text-fg tracking-tight">
            Join the Clipper Community
          </h2>
          <p className="text-xs text-muted">
            Sign up or log in to support creators and get authentic views on your clips.
          </p>
        </div>

        {/* GOOGLE SIGN IN BUTTON */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-fg hover:opacity-95 text-bg font-bold text-xs flex items-center justify-center gap-3 shadow-md transition-opacity transform active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
            <span>
              We only use your Google account to identify you. We never access your inbox.
            </span>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-line" />
          <span className="bg-surface px-3 text-[10px] uppercase font-bold text-muted tracking-wider absolute">
            or with email
          </span>
        </div>

        {/* EMAIL LOGIN FORM */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-fg">Your Name (Optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Edits"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-fg">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
            <p className="text-[10px] text-muted mt-1">
              Tip: signing in with <strong className="text-fg">{siteConfig.ownerEmail}</strong> activates Owner role.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent hover:opacity-95 text-accent-fg font-extrabold text-xs tracking-wider uppercase transition-opacity shadow-md transform active:scale-98"
          >
            {loading ? "Signing in..." : "Continue to Platform"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
