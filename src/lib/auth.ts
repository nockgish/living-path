import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { sendMagicLinkEmail } from "@/lib/resend";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/verify",
  },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.RESEND_FROM ?? "Living Path <hello@livingpath.org>",
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        await sendMagicLinkEmail({
          to: identifier,
          url,
          from: provider.from as string,
        });
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as { role?: Role }).role ?? Role.MEMBER;
      }
      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      // Auto-promote admin emails on first user creation
      if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: Role.ADMIN },
        });
      }
    },
    signIn: async ({ user }) => {
      // Re-check admin status on every sign-in (in case ADMIN_EMAILS env was updated)
      if (user.email && adminEmails.includes(user.email.toLowerCase()) && user.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (dbUser && dbUser.role !== Role.ADMIN) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: Role.ADMIN },
          });
        }
      }
    },
  },
});
