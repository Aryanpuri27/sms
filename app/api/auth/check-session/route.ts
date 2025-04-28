import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
  try {
    // Get the server-side session
    const session = await getServerSession(authOptions);

    // Return session status
    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      authenticated: !!session,
      session: session
        ? {
            user: session.user,
            expires: session.expires,
          }
        : null,
      env: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV || "unknown",
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV !== "production" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
