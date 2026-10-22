"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithGoogle } from "@/lib/firebase";
import { firebaseDb } from "@/lib/firebase-db";
import { useApp } from "@/context/AppContext";
import { siteConfig } from "@/config/site";
import { clientApi } from "@/lib/client-api";
import { X, ShieldCheck, Sparkles } from "lucide-react";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, showToast, refreshUserData, setUser } = useApp();
  const [customEmail, setCustomEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 1. Authenticate with Firebase Google Provider (Identity Only: openid, email, profile)
      const cred = await signInWithGoogle();
      const fbUser = cred.user;

      if (fbUser && fbUser.email) {
        // 2. Upsert in user layer
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

        // 3. Sync into Firebase Firestore users collection
        await firebaseDb.upsertUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          avatar: data.user.avatar,
          role: data.user.role,
          credits: data.user.credits,
          postCredits: data.user.postCredits,
          bonusSlotsToday: data.user.bonusSlotsToday,
          dailyLimitOverride: data.user.dailyLimitOverride,
          vipUntil: data.user.vipUntil,
          createdAt: data.user.createdAt,
        });

        showToast(`Welcome back, ${data.user.name}!`, "success");
        closeLoginModal();
        await refreshUserData();
      }
    } catch (err: any) {
      console.warn("Firebase Google login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        // User voluntarily closed popup
      } else if (err.code === "auth/unauthorized-domain") {
        showToast("Domain not authorized in Firebase Console. Please sign in with your email address below.", "error");
      } else {
        showToast(err.message || "Could not sign in with Google. You can sign in with your email address below.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customEmail.trim()) return;
    setIsLoading(true);
    try {
      const email = customEmail.trim();
      const data = await clientApi.upsertUser({
        email,
        name: email.split("@")[0],
      });

      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("clipearn_userId", data.user.id);
      }

      await firebaseDb.upsertUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar,
        role: data.user.role,
        credits: data.user.credits,
        postCredits: data.user.postCredits,
        bonusSlotsToday: data.user.bonusSlotsToday,
        dailyLimitOverride: data.user.dailyLimitOverride,
        vipUntil: data.user.vipUntil,
        createdAt: data.user.createdAt,
      });

      showToast(`Signed in as ${data.user.name}${data.user.role === "owner" ? " (Platform Owner)" : ""}`, "success");
      closeLoginModal();
      await refreshUserData();
    } catch (err: any) {
      showToast(err.message || "Failed to sign in", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop (solid dim, no blur) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLoginModal}
          className="fixed inset-0 bg-black/70"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-surface border border-line rounded-2xl shadow-2xl p-6 md:p-8 z-10 overflow-hidden"
        >
          {/* Solid accent top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />

          {/* Close button */}
          <button
            onClick={closeLoginModal}
            className="absolute top-4 right-4 p-1.5 text-muted hover:text-fg rounded-lg hover:bg-surface2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Headline */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-2xl font-black tracking-tight text-fg">
                Clip<span className="text-accent">Earn</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-fg tracking-tight">
              Sign In to {siteConfig.name}
            </h2>
            <p className="text-sm text-muted mt-1">
              Join fellow clippers. Watch, support each other, and earn post credits.
            </p>
          </div>

          {/* Main Action: Continue with Google (Firebase) */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-fg hover:opacity-95 text-bg font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
            >
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
            </button>

            {/* MANDATORY PRIVACY DISCLAIMER */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
              <span>
                We only use your Google account to identify you. We never access your inbox.
              </span>
            </div>
          </div>

          {/* Privacy & Scope badges */}
          <div className="mt-5 p-3 rounded-xl bg-surface2 border border-line text-xs text-muted space-y-1">
            <div className="flex items-center gap-1.5 text-fg font-medium">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Firebase Identity Authentication</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted">
              Requested scopes: <code className="text-fg px-1 py-0.5 rounded bg-bg">openid</code>,{" "}
              <code className="text-fg px-1 py-0.5 rounded bg-bg">email</code>, <code className="text-fg px-1 py-0.5 rounded bg-bg">profile</code>. Protected by Firebase Security Rules.
            </p>
          </div>

          {/* Clean Email Login */}
          <div className="mt-5 pt-4 border-t border-line space-y-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Or sign in with email</span>
              <a
                href="https://www.instagram.com/gaurabb_adk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 font-semibold text-[11px]"
              >
                Need VIP? Contact Owner &rarr;
              </a>
            </div>

            <form onSubmit={handleEmailLogin} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="flex-1 bg-surface2 border border-line rounded-xl px-3 py-2 text-xs text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                disabled={!customEmail.trim() || isLoading}
                className="px-4 py-2 bg-accent hover:opacity-90 text-accent-fg text-xs font-semibold rounded-xl disabled:opacity-50 transition-opacity whitespace-nowrap"
              >
                Sign In
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
