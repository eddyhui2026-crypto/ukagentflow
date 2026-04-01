import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    companyId?: string;
    role?: string;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      companyId: string;
      role: string;
      /** ISO timestamp of last sign-in *before* this session (set on JWT); null = first sign-in with this feature */
      previousLoginAt?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    companyId?: string;
    role?: string;
    previousLoginAt?: string | null;
  }
}
