import { DefaultSession } from "next-auth";
import { UserRole } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      credits?: number;
      postCredits?: number;
      bonusSlotsToday?: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: UserRole;
    credits?: number;
    postCredits?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
