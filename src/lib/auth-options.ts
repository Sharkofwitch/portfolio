import { DefaultSession, NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from "@/lib/prisma";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        console.log("Authorizing admin login for email:", credentials.email);

        try {
          // Find the admin user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            console.log("Auth failed: User not found or no password");
            return null;
          }

          // Compare provided password with stored hash
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            console.log("Auth failed: Invalid password");
            return null;
          }

          console.log("Auth successful");

          // Return user object with role
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: "admin",
            image: null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback - Adding role to token:", user.role);
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        console.log("Session callback - Adding role to session:", token.role);
        session.user.role = token.role as string;
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every hour
  },
};
