import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Fetch dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    console.log("getting stats");
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching dashboard stats...");

    // Calculate statistics
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      attendanceSessions,
      events,
      exams,
    ] = await Promise.all([
      // Count total students
      prisma.student.count(),

      // Count total teachers
      prisma.teacher.count(),

      // Count total classes
      prisma.class.count(),

      // Get recent attendance sessions
      prisma.attendanceSession.findMany({
        take: 30, // Last 30 days
        orderBy: { date: "desc" },
        include: {
          attendances: true,
        },
      }),

      // Get upcoming events - modified query
      prisma.event
        .findMany({
          orderBy: {
            startDate: "asc",
          },
          take: 5,
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
        })
        .then((result) => {
          console.log(`Found ${result.length} events in the database`);
          console.log("Events query result:", JSON.stringify(result, null, 2));
          return result;
        }),

      // Get active and upcoming exams
      prisma.exam.findMany({
        where: {
          status: {
            in: ["UPCOMING", "SCHEDULED", "IN_PROGRESS"],
          },
        },
        orderBy: {
          startDate: "asc",
        },
        take: 5,
      }),
    ]);

    console.log("Raw events data:", JSON.stringify(events, null, 2));

    // Calculate attendance rate
    let totalPresent = 0;
    let totalAttendances = 0;

    attendanceSessions.forEach((session) => {
      session.attendances.forEach((attendance) => {
        totalAttendances++;
        if (attendance.status === "PRESENT") {
          totalPresent++;
        }
      });
    });

    const attendanceRate =
      totalAttendances > 0 ? (totalPresent / totalAttendances) * 100 : 0;

    // Format events for the response with proper category mapping
    const formattedEvents = events.map((event) => {
      // Map database event categories to frontend expected values
      let category: "IMPORTANT" | "REGULAR" = "REGULAR";

      // Consider certain event categories as important
      if (
        event.category === "ACADEMIC" ||
        event.category === "EXAM" ||
        event.category === "HOLIDAY"
      ) {
        category = "IMPORTANT";
      }

      // Check if admin and user data exists
      const organizerName = event.admin?.user?.name || "School Admin";

      return {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location || "School",
        category: category, // Using our mapped category
        organizer: organizerName,
      };
    });

    // Get previous month's data for comparison
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [
      previousMonthStudents,
      previousMonthTeachers,
      previousMonthClasses,
      previousMonthAttendance,
    ] = await Promise.all([
      prisma.student.count({
        where: {
          createdAt: {
            lt: new Date(),
          },
        },
      }),
      prisma.teacher.count({
        where: {
          createdAt: {
            lt: new Date(),
          },
        },
      }),
      prisma.class.count({
        where: {
          createdAt: {
            lt: new Date(),
          },
        },
      }),
      // Get previous month's attendance
      prisma.attendanceSession.findMany({
        where: {
          date: {
            gte: new Date(
              previousMonth.getFullYear(),
              previousMonth.getMonth(),
              1
            ),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        include: {
          attendances: true,
        },
      }),
    ]);

    // Calculate previous month's attendance rate
    let prevMonthPresent = 0;
    let prevMonthTotal = 0;

    previousMonthAttendance.forEach((session) => {
      session.attendances.forEach((attendance) => {
        prevMonthTotal++;
        if (attendance.status === "PRESENT") {
          prevMonthPresent++;
        }
      });
    });

    const prevAttendanceRate =
      prevMonthTotal > 0 ? (prevMonthPresent / prevMonthTotal) * 100 : 0;

    // Calculate change from previous month
    const studentChange = totalStudents - previousMonthStudents;
    const teacherChange = totalTeachers - previousMonthTeachers;
    const classChange = totalClasses - previousMonthClasses;
    const attendanceChange = attendanceRate - prevAttendanceRate;

    // Format exams for the response
    const formattedExams = exams.map((exam) => ({
      id: exam.id,
      title: exam.name,
      date: exam.startDate,
    }));

    return NextResponse.json({
      stats: {
        students: {
          total: totalStudents,
          change: studentChange,
        },
        teachers: {
          total: totalTeachers,
          change: teacherChange,
        },
        classes: {
          total: totalClasses,
          change: classChange,
        },
        attendance: {
          rate: attendanceRate.toFixed(1),
          change: attendanceChange.toFixed(1),
        },
      },
      events: formattedEvents,
      exams: formattedExams,
    });
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
