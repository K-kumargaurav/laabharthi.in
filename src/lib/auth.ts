// src/lib/auth.ts
// NextAuth configuration — credentials provider with phone OTP.

import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyOTP } from "@/lib/otp";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        // Verify OTP
        const result = await verifyOTP(credentials.phone, credentials.otp);
        if (!result.valid) return null;

        const cleaned = credentials.phone.replace(/\D/g, "");

        // Upsert user — create if first login, return existing if returning
        const user = await prisma.user.upsert({
          where: { phone: cleaned },
          update: { updatedAt: new Date() },
          create: {
            phone: cleaned,
            name: null,
            email: null,
          },
        });

        return {
          id: user.id,
          phone: user.phone ?? "",
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      // On first sign in, attach user data to token
      if (user) {
        token.id = user.id;
        token.phone = (user as { phone?: string }).phone;
      }
      return token;
    },

    async session({ session, token }) {
      // Attach token data to session object
      if (token) {
        session.user.id = token.id as string;
        (session.user as { phone?: string }).phone = token.phone as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",    // Our custom login page
    error: "/login",     // Redirect errors to login
  },

  secret: process.env.NEXTAUTH_SECRET,
};