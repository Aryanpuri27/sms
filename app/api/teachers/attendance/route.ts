import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Get attendance for a class on a specific date
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a teacher
    if (session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can access this resource" },
        { status: 403 }
      );
    }

    // Get teacher ID from session
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");

    // Get all classes taught by the teacher
    const teacherClasses = await prisma.class.findMany({
      where: {
        teacherId: teacher.id,
      },
      select: {
        id: true,
        name: true,
        section: true,
        roomNumber: true,
      },
    });

    // If no classId is provided, just return the list of classes
    if (!classId) {
      return NextResponse.json({
        classes: teacherClasses,
      });
    }

    // Get the class and ensure it belongs to the teacher
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: teacher.id,
      },
      include: {
        students: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found or you don't have access to this class" },
        { status: 404 }
      );
    }

    // Find or create attendance session for the date
    let attendanceSession: {
      id: string;
      date: Date;
      classId: string;
      attendances: Array<{
        id: string;
        studentId: string;
        status: "PRESENT" | "ABSENT" | "LATE";
        sessionId: string;
        teacherId: string;
        createdAt: Date;
        updatedAt: Date;
      }>;
    } | null = null;

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      // Check if an attendance session already exists for this date and class
      attendanceSession = await prisma.attendanceSession.findFirst({
        where: {
          classId: classId,
          date: {
            gte: targetDate,
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        include: {
          attendances: true,
        },
      });
    }

    // Format the response
    return NextResponse.json({
      class: {
        id: classData.id,
        name: classData.name,
        section: classData.section,
        roomNumber: classData.roomNumber,
      },
      students: classData.students.map((student) => ({
        id: student.id,
        userId: student.userId,
        rollNumber: student.rollNumber,
        name: student.user.name,
        email: student.user.email,
        image: student.user.image,
        attendance: attendanceSession
          ? attendanceSession.attendances.find(
              (a) => a.studentId === student.id
            ) || null
          : null,
      })),
      session: attendanceSession || null,
      classes: teacherClasses,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}

// POST: Mark or update attendance
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a teacher
    if (session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can access this resource" },
        { status: 403 }
      );
    }

    // Get teacher ID from session
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { classId, date, attendanceData } = body;

    if (!classId || !date || !attendanceData) {
      return NextResponse.json(
        { error: "Class ID, date, and attendance data are required" },
        { status: 400 }
      );
    }

    // Verify the class belongs to the teacher
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: teacher.id,
      },
    });

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found or you don't have access to this class" },
        { status: 404 }
      );
    }

    // Parse the date
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Find or create attendance session
    let attendanceSession = await prisma.attendanceSession.findFirst({
      where: {
        classId: classId,
        date: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!attendanceSession) {
      attendanceSession = await prisma.attendanceSession.create({
        data: {
          classId: classId,
          date: targetDate,
        },
      });
    }

    // Process attendance data
    const updatePromises = Object.entries(attendanceData).map(
      async ([studentId, data]) => {
        const { status } = data as { status: "PRESENT" | "ABSENT" | "LATE" };

        // Check if an attendance record already exists
        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            sessionId: attendanceSession!.id,
            studentId: studentId,
          },
        });

        if (existingAttendance) {
          // Update existing record
          return prisma.attendance.update({
            where: {
              id: existingAttendance.id,
            },
            data: {
              status: status,
              teacherId: teacher.id,
            },
          });
        } else {
          // Create new record
          return prisma.attendance.create({
            data: {
              sessionId: attendanceSession!.id,
              studentId: studentId,
              teacherId: teacher.id,
              status: status,
            },
          });
        }
      }
    );

    // Execute all updates
    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Attendance saved successfully",
      sessionId: attendanceSession.id,
    });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: "Failed to save attendance data" },
      { status: 500 }
    );
  }
}
