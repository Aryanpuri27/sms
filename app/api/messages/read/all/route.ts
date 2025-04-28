import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

// PATCH: Mark all unread messages as read for the current user
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Update all unread messages for this user
    const updateResult = await prisma.message.updateMany({
      where: {
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: updateResult.count,
      message: `All ${updateResult.count} messages marked as read`,
    });
  } catch (error) {
    console.error("Error marking all messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all messages as read" },
      { status: 500 }
    );
  }
}
