import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/store";
import { isOwnerEmail } from "@/config/site";
import { User } from "@/types";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "demo-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-google-client-secret",
      authorization: {
        params: {
          // STRICT IDENTITY ONLY: openid, email, profile.
          // NEVER request Gmail, Google Drive, or inbox access!
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
    CredentialsProvider({
      id: "quick-login",
      name: "Quick Login (Dev)",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const cleanEmail = credentials.email.trim().toLowerCase();
        const isOwner = isOwnerEmail(cleanEmail);

        // Always upsert user in database on sign-in
        const user = db.upsertUser({
          email: cleanEmail,
          name: credentials.name || cleanEmail.split("@")[0],
          role: isOwner ? "owner" : (credentials.role as any) || undefined,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "clipearn-jwt-default-super-secret-key-32chars",
  callbacks: {
    async signIn({ user, account }) {
      if (user?.email) {
        const cleanEmail = user.email.trim().toLowerCase();
        const isOwner = isOwnerEmail(cleanEmail);

        // Always UPSERT in DB on every successful sign-in
        const dbUser = db.upsertUser({
          email: cleanEmail,
          name: user.name || cleanEmail.split("@")[0],
          avatar: user.image || undefined,
          role: isOwner ? "owner" : undefined,
        });

        user.id = dbUser.id;
        (user as any).role = dbUser.role;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }

      if (token.email) {
        const cleanEmail = (token.email as string).trim().toLowerCase();
        const dbUser =
          db.getUserByEmail(cleanEmail) ||
          db.upsertUser({
            email: cleanEmail,
            name: (token.name as string) || cleanEmail.split("@")[0],
            avatar: (token.picture as string) || undefined,
          });

        token.id = dbUser.id;
        token.role = dbUser.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.email) {
        const cleanEmail = (token.email as string).trim().toLowerCase();
        const dbUser =
          db.getUserByEmail(cleanEmail) ||
          db.upsertUser({
            email: cleanEmail,
            name: session.user.name || cleanEmail.split("@")[0],
            avatar: session.user.image || undefined,
          });

        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
        session.user.credits = dbUser.credits;
        session.user.postCredits = dbUser.postCredits;
        session.user.bonusSlotsToday = dbUser.bonusSlotsToday;
      }
      return session;
    },
  },
};

/**
 * Server-side helper to resolve and upsert the authenticated user from the active NextAuth session,
 * with fallbacks for direct API authentication in local testing or scripts.
 */
export async function getAuthenticatedUser(req?: Request): Promise<User | null> {
  // 1. Try NextAuth session
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const email = session.user.email.trim().toLowerCase();
      return (
        db.getUserByEmail(email) ||
        db.upsertUser({
          email,
          name: session.user.name || email.split("@")[0],
          avatar: session.user.image || undefined,
        })
      );
    }
  } catch (err) {
    console.error("Session lookup error in getAuthenticatedUser:", err);
  }

  // 2. Direct API test / authorization header / fallback
  if (req) {
    const userIdHeader = req.headers.get("x-user-id");
    const userEmailHeader = req.headers.get("x-user-email");

    if (userEmailHeader) {
      const cleanEmail = userEmailHeader.trim().toLowerCase();
      return (
        db.getUserByEmail(cleanEmail) ||
        db.upsertUser({
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
        })
      );
    }

    if (userIdHeader) {
      const existing = db.getUserById(userIdHeader);
      if (existing) return existing;
    }
  }

  return null;
}
