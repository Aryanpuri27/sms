import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch all timetable entries with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");
    const dayOfWeek = searchParams.get("dayOfWeek");

    // Build the filter conditions
    const where: any = {};

    if (classId) {
      where.classId = classId;
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (dayOfWeek && !isNaN(parseInt(dayOfWeek))) {
      where.dayOfWeek = parseInt(dayOfWeek);
    }

    // Fetch timetable entries
    const timetableEntries = await prisma.timetableEntry.findMany({
      where,
      include: {
        class: {
          select: {
            name: true,
          },
        },
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        teacher: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // Format the response
    const formattedEntries = timetableEntries.map((entry) => ({
      id: entry.id,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime.toISOString().split("T")[1].substring(0, 8),
      endTime: entry.endTime.toISOString().split("T")[1].substring(0, 8),
      className: entry.class.name,
      classId: entry.classId,
      subject: entry.subject.name,
      subjectCode: entry.subject.code,
      subjectId: entry.subjectId,
      teacherName: entry.teacher.user.name,
      teacherId: entry.teacherId,
    }));

    return NextResponse.json({
      timetableEntries: formattedEntries,
      count: formattedEntries.length,
    });
  } catch (error) {
    console.error("Error fetching timetable entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable entries" },
      { status: 500 }
    );
  }
}

// POST: Create a new timetable entry
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

    const data = await request.json();
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime } =
      data;

    // Validate required fields
    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    if (!subjectId) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: "Valid day of week is required (0-6)" },
        { status: 400 }
      );
    }

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start time and end time are required" },
        { status: 400 }
      );
    }

    // Parse time strings to datetime objects
    const baseDate = new Date("2000-01-01");
    const startDateTime = new Date(`2000-01-01T${startTime}`);
    const endDateTime = new Date(`2000-01-01T${endTime}`);

    // Validate time format
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid time format. Use HH:MM:SS format." },
        { status: 400 }
      );
    }

    // Ensure end time is after start time
    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts
    // 1. Check if the teacher is already scheduled for another class at the same time
    const teacherConflict = await prisma.timetableEntry.findFirst({
      where: {
        teacherId,
        dayOfWeek,
        OR: [
          {
            // New entry starts during an existing entry
            startTime: { lte: startDateTime },
            endTime: { gt: startDateTime },
          },
          {
            // New entry ends during an existing entry
            startTime: { lt: endDateTime },
            endTime: { gte: endDateTime },
          },
          {
            // New entry completely contains an existing entry
            startTime: { gte: startDateTime },
            endTime: { lte: endDateTime },
          },
        ],
      },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });

    if (teacherConflict) {
      return NextResponse.json(
        {
          error: "Teacher scheduling conflict",
          details: `Teacher already assigned to Class ${
            teacherConflict.class.name
          } for ${teacherConflict.subject.name} from ${teacherConflict.startTime
            .toISOString()
            .split("T")[1]
            .substring(0, 8)} to ${teacherConflict.endTime
            .toISOString()
            .split("T")[1]
            .substring(0, 8)}`,
        },
        { status: 409 }
      );
    }

    // 2. Check if the class is already scheduled for a lesson at the same time
    const classConflict = await prisma.timetableEntry.findFirst({
      where: {
        classId,
        dayOfWeek,
        OR: [
          {
            // New entry starts during an existing entry
            startTime: { lte: startDateTime },
            endTime: { gt: startDateTime },
          },
          {
            // New entry ends during an existing entry
            startTime: { lt: endDateTime },
            endTime: { gte: endDateTime },
          },
          {
            // New entry completely contains an existing entry
            startTime: { gte: startDateTime },
            endTime: { lte: endDateTime },
          },
        ],
      },
      include: {
        subject: { select: { name: true } },
        teacher: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (classConflict) {
      return NextResponse.json(
        {
          error: "Class scheduling conflict",
          details: `Class already scheduled for ${
            classConflict.subject.name
          } with ${
            classConflict.teacher.user.name
          } from ${classConflict.startTime
            .toISOString()
            .split("T")[1]
            .substring(0, 8)} to ${classConflict.endTime
            .toISOString()
            .split("T")[1]
            .substring(0, 8)}`,
        },
        { status: 409 }
      );
    }

    // Create the timetable entry
    const timetableEntry = await prisma.timetableEntry.create({
      data: {
        classId,
        subjectId,
        teacherId,
        dayOfWeek,
        startTime: startDateTime,
        endTime: endDateTime,
      },
      include: {
        class: {
          select: {
            name: true,
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
        teacher: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Timetable entry created successfully",
        timetableEntry: {
          id: timetableEntry.id,
          dayOfWeek: timetableEntry.dayOfWeek,
          startTime: timetableEntry.startTime
            .toISOString()
            .split("T")[1]
            .substring(0, 8),
          endTime: timetableEntry.endTime
            .toISOString()
            .split("T")[1]
            .substring(0, 8),
          className: timetableEntry.class.name,
          subject: timetableEntry.subject.name,
          teacher: timetableEntry.teacher.user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to create timetable entry" },
      { status: 500 }
    );
  }
}
