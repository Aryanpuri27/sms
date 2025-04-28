import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// PATCH: Update read status for multiple messages
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { messageIds, read } = await request.json();

    // Validate request body
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing messageIds" },
        { status: 400 }
      );
    }

    if (read === undefined || typeof read !== "boolean") {
      return NextResponse.json(
        { error: "The 'read' status must be a boolean" },
        { status: 400 }
      );
    }

    // Fetch the messages to check authorization
    const messages = await prisma.message.findMany({
      where: {
        id: { in: messageIds },
      },
    });

    // Filter for messages where the user is the receiver
    const validMessageIds = messages
      .filter((msg) => msg.receiverId === userId)
      .map((msg) => msg.id);

    if (validMessageIds.length === 0) {
      return NextResponse.json(
        { error: "No valid messages to update" },
        { status: 400 }
      );
    }

    // Update messages
    const result = await prisma.message.updateMany({
      where: {
        id: { in: validMessageIds },
        receiverId: userId,
      },
      data: {
        read,
      },
    });

    return NextResponse.json({
      message: `Updated read status for ${result.count} messages`,
      updated: result.count,
      status: read ? "read" : "unread",
    });
  } catch (error) {
    console.error("Error updating message read status:", error);
    return NextResponse.json(
      { error: "Failed to update message read status" },
      { status: 500 }
    );
  }
}
