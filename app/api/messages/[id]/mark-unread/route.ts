import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

// PATCH: Mark a specific message as unread
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Find the message and check if the user is the receiver
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.receiverId !== userId) {
      return NextResponse.json(
        { error: "Cannot mark messages that don't belong to you" },
        { status: 403 }
      );
    }

    // Update the message to mark as unread
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { read: false },
    });

    return NextResponse.json({
      success: true,
      message: "Message marked as unread",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error marking message as unread:", error);
    return NextResponse.json(
      { error: "Failed to mark message as unread" },
      { status: 500 }
    );
  }
}
