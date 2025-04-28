import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

// GET: Fetch count of unread messages for the current authenticated user
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Count unread messages where the user is the receiver
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      count: unreadCount,
    });
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return NextResponse.json(
      { error: "Failed to count unread messages" },
      { status: 500 }
    );
  }
}
