import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Fetch teacher dashboard statistics
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

    const teacherId = teacher.id;

    // Current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get end of day
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday from 0 to 7

    // Get all associated classes
    const teacherClasses = await prisma.class.findMany({
      where: {
        teacherId: teacherId,
      },
      include: {
        students: true,
      },
    });

    // Calculate total student count
    const totalStudents = teacherClasses.reduce(
      (acc, curr) => acc + curr.students.length,
      0
    );

    // Get today's timetable entries
    const todaySchedule = await prisma.timetableEntry.findMany({
      where: {
        teacherId: teacherId,
        dayOfWeek: dayOfWeek,
      },
      include: {
        class: true,
        subject: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Format next class data
    const nextClass =
      todaySchedule.length > 0
        ? {
            id: todaySchedule[0].id,
            time: `${formatTime(todaySchedule[0].startTime)} - ${formatTime(
              todaySchedule[0].endTime
            )}`,
            class: todaySchedule[0].class.name,
            subject: todaySchedule[0].subject.name,
            room: todaySchedule[0].class.roomNumber || "N/A",
          }
        : null;

    // Get pending assignments to review
    const pendingAssignments = await prisma.assignmentSubmission.count({
      where: {
        assignment: {
          teacherId: teacherId,
        },
        status: "SUBMITTED",
      },
    });

    // Get total assignments created by the teacher
    const totalAssignments = await prisma.assignment.count({
      where: {
        teacherId: teacherId,
      },
    });

    // Calculate attendance rate for the teacher's classes
    const recentAttendanceSessions = await prisma.attendanceSession.findMany({
      where: {
        class: {
          teacherId: teacherId,
        },
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 14)), // Last 14 days
        },
      },
      include: {
        attendances: true,
      },
    });

    let totalAttendances = 0;
    let totalPresent = 0;

    recentAttendanceSessions.forEach((session) => {
      session.attendances.forEach((attendance) => {
        totalAttendances++;
        if (attendance.status === "PRESENT") {
          totalPresent++;
        }
      });
    });

    const attendanceRate =
      totalAttendances > 0 ? (totalPresent / totalAttendances) * 100 : 0;

    // Get recent activities
    const recentActivities = await prisma.$transaction([
      // Recent attendances marked
      prisma.attendance.findMany({
        where: {
          teacherId: teacherId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
              class: true,
            },
          },
          session: true,
        },
      }),
      // Recent grades added
      prisma.grade.findMany({
        where: {
          teacherId: teacherId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
              class: true,
            },
          },
          subject: true,
        },
      }),
      // Recent assignments created
      prisma.assignment.findMany({
        where: {
          teacherId: teacherId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          class: true,
          subject: true,
        },
      }),
    ]);

    // Format activities
    const formattedActivities = [
      ...recentActivities[0].map((attendance) => ({
        type: "attendance",
        action: "Marked attendance",
        target: `${attendance.student.user.name} (Class ${
          attendance.student.class?.name || "Unknown"
        })`,
        date: attendance.createdAt,
        status: attendance.status,
      })),
      ...recentActivities[1].map((grade) => ({
        type: "grade",
        action: "Graded assignment",
        target: `${grade.student.user.name} - ${grade.name} (${grade.subject.name})`,
        date: grade.createdAt,
        score: `${grade.score}/${grade.maxScore}`,
      })),
      ...recentActivities[2].map((assignment) => ({
        type: "assignment",
        action: "Created assignment",
        target: `${assignment.title} for Class ${assignment.class.name}`,
        date: assignment.createdAt,
        dueDate: assignment.dueDate,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return NextResponse.json({
      stats: {
        students: totalStudents,
        classesToday: todaySchedule.length,
        nextClass: nextClass,
        assignments: {
          total: totalAssignments,
          pendingReview: pendingAssignments,
        },
        attendanceRate: attendanceRate.toFixed(1),
      },
      schedule: todaySchedule.map((entry) => ({
        id: entry.id,
        time: `${formatTime(entry.startTime)} - ${formatTime(entry.endTime)}`,
        class: entry.class.name,
        subject: entry.subject.name,
        room: entry.class.roomNumber || "N/A",
        status: determineClassStatus(entry.startTime, entry.endTime),
      })),
      classes: teacherClasses.map((cls) => ({
        id: cls.id,
        name: cls.name,
        roomNumber: cls.roomNumber || "N/A",
        students: cls.students.length,
      })),
      recentActivities: formattedActivities.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching teacher dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

// Helper function to format time
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper function to determine class status
function determineClassStatus(
  startTime: Date,
  endTime: Date
): "Completed" | "In Progress" | "Next" | "Upcoming" {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const startHour = startTime.getHours();
  const startMinute = startTime.getMinutes();

  const endHour = endTime.getHours();
  const endMinute = endTime.getMinutes();

  // Convert to total minutes for easier comparison
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  if (currentTotalMinutes > endTotalMinutes) {
    return "Completed";
  } else if (
    currentTotalMinutes >= startTotalMinutes &&
    currentTotalMinutes <= endTotalMinutes
  ) {
    return "In Progress";
  } else if (
    startTotalMinutes - currentTotalMinutes <= 60 &&
    startTotalMinutes > currentTotalMinutes
  ) {
    return "Next";
  } else {
    return "Upcoming";
  }
}
