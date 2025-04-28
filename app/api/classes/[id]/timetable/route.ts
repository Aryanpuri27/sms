import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET: Fetch all timetable entries for a specific class
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before destructuring
    const parma = await params;
    const classId = parma.id;

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true },
    });

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Fetch timetable entries for the class
    const timetableEntries = await prisma.timetableEntry.findMany({
      where: { classId },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacher: {
          select: {
            id: true,
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
      subject: {
        id: entry.subject.id,
        name: entry.subject.name,
        code: entry.subject.code,
      },
      teacher: {
        id: entry.teacher.id,
        name: entry.teacher.user.name,
      },
    }));

    return NextResponse.json({
      class: {
        id: classExists.id,
        name: classExists.name,
      },
      timetableEntries: formattedEntries,
      count: formattedEntries.length,
    });
  } catch (error) {
    console.error("Error fetching class timetable:", error);
    return NextResponse.json(
      { error: "Failed to fetch class timetable" },
      { status: 500 }
    );
  }
}

// POST: Add a new timetable entry for a specific class
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Await params before destructuring
    const parma = await params;
    const classId = parma.id;
    const data = await request.json();
    const { subjectId, teacherId, dayOfWeek, startTime, endTime } = data;

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Validate required fields
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

    // Get the time portions only for comparison
    const startTimeOnly = startTime.substring(0, 5); // "HH:MM"
    const endTimeOnly = endTime.substring(0, 5); // "HH:MM"

    // Check for scheduling conflicts
    // 1. Check if the teacher is already scheduled for another class at the same time
    const teacherConflict = await prisma.timetableEntry.findFirst({
      where: {
        teacherId,
        dayOfWeek,
      },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });

    // Manual check for time conflicts instead of using Prisma's Date comparisons
    if (teacherConflict) {
      const conflictStartTime = teacherConflict.startTime
        .toTimeString()
        .substring(0, 5); // "HH:MM"
      const conflictEndTime = teacherConflict.endTime
        .toTimeString()
        .substring(0, 5); // "HH:MM"

      // Check if there's an overlap
      const hasOverlap =
        (startTimeOnly >= conflictStartTime &&
          startTimeOnly < conflictEndTime) || // New start time during existing slot
        (endTimeOnly > conflictStartTime && endTimeOnly <= conflictEndTime) || // New end time during existing slot
        (startTimeOnly <= conflictStartTime && endTimeOnly >= conflictEndTime); // New slot fully contains existing slot

      if (hasOverlap) {
        return NextResponse.json(
          {
            error: "Teacher scheduling conflict",
            details: `Teacher already assigned to Class ${teacherConflict.class.name} for ${teacherConflict.subject.name} from ${conflictStartTime} to ${conflictEndTime}`,
          },
          { status: 409 }
        );
      }
    }

    // 2. Check if the class is already scheduled for a lesson at the same time
    const classConflict = await prisma.timetableEntry.findFirst({
      where: {
        classId,
        dayOfWeek,
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

    // Manual check for time conflicts
    if (classConflict) {
      const conflictStartTime = classConflict.startTime
        .toTimeString()
        .substring(0, 5); // "HH:MM"
      const conflictEndTime = classConflict.endTime
        .toTimeString()
        .substring(0, 5); // "HH:MM"

      // Check if there's an overlap
      const hasOverlap =
        (startTimeOnly >= conflictStartTime &&
          startTimeOnly < conflictEndTime) || // New start time during existing slot
        (endTimeOnly > conflictStartTime && endTimeOnly <= conflictEndTime) || // New end time during existing slot
        (startTimeOnly <= conflictStartTime && endTimeOnly >= conflictEndTime); // New slot fully contains existing slot

      if (hasOverlap) {
        return NextResponse.json(
          {
            error: "Class scheduling conflict",
            details: `Class already scheduled for ${classConflict.subject.name} with ${classConflict.teacher.user.name} from ${conflictStartTime} to ${conflictEndTime}`,
          },
          { status: 409 }
        );
      }
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
    });

    // Format the response
    const formattedEntry = {
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
      class: {
        id: timetableEntry.classId,
        name: timetableEntry.class.name,
      },
      subject: {
        id: timetableEntry.subjectId,
        name: timetableEntry.subject.name,
        code: timetableEntry.subject.code,
      },
      teacher: {
        id: timetableEntry.teacherId,
        name: timetableEntry.teacher.user.name,
      },
    };

    return NextResponse.json(
      {
        message: "Timetable entry created successfully",
        timetableEntry: formattedEntry,
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
