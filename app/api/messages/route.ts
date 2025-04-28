import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch messages for the current user
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get("folder") || "inbox"; // inbox, sent, archive
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unread") === "true";

    // Build the query
    let where: any = {};

    if (folder === "inbox") {
      where = {
        receiverId: userId,
      };
    } else if (folder === "sent") {
      where = {
        senderId: userId,
      };
    } else if (folder === "archived") {
      // This would require adding an 'archived' field to the Message model
      // For now, we'll just use inbox as fallback
      where = {
        receiverId: userId,
      };
    }

    if (unreadOnly) {
      where.read = false;
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    // Count total messages for pagination
    const totalMessages = await prisma.message.count({ where });

    // Fetch messages with user details
    const messages = await prisma.message.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format messages for response
    const formattedMessages = messages.map((message) => ({
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
    }));

    return NextResponse.json({
      messages: formattedMessages,
      meta: {
        total: totalMessages,
        page,
        limit,
        totalPages: Math.ceil(totalMessages / limit),
        unreadCount: unreadOnly
          ? totalMessages
          : await prisma.message.count({
              where: {
                receiverId: userId,
                read: false,
              },
            }),
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST: Send a new message
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const senderId = session.user.id;

    // Get request data
    const data = await request.json();
    const { receiverId, subject, content } = data;

    // Validate required fields
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver and content are required" },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        subject: subject || "",
        content,
        sender: {
          connect: { id: senderId },
        },
        receiver: {
          connect: { id: receiverId },
        },
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

    // Format response
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

    return NextResponse.json(
      {
        message: "Message sent successfully",
        data: formattedMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
