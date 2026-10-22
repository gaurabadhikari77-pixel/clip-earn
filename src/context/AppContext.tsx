"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { auth, onAuthStateChanged, signOutUser } from "@/lib/firebase";
import { User, Video, SiteSettings, UserRole } from "@/types";
import { siteConfig, isOwnerEmail } from "@/config/site";
import { clientApi } from "@/lib/client-api";

export interface PostLimitStats {
  postsUsedToday: number;
  baseLimit: number;
  bonusSlotsEarned: number;
  totalLimit: number;
  maxBonusAllowed: number;
  dailyLimit: number;
  isUnlimited: boolean;
  canPost: boolean;
  nextReset: string;
  secondsUntilReset: number;
  credits: number;
}

export interface ActiveTrackingSession {
  video: Video;
  startTime: number;
  totalTimeAwaySeconds: number;
  isAway: boolean;
  lastAwayTimestamp: number | null;
  minSecondsRequired: number;
  hasMetTime: boolean;
  liked: boolean;
  commented: boolean;
  followed: boolean;
  isVerifying: boolean;
  isVerified: boolean;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  limitStats: PostLimitStats | null;
  settings: SiteSettings | null;
  refreshUserData: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  switchUserPersona: (role: UserRole | "custom", customEmail?: string) => Promise<void>;
  logout: () => Promise<void>;

  // Login Modal
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  // Engagement Tracker
  activeSession: ActiveTrackingSession | null;
  startEngagement: (video: Video) => void;
  closeEngagement: () => void;
  toggleChecklist: (key: "liked" | "commented" | "followed") => void;
  confirmAndVerifyEngagement: () => Promise<{ success: boolean; creditAwarded?: boolean; message?: string }>;

  // Toast / Notifications
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;

  // Reward animation trigger
  creditAnimationTrigger: number;
  triggerRewardMoment: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [limitStats, setLimitStats] = useState<PostLimitStats | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [creditAnimationTrigger, setCreditAnimationTrigger] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Active tracking session
  const [activeSession, setActiveSession] = useState<ActiveTrackingSession | null>(null);
  const trackingRef = useRef<ActiveTrackingSession | null>(null);
  trackingRef.current = activeSession;

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  const refreshUserData = useCallback(async () => {
    try {
      const storedUserId = typeof window !== "undefined" ? localStorage.getItem("clipearn_userId") : null;
      if (storedUserId) {
        const data = await clientApi.getUser(storedUserId);
        if (data.user) {
          if (isOwnerEmail(data.user.email)) {
            data.user.role = "owner";
            data.user.credits = 9999;
            data.user.postCredits = 9999;
            if (data.limitStats) {
              data.limitStats.isUnlimited = true;
              data.limitStats.canPost = true;
              data.limitStats.credits = 9999;
            }
          }
          setUser(data.user);
          setLimitStats(data.limitStats);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch user:", e);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await clientApi.getSettings();
      setSettings(data);
    } catch (e) {
      console.error("Failed to fetch settings:", e);
    }
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        try {
          const data = await clientApi.upsertUser({
            id: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || fbUser.email.split("@")[0],
            avatar: fbUser.photoURL || undefined,
          });
          if (isOwnerEmail(data.user.email)) {
            data.user.role = "owner";
            data.user.credits = 9999;
            data.user.postCredits = 9999;
            if (data.limitStats) {
              data.limitStats.isUnlimited = true;
              data.limitStats.canPost = true;
              data.limitStats.credits = 9999;
            }
          }
          setUser(data.user);
          setLimitStats(data.limitStats);
          if (typeof window !== "undefined") {
            localStorage.setItem("clipearn_userId", data.user.id);
          }
        } catch (e) {
          console.error("Firebase auth sync error:", e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync with NextAuth session whenever it changes
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      refreshUserData();
    } else if (status === "unauthenticated") {
      const storedUserId = typeof window !== "undefined" ? localStorage.getItem("clipearn_userId") : null;
      if (!storedUserId) {
        // Only clear if not logged into Firebase either
        if (!auth.currentUser) {
          setUser(null);
          setLimitStats(null);
        }
      } else {
        refreshUserData();
      }
    }
  }, [status, session, refreshUserData]);

  useEffect(() => {
    refreshUserData();
    refreshSettings();
  }, [refreshUserData, refreshSettings]);

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("clipearn_userId");
    }
    setUser(null);
    setLimitStats(null);
    try {
      await signOutUser();
    } catch (e) {
      console.error("Firebase sign out error:", e);
    }
    try {
      await nextAuthSignOut({ redirect: false });
    } catch (e) {
      // ignore
    }
    showToast("Signed out successfully", "info");
  }, [showToast]);

