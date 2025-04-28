import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch events with filtering and pagination
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
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build the query
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    // Date filtering
    if (startDate || endDate) {
      where.OR = [
        // Start date falls in range
        {
          startDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
        // End date falls in range
        {
          endDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
        // Event spans the entire range
        {
          AND: [
            {
              startDate: {
                ...(startDate && { lte: new Date(startDate) }),
              },
            },
            {
              endDate: {
                ...(endDate && { gte: new Date(endDate) }),
              },
            },
          ],
        },
      ];
    }

    // Count total records for pagination
    const totalEvents = await prisma.event.count({ where });

    // Fetch events with admin details
    const events = await prisma.event.findMany({
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
      orderBy: [{ startDate: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format the events for the response
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      isAllDay: event.isAllDay,
      category: event.category,
      status: event.status,
      classIds: event.classIds,
      createdAt: event.createdAt,
      organizer: event.admin.user.name,
      adminId: event.adminId,
    }));

    return NextResponse.json({
      events: formattedEvents,
      meta: {
        total: totalEvents,
        page,
        limit,
        totalPages: Math.ceil(totalEvents / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST: Create a new event
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
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      isAllDay = false,
      category = "OTHER",
      status = "UPCOMING",
      classIds = [],
    } = data;

    // Validate required fields
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Title, start date, and end date are required" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startDate: start,
        endDate: end,
        isAllDay,
        category,
        status,
        classIds,
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
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      isAllDay: event.isAllDay,
      category: event.category,
      status: event.status,
      classIds: event.classIds,
      createdAt: event.createdAt,
      organizer: event.admin.user.name,
      adminId: event.adminId,
    };

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: formattedEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

// PUT: Update an event
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

    // Get request data
    const data = await request.json();
    const {
      id,
      title,
      description,
      location,
      startDate,
      endDate,
      isAllDay,
      category,
      status,
      classIds,
    } = data;

    // Validate required fields
    if (!id || !title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "ID, title, start date, and end date are required" },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Validate dates
    const start = startDate ? new Date(startDate) : existingEvent.startDate;
    const end = endDate ? new Date(endDate) : existingEvent.endDate;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description: description ?? existingEvent.description,
        location: location ?? existingEvent.location,
        startDate: start,
        endDate: end,
        isAllDay: isAllDay ?? existingEvent.isAllDay,
        category: category ?? existingEvent.category,
        status: status ?? existingEvent.status,
        classIds: classIds ?? existingEvent.classIds,
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
    const formattedEvent = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      location: updatedEvent.location,
      startDate: updatedEvent.startDate,
      endDate: updatedEvent.endDate,
      isAllDay: updatedEvent.isAllDay,
      category: updatedEvent.category,
      status: updatedEvent.status,
      classIds: updatedEvent.classIds,
      createdAt: updatedEvent.createdAt,
      updatedAt: updatedEvent.updatedAt,
      organizer: updatedEvent.admin.user.name,
      adminId: updatedEvent.adminId,
    };

    return NextResponse.json({
      message: "Event updated successfully",
      event: formattedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an event
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

    // Get event ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Delete the event
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
