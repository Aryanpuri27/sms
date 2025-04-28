import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// PATCH: Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();

    // Check if messageIds are provided
    if (
      !data.messageIds ||
      !Array.isArray(data.messageIds) ||
      data.messageIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Message IDs are required" },
        { status: 400 }
      );
    }

    // Update messages to mark them as read
    const updateResult = await prisma.message.updateMany({
      where: {
        id: { in: data.messageIds },
        receiverId: userId, // Ensure user can only mark their own messages as read
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: updateResult.count,
      message: `${updateResult.count} messages marked as read`,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
