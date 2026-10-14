import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "./firebase";
import { Video, User, SiteSettings, OwnerClipReward, Engagement } from "@/types";

const isBrowser = typeof window !== "undefined";

/**
 * Firestore Service Layer for ClipEarn
 * Handles live synchronization between Firestore and platform models.
 * In the browser, operates with live Firebase connection;
 * In Node scripts/tests, safely falls back to local store to avoid network timeout delays.
 */
export const firebaseDb = {
  // --- USERS ---
  async upsertUser(user: Partial<User> & { id: string; email: string }): Promise<void> {
    if (!isBrowser) return;
    try {
      const userRef = doc(firestore, "users", user.id);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          ...user,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userRef, {
          ...user,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn("Firestore upsertUser error (operating with local fallback):", e);
    }
  },

  async getUser(userId: string): Promise<User | null> {
    if (!isBrowser) return null;
    try {
      const userRef = doc(firestore, "users", userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as User;
      }
      return null;
    } catch (e) {
      console.warn("Firestore getUser error:", e);
      return null;
    }
  },

  // --- VIDEOS ---
  async addVideo(video: Video): Promise<void> {
    if (!isBrowser) return;
    try {
      const videoRef = doc(firestore, "videos", video.id);
      await setDoc(videoRef, {
        ...video,
        createdAt: video.createdAt || new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Firestore addVideo error:", e);
    }
  },

  async getVideos(maxCount = 100): Promise<Video[]> {
    if (!isBrowser) return [];
    try {
      const vidsRef = collection(firestore, "videos");
      const q = query(vidsRef, orderBy("createdAt", "desc"), limit(maxCount));
      const snap = await getDocs(q);
      const list: Video[] = [];
      snap.forEach((d) => list.push(d.data() as Video));
      return list;
    } catch (e) {
      console.warn("Firestore getVideos error:", e);
      return [];
    }
  },

  // --- ENGAGEMENTS ---
  async recordEngagement(engagement: Engagement): Promise<void> {
    if (!isBrowser) return;
    try {
      const engRef = doc(firestore, "engagements", engagement.id);
      await setDoc(engRef, {
        ...engagement,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Firestore recordEngagement error:", e);
    }
  },

  // --- OWNER REWARDS ---
  async recordOwnerReward(reward: OwnerClipReward): Promise<void> {
    if (!isBrowser) return;
    try {
      const rwdRef = doc(firestore, "ownerRewards", reward.id);
      await setDoc(rwdRef, {
        ...reward,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Firestore recordOwnerReward error:", e);
    }
  },

  // --- SETTINGS ---
  async getSettings(): Promise<SiteSettings | null> {
    if (!isBrowser) return null;
    try {
      const setRef = doc(firestore, "settings", "global");
      const snap = await getDoc(setRef);
      if (snap.exists()) {
        return snap.data() as SiteSettings;
      }
      return null;
    } catch (e) {
      console.warn("Firestore getSettings error:", e);
      return null;
    }
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<void> {
    if (!isBrowser) return;
    try {
      const setRef = doc(firestore, "settings", "global");
      await setDoc(setRef, settings, { merge: true });
    } catch (e) {
      console.warn("Firestore updateSettings error:", e);
    }
  },
};
