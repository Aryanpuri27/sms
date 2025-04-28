import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch announcements with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const important = searchParams.get("important") === "true";

    // Build the query
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (searchParams.has("important")) {
      where.important = important;
    }

    // Count total records for pagination
    const totalAnnouncements = await prisma.announcement.count({ where });

    // Fetch announcements with admin details
    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        admin: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format the announcements for the response
    const formattedAnnouncements = announcements.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      important: announcement.important,
      expiresAt: announcement.expiresAt,
      createdAt: announcement.createdAt,
      author: announcement.admin.user.name,
      adminId: announcement.adminId,
    }));

    return NextResponse.json({
      announcements: formattedAnnouncements,
      meta: {
        total: totalAnnouncements,
        page,
        limit,
        totalPages: Math.ceil(totalAnnouncements / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST: Create a new announcement
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Get the admin ID
    const admin = await prisma.admin.findFirst({
      where: { userId: session.user.id },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 404 }
      );
    }

    // Get request data
    const data = await request.json();
    const { title, content, important = false, expiresAt } = data;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Create the announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        important,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        admin: {
          connect: { id: admin.id },
        },
      },
      include: {
        admin: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedAnnouncement = {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      important: announcement.important,
      expiresAt: announcement.expiresAt,
      createdAt: announcement.createdAt,
      author: announcement.admin.user.name,
      adminId: announcement.adminId,
    };

    return NextResponse.json(
      {
        message: "Announcement created successfully",
        announcement: formattedAnnouncement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}

// PUT: Update an announcement
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Get the admin ID
    const admin = await prisma.admin.findFirst({
      where: { userId: session.user.id },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 404 }
      );
    }

    // Get request data
    const data = await request.json();
    const { id, title, content, important, expiresAt } = data;

    // Validate required fields
    if (!id || !title || !content) {
      return NextResponse.json(
        { error: "ID, title, and content are required" },
        { status: 400 }
      );
    }

    // Check if announcement exists and belongs to this admin
    const existingAnnouncement = await prisma.announcement.findFirst({
      where: { id },
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Update the announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        important: important ?? existingAnnouncement.important,
        expiresAt: expiresAt
          ? new Date(expiresAt)
          : existingAnnouncement.expiresAt,
      },
      include: {
        admin: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedAnnouncement = {
      id: updatedAnnouncement.id,
      title: updatedAnnouncement.title,
      content: updatedAnnouncement.content,
      important: updatedAnnouncement.important,
      expiresAt: updatedAnnouncement.expiresAt,
      createdAt: updatedAnnouncement.createdAt,
      updatedAt: updatedAnnouncement.updatedAt,
      author: updatedAnnouncement.admin.user.name,
      adminId: updatedAnnouncement.adminId,
    };

    return NextResponse.json({
      message: "Announcement updated successfully",
      announcement: formattedAnnouncement,
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an announcement
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Get announcement ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Delete the announcement
    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
