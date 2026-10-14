import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Provided Firebase Configuration
export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyAKpF61DrBhuvOjtZBVHxewI2kOrslV9P8",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "clipearn-6ff40.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "clipearn-6ff40",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "clipearn-6ff40.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1014656683711",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:1014656683711:web:cc02f3ef28f6ab6d6e400a",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-NGMYFW1MWW",
};

// Initialize Firebase App (singleton pattern across SSR & client)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Configure Google Auth Provider strictly for Identity Only (openid, email, profile)
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: "select_account",
});
googleAuthProvider.addScope("openid");
googleAuthProvider.addScope("email");
googleAuthProvider.addScope("profile");

/**
 * Initiates Google Sign-In popup with Firebase Auth.
 * Requests ONLY identity scopes (never inbox or Gmail).
 */
export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleAuthProvider);
}

/**
 * Signs out the currently authenticated Firebase user.
 */
export async function signOutUser() {
  return await firebaseSignOut(auth);
}

export { onAuthStateChanged };
export type { FirebaseUser };
export default app;
