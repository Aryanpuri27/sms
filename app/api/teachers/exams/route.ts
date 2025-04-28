import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Get all exams for a teacher
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
    const subjectId = searchParams.get("subjectId");
    const status = searchParams.get("status");

    // Build where clause
    const where: any = {
      teacherId: teacher.id,
    };

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (status) {
      where.status = status;
    }

    if (classId) {
      where.classes = {
        some: {
          id: classId,
        },
      };
    }

    // Get exams
    const exams = await prisma.exam.findMany({
      where,
      include: {
        subject: true,
        classes: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            grades: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Get all classes for the teacher
    const classes = await prisma.class.findMany({
      where: {
        teacherId: teacher.id,
      },
      select: {
        id: true,
        name: true,
        section: true,
      },
    });

    // Get all subjects taught by the teacher
    const subjects = await prisma.subject.findMany({
      where: {
        classes: {
          some: {
            teacherId: teacher.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    // Format the response
    const formattedExams = exams.map((exam) => ({
      id: exam.id,
      name: exam.name,
      description: exam.description,
      date: exam.date.toISOString(),
      startTime: exam.startTime ? exam.startTime.toISOString() : null,
      endTime: exam.endTime ? exam.endTime.toISOString() : null,
      duration: exam.duration,
      maxScore: exam.maxScore,
      status: exam.status,
      subject: exam.subject.name,
      subjectId: exam.subject.id,
      classes: exam.classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
      })),
      gradesCount: exam._count.grades,
      createdAt: exam.createdAt.toISOString(),
    }));

    return NextResponse.json({
      exams: formattedExams,
      classes,
      subjects,
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

// POST: Create a new exam
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
    const {
      name,
      description,
      date,
      startTime,
      endTime,
      duration,
      maxScore,
      subjectId,
      classIds,
    } = body;

    // Validate required fields
    if (
      !name ||
      !date ||
      !maxScore ||
      !subjectId ||
      !classIds ||
      classIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the subject is valid
    const subjectExists = await prisma.subject.findUnique({
      where: {
        id: subjectId,
      },
    });

    if (!subjectExists) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Verify all classes belong to the teacher
    const teacherClasses = await prisma.class.findMany({
      where: {
        teacherId: teacher.id,
      },
      select: {
        id: true,
      },
    });

    const teacherClassIds = teacherClasses.map((cls) => cls.id);
    const invalidClassIds = classIds.filter(
      (id: string) => !teacherClassIds.includes(id)
    );

    if (invalidClassIds.length > 0) {
      return NextResponse.json(
        { error: "Some classes do not belong to you" },
        { status: 403 }
      );
    }

    // Create the exam
    const exam = await prisma.exam.create({
      data: {
        name,
        description,
        date: new Date(date),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        duration,
        maxScore,
        status: "UPCOMING", // Default status
        teacherId: teacher.id,
        subjectId,
        classes: {
          connect: classIds.map((id: string) => ({ id })),
        },
      },
      include: {
        subject: true,
        classes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Format the response
    const formattedExam = {
      id: exam.id,
      name: exam.name,
      description: exam.description,
      date: exam.date.toISOString(),
      startTime: exam.startTime ? exam.startTime.toISOString() : null,
      endTime: exam.endTime ? exam.endTime.toISOString() : null,
      duration: exam.duration,
      maxScore: exam.maxScore,
      status: exam.status,
      subject: exam.subject.name,
      subjectId: exam.subject.id,
      classes: exam.classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
      })),
      gradesCount: 0,
      createdAt: exam.createdAt.toISOString(),
    };

    return NextResponse.json({
      exam: formattedExam,
      message: "Exam created successfully",
    });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}
