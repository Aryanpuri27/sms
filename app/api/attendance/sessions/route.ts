import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Fetch attendance sessions with filtering and pagination
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build the query
    const where: any = {};

    if (classId) {
      where.classId = classId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      };
    }

    // Count total records for pagination
    const totalSessions = await prisma.attendanceSession.count({ where });

    // Fetch attendance sessions with related data
    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: {
        class: {
          select: {
            name: true,
          },
        },
        attendances: {
          include: {
            student: {
              select: {
                id: true,
                rollNumber: true,
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
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format the attendance sessions for the response
    const formattedSessions = sessions.map((session) => {
      // Count statuses
      const statusCounts = {
        PRESENT: 0,
        ABSENT: 0,
        LATE: 0,
      };

      session.attendances.forEach((attendance) => {
        statusCounts[attendance.status] += 1;
      });

      return {
        id: session.id,
        date: session.date,
        className: session.class.name,
        classId: session.classId,
        totalStudents: session.attendances.length,
        presentCount: statusCounts.PRESENT,
        absentCount: statusCounts.ABSENT,
        lateCount: statusCounts.LATE,
        createdAt: session.createdAt,
      };
    });

    return NextResponse.json({
      sessions: formattedSessions,
      meta: {
        total: totalSessions,
        page,
        limit,
        totalPages: Math.ceil(totalSessions / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance sessions" },
      { status: 500 }
    );
  }
}

// POST: Create a new attendance session
export async function POST(request: NextRequest) {
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

    // Get request data
    const data = await request.json();
    const { classId, date, attendances } = data;

    // Validate required fields
    if (!classId || !date || !attendances || !Array.isArray(attendances)) {
      return NextResponse.json(
        { error: "Class ID, date, and attendances are required" },
        { status: 400 }
      );
    }

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check for teacher permission if it's a teacher
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
      const isAssigned = await prisma.class.findFirst({
        where: {
          id: classId,
          teacherId: teacher.id,
        },
      });

      if (!isAssigned) {
        return NextResponse.json(
          {
            error: "You are not authorized to manage attendance for this class",
          },
          { status: 403 }
        );
      }
    }

    // Begin transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create attendance session
      const attendanceSession = await tx.attendanceSession.create({
        data: {
          date: new Date(date),
          classId,
        },
      });

      // Get the teacher ID (needed for attendance records)
      let teacherId;
      if (session.user?.role === "TEACHER") {
        const teacher = await tx.teacher.findFirst({
          where: { userId: session.user.id },
          select: { id: true },
        });
        teacherId = teacher?.id;
      } else {
        // If admin, use the class teacher
        const classTeacher = await tx.class.findUnique({
          where: { id: classId },
          select: { teacherId: true },
        });
        teacherId = classTeacher?.teacherId;
      }

      if (!teacherId) {
        throw new Error("Teacher not found for this class");
      }

      // Create attendance records
      const attendanceRecords = [];

      for (const item of attendances) {
        if (!item.studentId || !item.status) {
          continue; // Skip invalid records
        }

        // Validate status
        if (!["PRESENT", "ABSENT", "LATE"].includes(item.status)) {
          continue; // Skip invalid status
        }

        // Check if student exists and belongs to this class
        const student = await tx.student.findFirst({
          where: {
            id: item.studentId,
            classId,
          },
        });

        if (!student) {
          continue; // Skip if student not found or not in this class
        }

        // Create attendance record
        const attendanceRecord = await tx.attendance.create({
          data: {
            sessionId: attendanceSession.id,
            studentId: item.studentId,
            teacherId,
            status: item.status,
            remarks: item.remarks || null,
          },
        });

        attendanceRecords.push(attendanceRecord);
      }

      return {
        session: attendanceSession,
        records: attendanceRecords,
      };
    });

    return NextResponse.json(
      {
        message: "Attendance session created successfully",
        sessionId: result.session.id,
        recordsCount: result.records.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating attendance session:", error);
    return NextResponse.json(
      { error: "Failed to create attendance session" },
      { status: 500 }
    );
  }
}
