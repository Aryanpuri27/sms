import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Get details for a specific class
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the user is a teacher
    const teacher = await prisma.teacher.findFirst({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Only teachers can access this endpoint" },
        { status: 403 }
      );
    }

    // Get class by ID and ensure the teacher has access to it
    const classId = params.id;

    const classData = await prisma.class.findUnique({
      where: {
        id: classId,
        teacherId: teacher.id,
      },
      include: {
        students: true,
        subjects: true,
        assignments: true,
        timetableEntries: true,
        attendanceSessions: true,
        classExams: true,
        examSchedules: true,
      },
    });

    // Verify the class exists and teacher has access
    if (!classData) {
      return NextResponse.json(
        { error: "Class not found or you don't have access" },
        { status: 404 }
      );
    }

    // Get the class details with all necessary information
    const classDetails = {
      id: classData.id,
      name: classData.name,
      section: classData.section,
      academicYear: classData.academicYear,
      roomNumber: classData.roomNumber,
      students: classData.students,
      subjects: classData.subjects,
      assignments: classData.assignments,
      timetableEntries: classData.timetableEntries,
      attendanceSessions: classData.attendanceSessions,
      classExams: classData.classExams,
      examSchedules: classData.examSchedules,
    };

    // Get recent grades for students in the class
    const gradesPromises = classData.students.map(async (student) => {
      const recentGrades = await prisma.grade.findMany({
        where: {
          studentId: student.id,
          subject: {
            classes: {
              some: {
                id: classId,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          score: true,
          maxScore: true,
          remarks: true,
          examDate: true,
          subject: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          examDate: "desc",
        },
        take: 5,
      });

      return {
        studentId: student.id,
        grades: recentGrades.map((grade) => ({
          id: grade.id,
          name: grade.name,
          score: grade.score,
          maxScore: grade.maxScore,
          percentage: (grade.score / grade.maxScore) * 100,
          remarks: grade.remarks,
          examDate: grade.examDate,
          subject: grade.subject.name,
        })),
      };
    });

    // Get recent attendances for students in the class
    const attendancePromises = classData.students.map(async (student) => {
      const recentAttendance = await prisma.attendance.findMany({
        where: {
          studentId: student.id,
          session: {
            classId: classId,
          },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          session: {
            select: {
              date: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      return {
        studentId: student.id,
        attendances: recentAttendance.map((attendance) => ({
          id: attendance.id,
          status: attendance.status,
          date: attendance.session.date,
        })),
      };
    });

    // Get subjects for the class
    const subjects = classData.subjects;

    // Get timetable for the class
    const timetable = classData.timetableEntries;

    // Get assignments for the class
    const assignments = classData.assignments;

    // Get attendance sessions for the class
    const attendanceSessions = classData.attendanceSessions;

    // Get attendance statistics for the class
    const attendanceStats = await prisma.$queryRaw<
      {
        totalAttendances: number;
        totalPresent: number;
        totalAbsent: number;
        totalLate: number;
      }[]
    >`
      SELECT 
        COUNT(*) as "totalAttendances",
        SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as "totalPresent",
        SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as "totalAbsent",
        SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as "totalLate"
      FROM "Attendance"
      WHERE "classId" = ${classId}
    `;

    // Resolve all promises
    const [studentsWithGrades, studentsWithAttendance] = await Promise.all([
      Promise.all(gradesPromises),
      Promise.all(attendancePromises),
    ]);

    // Merge student data
    const studentsComplete = studentsWithGrades.map((studentWithGrades) => {
      const studentWithAttendance = studentsWithAttendance.find(
        (s) => s.studentId === studentWithGrades.studentId
      );
      return {
        ...studentWithGrades,
        attendances: studentWithAttendance?.attendances || [],
      };
    });

    // Calculate percentages for attendance stats
    const stats = attendanceStats[0];
    const totalAttendances = Number(stats.totalAttendances) || 0;
    const presentPercentage =
      totalAttendances > 0
        ? (Number(stats.totalPresent) / totalAttendances) * 100
        : 0;
    const absentPercentage =
      totalAttendances > 0
        ? (Number(stats.totalAbsent) / totalAttendances) * 100
        : 0;
    const latePercentage =
      totalAttendances > 0
        ? (Number(stats.totalLate) / totalAttendances) * 100
        : 0;

    // Format timetable entries
    const formattedTimetable = classData.timetableEntries.map((entry) => ({
      id: entry.id,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subjectId: entry.subjectId,
    }));

    // Format assignments
    const formattedAssignments = classData.assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      status: assignment.status,
      subjectId: assignment.subjectId,
    }));

    // Format attendance sessions
    const formattedAttendanceSessions = classData.attendanceSessions.map(
      (session) => ({
        id: session.id,
        date: session.date,
      })
    );

    // Format exam schedules
    const formattedExamSchedules = classData.examSchedules.map((schedule) => ({
      id: schedule.id,
      examId: schedule.examId,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    }));

    // Combine all the data
    const response = {
      ...classDetails,
      timetable: formattedTimetable,
      assignments: formattedAssignments,
      attendanceSessions: formattedAttendanceSessions,
      examSchedules: formattedExamSchedules,
      students: studentsComplete,
      subjects: subjects,
      statistics: {
        attendance: {
          totalAttendances,
          totalPresent: Number(stats.totalPresent) || 0,
          totalAbsent: Number(stats.totalAbsent) || 0,
          totalLate: Number(stats.totalLate) || 0,
          presentPercentage,
          absentPercentage,
          latePercentage,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching class details:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching class details" },
      { status: 500 }
    );
  }
}
