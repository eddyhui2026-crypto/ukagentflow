import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { getSql } from "@/lib/db/neon";
import { readThenTouchUserLastLoginAt } from "@/lib/users/last-login";

class InvalidLoginError extends CredentialsSignin {
  code = "invalid_credentials";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const emailRaw = credentials?.email;
        const passwordRaw = credentials?.password;
        if (
          typeof emailRaw !== "string" ||
          typeof passwordRaw !== "string" ||
          !emailRaw.trim() ||
          !passwordRaw
        ) {
          throw new InvalidLoginError();
        }

        const email = emailRaw.toLowerCase().trim();
        const sql = getSql();
        const rows = await sql`
          SELECT id, company_id, name, email, role, password_hash
          FROM users
          WHERE lower(trim(email)) = ${email}
          LIMIT 1
        `;

        const row = rows[0] as
          | {
              id: string;
              company_id: string;
              name: string;
              email: string;
              role: string;
              password_hash: string | null;
            }
          | undefined;

        if (!row?.password_hash) {
          throw new InvalidLoginError();
        }

        const ok = await compare(passwordRaw, row.password_hash);
        if (!ok) {
          throw new InvalidLoginError();
        }

        return {
          id: row.id,
          name: row.name,
          email: row.email,
          companyId: row.company_id,
          role: row.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const uid = typeof user.id === "string" ? user.id : undefined;
        if (uid) {
          token.sub = uid;
          if (user.companyId) {
            token.companyId = user.companyId;
          }
          if (user.role) {
            token.role = user.role;
          }
          const previous = await readThenTouchUserLastLoginAt(uid);
          token.previousLoginAt = previous ? previous.toISOString() : null;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (typeof token.companyId === "string") {
          session.user.companyId = token.companyId;
        }
        if (typeof token.role === "string") {
          session.user.role = token.role;
        }
        if (token.previousLoginAt !== undefined) {
          session.user.previousLoginAt =
            typeof token.previousLoginAt === "string" ? token.previousLoginAt : null;
        }
      }
      return session;
    },
  },
});
