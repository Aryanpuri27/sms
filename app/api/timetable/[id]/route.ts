import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET: Fetch a specific timetable entry by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before destructuring
    const id = params.id;

    // Fetch the timetable entry
    const timetableEntry = await prisma.timetableEntry.findUnique({
      where: { id },
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

    if (!timetableEntry) {
      return NextResponse.json(
        { error: "Timetable entry not found" },
        { status: 404 }
      );
    }

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
      className: timetableEntry.class.name,
      classId: timetableEntry.classId,
      subject: timetableEntry.subject.name,
      subjectCode: timetableEntry.subject.code,
      subjectId: timetableEntry.subjectId,
      teacherName: timetableEntry.teacher.user.name,
      teacherId: timetableEntry.teacherId,
    };

    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error("Error fetching timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable entry" },
      { status: 500 }
    );
  }
}

// PATCH: Update a specific timetable entry
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const id = params.id;
    const data = await request.json();
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime } =
      data;

    // Check if the timetable entry exists
    const existingEntry = await prisma.timetableEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Timetable entry not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (classId !== undefined) {
      updateData.classId = classId;
    }

    if (subjectId !== undefined) {
      updateData.subjectId = subjectId;
    }

    if (teacherId !== undefined) {
      updateData.teacherId = teacherId;
    }

    if (dayOfWeek !== undefined) {
      if (dayOfWeek < 0 || dayOfWeek > 6) {
        return NextResponse.json(
          { error: "Valid day of week is required (0-6)" },
          { status: 400 }
        );
      }
      updateData.dayOfWeek = dayOfWeek;
    }

    let startDateTime = existingEntry.startTime;
    let endDateTime = existingEntry.endTime;

    if (startTime !== undefined) {
      try {
        startDateTime = new Date(`2000-01-01T${startTime}`);
        if (isNaN(startDateTime.getTime())) {
          throw new Error("Invalid time format");
        }
        updateData.startTime = startDateTime;
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid start time format. Use HH:MM:SS." },
          { status: 400 }
        );
      }
    }

    if (endTime !== undefined) {
      try {
        endDateTime = new Date(`2000-01-01T${endTime}`);
        if (isNaN(endDateTime.getTime())) {
          throw new Error("Invalid time format");
        }
        updateData.endTime = endDateTime;
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid end time format. Use HH:MM:SS." },
          { status: 400 }
        );
      }
    }

    // Ensure end time is after start time
    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts (excluding the current entry)
    const finalClassId = classId || existingEntry.classId;
    const finalTeacherId = teacherId || existingEntry.teacherId;
    const finalDayOfWeek =
      dayOfWeek !== undefined ? dayOfWeek : existingEntry.dayOfWeek;

    // Get the time portions only for comparison
    const startTimeOnly = startDateTime.toTimeString().substring(0, 5); // "HH:MM"
    const endTimeOnly = endDateTime.toTimeString().substring(0, 5); // "HH:MM"

    // 1. Check if the teacher is already scheduled for another class at the same time
    const teacherConflict = await prisma.timetableEntry.findFirst({
      where: {
        id: { not: id }, // Exclude current entry
        teacherId: finalTeacherId,
        dayOfWeek: finalDayOfWeek,
      },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });

    // Manual check for time conflicts
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
        id: { not: id }, // Exclude current entry
        classId: finalClassId,
        dayOfWeek: finalDayOfWeek,
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

    // Update the timetable entry
    const updatedEntry = await prisma.timetableEntry.update({
      where: { id },
      data: updateData,
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

    // Format the response
    const formattedEntry = {
      id: updatedEntry.id,
      dayOfWeek: updatedEntry.dayOfWeek,
      startTime: updatedEntry.startTime
        .toISOString()
        .split("T")[1]
        .substring(0, 8),
      endTime: updatedEntry.endTime.toISOString().split("T")[1].substring(0, 8),
      className: updatedEntry.class.name,
      classId: updatedEntry.classId,
      subject: updatedEntry.subject.name,
      subjectId: updatedEntry.subjectId,
      teacherName: updatedEntry.teacher.user.name,
      teacherId: updatedEntry.teacherId,
    };

    return NextResponse.json({
      message: "Timetable entry updated successfully",
      timetableEntry: formattedEntry,
    });
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to update timetable entry" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific timetable entry
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const id = params.id;

    // Check if the timetable entry exists
    const existingEntry = await prisma.timetableEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Timetable entry not found" },
        { status: 404 }
      );
    }

    // Delete the timetable entry
    await prisma.timetableEntry.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Timetable entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to delete timetable entry" },
      { status: 500 }
    );
  }
}
