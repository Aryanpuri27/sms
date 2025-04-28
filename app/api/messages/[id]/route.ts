import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

interface Params {
  params: {
    id: string;
  };
}

// GET: Fetch a specific message
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const messageId = params.id;

    // Fetch the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Check if message exists
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is authorized to view this message
    if (message.senderId !== userId && message.receiverId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Mark as read if this is the receiver viewing the message and it's unread
    if (message.receiverId === userId && !message.read) {
      await prisma.message.update({
        where: { id: messageId },
        data: { read: true },
      });
      message.read = true;
    }

    // Format message for response
    const formattedMessage = {
      id: message.id,
      subject: message.subject,
      content: message.content,
      read: message.read,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        email: message.sender.email,
        image: message.sender.image,
        role: message.sender.role,
      },
      receiver: {
        id: message.receiver.id,
        name: message.receiver.name,
        email: message.receiver.email,
        image: message.receiver.image,
        role: message.receiver.role,
      },
    };

    return NextResponse.json(formattedMessage);
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

// PATCH: Update a message (mark as read/unread)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const messageId = params.id;
    const data = await request.json();

    // Fetch the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    // Check if message exists
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is authorized to update this message
    if (message.receiverId !== userId) {
      return NextResponse.json(
        { error: "Only the receiver can update message status" },
        { status: 403 }
      );
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        read: data.read !== undefined ? data.read : message.read,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Format message for response
    const formattedMessage = {
      id: updatedMessage.id,
      subject: updatedMessage.subject,
      content: updatedMessage.content,
      read: updatedMessage.read,
      createdAt: updatedMessage.createdAt,
      sender: {
        id: updatedMessage.sender.id,
        name: updatedMessage.sender.name,
        email: updatedMessage.sender.email,
        image: updatedMessage.sender.image,
        role: updatedMessage.sender.role,
      },
      receiver: {
        id: updatedMessage.receiver.id,
        name: updatedMessage.receiver.name,
        email: updatedMessage.receiver.email,
        image: updatedMessage.receiver.image,
        role: updatedMessage.receiver.role,
      },
    };

    return NextResponse.json({
      message: "Message updated successfully",
      data: formattedMessage,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a message by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const messageId = params.id;

    // Find the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if the user is either the sender or receiver
    if (message.senderId !== userId && message.receiverId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this message" },
        { status: 403 }
      );
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
