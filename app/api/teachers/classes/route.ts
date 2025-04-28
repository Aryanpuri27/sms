import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Get all classes assigned to a teacher
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

    // Get classes with student count
    const classes = await prisma.class.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
        timetableEntries: {
          include: {
            subject: true,
          },
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

    // Format the response
    const formattedClasses = classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      section: cls.section,
      academicYear: cls.academicYear,
      roomNumber: cls.roomNumber,
      studentCount: cls._count.students,
      subjects: cls.subjects.map((subjectMapping) => ({
        id: subjectMapping.subject.id,
        name: subjectMapping.subject.name,
        code: subjectMapping.subject.code,
      })),
      timetable: cls.timetableEntries.map((entry) => ({
        id: entry.id,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        subject: entry.subject.name,
      })),
    }));

    return NextResponse.json({
      classes: formattedClasses,
    });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch class data" },
      { status: 500 }
    );
  }
}
