import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { format } from "date-fns";

// GET: Fetch student dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a student
    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can access this resource" },
        { status: 403 }
      );
    }

    // Get student ID from session
    const student = await prisma.student.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        class: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const studentId = student.id;
    const classId = student.classId;

    if (!classId) {
      return NextResponse.json(
        { error: "Student is not assigned to any class" },
        { status: 404 }
      );
    }

    // Current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get end of day
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday from 0 to 7

    // Get today's timetable entries
    const todaySchedule = await prisma.timetableEntry.findMany({
      where: {
        classId: classId,
        dayOfWeek: dayOfWeek,
      },
      include: {
        subject: true,
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Get next class
    const nextClass =
      todaySchedule.length > 0
        ? {
            id: todaySchedule[0].id,
            time: `${format(todaySchedule[0].startTime, "HH:mm")} - ${format(
              todaySchedule[0].endTime,
              "HH:mm"
            )}`,
            subject: todaySchedule[0].subject.name,
            teacher: todaySchedule[0].teacher.user.name,
            room: todaySchedule[0].class.roomNumber || "N/A",
          }
        : null;

    // Get pending assignments
    const pendingAssignments = await prisma.assignment.findMany({
      where: {
        classId: classId,
        dueDate: {
          gte: today,
        },
        submissions: {
          none: {
            studentId: studentId,
          },
        },
      },
      include: {
        subject: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    // Get completed assignments
    const completedAssignments = await prisma.assignmentSubmission.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        assignment: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
      take: 5,
    });

    // Get recent grades
    const recentGrades = await prisma.grade.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        subject: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Calculate attendance rate
    const attendanceSessions = await prisma.attendanceSession.findMany({
      where: {
        classId: classId,
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
        },
      },
      include: {
        attendances: {
          where: {
            studentId: studentId,
          },
        },
      },
    });

    let totalSessions = attendanceSessions.length;
    let presentCount = attendanceSessions.reduce((acc, session) => {
      return acc + (session.attendances[0]?.status === "PRESENT" ? 1 : 0);
    }, 0);

    const attendanceRate =
      totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

    // Get upcoming events
    const upcomingEvents = await prisma.event.findMany({
      where: {
        startDate: {
          gte: today,
        },
      },
      orderBy: {
        startDate: "asc",
      },
      take: 3,
    });

    return NextResponse.json({
      stats: {
        attendance: {
          rate: attendanceRate.toFixed(1),
          totalSessions,
          presentCount,
        },
        classesToday: todaySchedule.length,
        nextClass,
        pendingAssignments: pendingAssignments.length,
        averageGrade: calculateAverageGrade(recentGrades),
      },
      schedule: todaySchedule.map((entry) => ({
        id: entry.id,
        time: `${format(entry.startTime, "HH:mm")} - ${format(
          entry.endTime,
          "HH:mm"
        )}`,
        subject: entry.subject.name,
        teacher: entry.teacher.user.name,
        room: entry.class.roomNumber || "N/A",
        status: determineClassStatus(entry.startTime, entry.endTime),
      })),
      assignments: {
        pending: pendingAssignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          subject: assignment.subject.name,
          dueDate: assignment.dueDate,
        })),
        completed: completedAssignments.map((submission) => ({
          id: submission.id,
          title: submission.assignment.title,
          subject: submission.assignment.subject.name,
          submittedAt: submission.submittedAt,
          grade: submission.grade,
        })),
      },
      grades: recentGrades.map((grade) => ({
        id: grade.id,
        name: grade.name,
        score: grade.score,
        maxScore: grade.maxScore,
        percentage: (grade.score / grade.maxScore) * 100,
        subject: grade.subject.name,
        date: grade.createdAt,
      })),
      events: upcomingEvents.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
      })),
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

function determineClassStatus(
  startTime: Date,
  endTime: Date
): "Completed" | "In Progress" | "Next" | "Upcoming" {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now > end) return "Completed";
  if (now >= start && now <= end) return "In Progress";
  if (now < start) return "Upcoming";
  return "Next";
}

function calculateAverageGrade(grades: any[]): string {
  if (grades.length === 0) return "N/A";

  const total = grades.reduce((acc, grade) => {
    return acc + (grade.score / grade.maxScore) * 100;
  }, 0);

  const average = total / grades.length;

  if (average >= 90) return "A+";
  if (average >= 85) return "A";
  if (average >= 80) return "A-";
  if (average >= 75) return "B+";
  if (average >= 70) return "B";
  if (average >= 65) return "B-";
  if (average >= 60) return "C+";
  if (average >= 55) return "C";
  if (average >= 50) return "C-";
  return "F";
}
