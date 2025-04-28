// This file would handle NextAuth.js authentication
// Implementation would include:
// 1. Setting up authentication providers (credentials, OAuth, etc.)
// 2. Configuring callbacks for session handling
// 3. Setting up database adapters if needed

import NextAuth, { AuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { JWT } from "next-auth/jwt";

// Define custom types to handle user role
interface CustomUser extends User {
  role?: UserRole;
}

interface CustomSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
  };
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Auth attempt for email:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials: email or password");
          throw new Error("Email and password required");
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            console.error(`User not found for email: ${credentials.email}`);
            throw new Error("User not found");
          }

          if (!user.password) {
            console.error(`Password is missing for user: ${credentials.email}`);
            throw new Error("Invalid user account");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error(`Invalid password for user: ${credentials.email}`);
            throw new Error("Invalid password");
          }

          console.log(
            `Successful login for user: ${user.email}, role: ${user.role}`
          );

          // Return user with role for JWT token
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error; // Re-throw for NextAuth to handle
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: CustomUser }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: CustomSession; token: JWT }) {
      if (session?.user) {
        session.user.role = token.role as UserRole;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
