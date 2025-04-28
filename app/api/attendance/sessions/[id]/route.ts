import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET: Fetch attendance records for a specific session
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = params.id;

    // Check if attendance session exists
    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
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
        },
      },
    });

    if (!attendanceSession) {
      return NextResponse.json(
        { error: "Attendance session not found" },
        { status: 404 }
      );
    }

    // Fetch attendance records for this session
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        sessionId,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          rollNumber: "asc",
        },
      },
    });

    // Format the response
    const formattedSession = {
      id: attendanceSession.id,
      date: attendanceSession.date,
      class: {
        id: attendanceSession.class.id,
        name: attendanceSession.class.name,
      },
      teacher: {
        id: attendanceSession.class.teacher.id,
        name: attendanceSession.class.teacher.user.name,
      },
      createdAt: attendanceSession.createdAt,
    };

    const formattedRecords = attendanceRecords.map((record) => ({
      id: record.id,
      status: record.status,
      remarks: record.remarks,
      student: {
        id: record.student.id,
        rollNumber: record.student.rollNumber,
        name: record.student.user.name,
        image: record.student.user.image,
      },
    }));

    return NextResponse.json({
      session: formattedSession,
      records: formattedRecords,
      count: formattedRecords.length,
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}

// PATCH: Update attendance records for a specific session
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user?.role !== "ADMIN" && session.user?.role !== "TEACHER")
    ) {
      return NextResponse.json(
        { error: "Unauthorized: Admin or Teacher access required" },
        { status: 401 }
      );
    }

    const sessionId = params.id;

    // Check if session exists
    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        class: true,
      },
    });

    if (!attendanceSession) {
      return NextResponse.json(
        { error: "Attendance session not found" },
        { status: 404 }
      );
    }

    // Check teacher permission if it's a teacher
    if (session.user?.role === "TEACHER") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId: session.user.id },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher profile not found" },
          { status: 404 }
        );
      }

      // Check if teacher is assigned to this class
      if (attendanceSession.class.teacherId !== teacher.id) {
        return NextResponse.json(
          {
            error: "You are not authorized to update attendance for this class",
          },
          { status: 403 }
        );
      }
    }

    // Get request data
    const data = await request.json();
    const { records } = data;

    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "Attendance records are required" },
        { status: 400 }
      );
    }

    // Begin transaction to update records
    const result = await prisma.$transaction(async (tx) => {
      const updatedRecords = [];

      for (const record of records) {
        if (!record.id || !record.status) {
          continue;
        }

        // Validate status
        if (!["PRESENT", "ABSENT", "LATE"].includes(record.status)) {
          continue;
        }

        // Check if record exists and belongs to this session
        const attendanceRecord = await tx.attendance.findFirst({
          where: {
            id: record.id,
            sessionId,
          },
        });

        if (!attendanceRecord) {
          continue;
        }

        // Update the record
        const updatedRecord = await tx.attendance.update({
          where: { id: record.id },
          data: {
            status: record.status,
            remarks: record.remarks || null,
          },
        });

        updatedRecords.push(updatedRecord);
      }

      return updatedRecords;
    });

    return NextResponse.json({
      message: "Attendance records updated successfully",
      updatedCount: result.length,
    });
  } catch (error) {
    console.error("Error updating attendance records:", error);
    return NextResponse.json(
      { error: "Failed to update attendance records" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an attendance session and its records
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

    const sessionId = params.id;

    // Check if session exists
    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
    });

    if (!attendanceSession) {
      return NextResponse.json(
        { error: "Attendance session not found" },
        { status: 404 }
      );
    }

    // Begin transaction to delete session and related records
    await prisma.$transaction(async (tx) => {
      // Delete all attendance records for this session
      await tx.attendance.deleteMany({
        where: { sessionId },
      });

      // Delete the session
      await tx.attendanceSession.delete({
        where: { id: sessionId },
      });
    });

    return NextResponse.json({
      message: "Attendance session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attendance session:", error);
    return NextResponse.json(
      { error: "Failed to delete attendance session" },
      { status: 500 }
    );
  }
}