  // Persona switch helper for instant role testing
  const switchUserPersona = useCallback(
    async (role: UserRole | "custom", customEmail?: string) => {
      // Non-owners are strictly prevented from changing levels
      if (!user?.email || !isOwnerEmail(user.email)) {
        if (typeof window !== "undefined") {
          window.open("https://www.instagram.com/gaurabb_adk/", "_blank", "noopener,noreferrer");
        }
        showToast("Level switching is restricted to the platform owner. Contact @gaurabb_adk on Instagram to upgrade.", "info");
        return;
      }

      let targetEmail = customEmail || "user@example.com";
      let name = "Clipper User";

      if (role === "owner") {
        targetEmail = siteConfig.ownerEmails[0] || "iamdeathflow11@gmail.com";
        name = "ClipEarn Owner";
      } else if (role === "vip") {
        targetEmail = "sarah.clips@example.com";
        name = "Sarah Edits (VIP)";
      } else if (role === "admin") {
        targetEmail = "admin@clipearn.com";
        name = "Admin Moderator";
      }

      try {
        const data = await clientApi.upsertUser({
          email: targetEmail,
          name,
          role: role === "custom" ? undefined : role,
        });
        setUser(data.user);
        setLimitStats(data.limitStats);
        if (typeof window !== "undefined") {
          localStorage.setItem("clipearn_userId", data.user.id);
        }
        showToast(`Switched persona to: ${data.user.role.toUpperCase()} (${data.user.name})`, "success");
      } catch (err: any) {
        showToast("Error switching user persona", "error");
      }
    },
    [user, showToast]
  );

  const triggerRewardMoment = useCallback(() => {
    // 1. Confetti burst
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#ec4899", "#3b82f6", "#10b981", "#fbbf24"],
      });
    } catch (e) {
      console.warn("Confetti error", e);
    }

    // 2. Animate navbar post credit pill
    setCreditAnimationTrigger((prev) => prev + 1);
  }, []);

  // --- ENGAGEMENT TRACKER: Page Visibility & Window Focus API ---
  const startEngagement = useCallback(
    (video: Video) => {
      // If unauthenticated visitor, prompt Google login modal
      if (!user) {
        openLoginModal();
        showToast("Please sign in with Google to watch and earn post credits.", "info");
        return;
      }

      const minSec = settings?.minWatchSeconds || siteConfig.defaultMinWatchSeconds;

      const newSession: ActiveTrackingSession = {
        video,
        startTime: Date.now(),
        totalTimeAwaySeconds: 0,
        isAway: true,
        lastAwayTimestamp: Date.now(),
        minSecondsRequired: minSec,
        hasMetTime: false,
        liked: false,
        commented: false,
        followed: false,
        isVerifying: false,
        isVerified: false,
      };

      setActiveSession(newSession);

      // Open original video in new tab
      window.open(video.url, "_blank", "noopener,noreferrer");

      const rewardHint = video.isOwnerVideo
        ? "Owner Clip: Earn +2 upload slots & +2 credits!"
        : "Watch for at least 13s to earn 1 credit!";

      showToast(
        `Opened clip on ${video.platform.toUpperCase()}. ${rewardHint}`,
        "info"
      );
    },
    [user, settings, openLoginModal, showToast]
  );

  const closeEngagement = useCallback(() => {
    setActiveSession(null);
  }, []);

  const toggleChecklist = useCallback((key: "liked" | "commented" | "followed") => {
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  }, []);

  // Listen to visibility & focus events
  useEffect(() => {
    const handleLeave = () => {
      setActiveSession((prev) => {
        if (!prev || prev.isVerified) return prev;
        return {
          ...prev,
          isAway: true,
          lastAwayTimestamp: Date.now(),
        };
      });
    };

    const handleReturn = () => {
      setActiveSession((prev) => {
        if (!prev || prev.isVerified || !prev.lastAwayTimestamp) return prev;
        const now = Date.now();
        const secondsSpent = (now - prev.lastAwayTimestamp) / 1000;
        const updatedTotal = prev.totalTimeAwaySeconds + secondsSpent;
        const hasMetTime = updatedTotal >= prev.minSecondsRequired;

        return {
          ...prev,
          isAway: false,
          totalTimeAwaySeconds: updatedTotal,
          lastAwayTimestamp: null,
          hasMetTime,
        };
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleLeave();
      } else {
        handleReturn();
      }
    };

    window.addEventListener("blur", handleLeave);
    window.addEventListener("focus", handleReturn);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Heartbeat ticker to smoothly update time if away or focused
    const ticker = setInterval(() => {
      setActiveSession((prev) => {
        if (!prev || prev.isVerified) return prev;
        if (prev.isAway && prev.lastAwayTimestamp) {
          const now = Date.now();
          const currentAwaySec = (now - prev.lastAwayTimestamp) / 1000;
          const currentTotal = prev.totalTimeAwaySeconds + currentAwaySec;
          return {
            ...prev,
            hasMetTime: currentTotal >= prev.minSecondsRequired,
          };
        }
        return prev;
      });
    }, 500);

    return () => {
      window.removeEventListener("blur", handleLeave);
      window.removeEventListener("focus", handleReturn);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(ticker);
    };
  }, []);

  // Confirm & verify engagement with API
  const confirmAndVerifyEngagement = useCallback(async () => {
    if (!activeSession) return { success: false };

    if (!user) {
      openLoginModal();
      showToast("Please sign in with Google to claim post credits", "error");
      return { success: false };
    }

    // Calculate final time
    let finalSeconds = activeSession.totalTimeAwaySeconds;
    if (activeSession.isAway && activeSession.lastAwayTimestamp) {
      finalSeconds += (Date.now() - activeSession.lastAwayTimestamp) / 1000;
    }

    if (finalSeconds < activeSession.minSecondsRequired) {
      showToast(
        `Minimum engagement time of ${activeSession.minSecondsRequired}s required. Recorded ${Math.floor(finalSeconds)}s so far.`,
        "error"
      );
      return { success: false };
    }

    // MANDATORY REQUIREMENT: User must like the video to earn rewards
    if (!activeSession.liked) {
      showToast("You must like the video to verify engagement and claim your reward!", "error");
      return { success: false, message: "Like required" };
    }

    setActiveSession((prev) => (prev ? { ...prev, isVerifying: true } : null));

    try {
      const data = await clientApi.verifyEngagement(
        activeSession.video.id,
        user.id,
        Math.floor(finalSeconds),
        activeSession.liked,
        activeSession.commented,
        activeSession.followed
      );

      if (!data.success) {
        showToast(data.message || "Verification failed", "error");
        setActiveSession((prev) => (prev ? { ...prev, isVerifying: false } : null));
        return { success: false, message: data.message };
      }

      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              isVerifying: false,
              isVerified: true,
              totalTimeAwaySeconds: finalSeconds,
            }
          : null
      );

      if (data.isOwnerBonus) {
        triggerRewardMoment();
        showToast(
          `Verified! +${data.slotsAwarded} upload slots unlocked & +${data.creditsAwarded} post credits earned from Owner clip!`,
          "success"
        );
      } else if (data.creditAwarded) {
        triggerRewardMoment();
        showToast("Verified! You earned 1 post credit.", "success");
      } else {
        showToast(data.message || "Engagement verified!", "info");
      }

      // Refresh limits & user data
      await refreshUserData();

      // Notify feed to immediately remove this video for this viewer
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("clipearn_engagement_verified", {
            detail: { videoId: activeSession.video.id },
          })
        );
      }

      return { success: true, creditAwarded: data.creditAwarded, message: data.message };
    } catch (err: any) {
      showToast(err.message || "Error verifying engagement", "error");
      setActiveSession((prev) => (prev ? { ...prev, isVerifying: false } : null));
      return { success: false };
    }
  }, [activeSession, user, openLoginModal, showToast, triggerRewardMoment, refreshUserData]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        limitStats,
        settings,
        refreshUserData,
        refreshSettings,
        switchUserPersona,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        activeSession,
        startEngagement,
        closeEngagement,
        toggleChecklist,
        confirmAndVerifyEngagement,
        toast,
        showToast,
        creditAnimationTrigger,
        triggerRewardMoment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
