import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET: Get grades for a teacher
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can access this resource" },
        { status: 403 }
      );
    }

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

    // Check if we need to return subjects or classes
    const url = new URL(request.url);
    const subjects = url.searchParams.get("subjects");
    const classes = url.searchParams.get("classes");

    if (subjects === "true") {
      const teacherSubjects = await prisma.subject.findMany({
        where: {
          classes: {
            some: {
              class: {
                teacherId: teacher.id,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      return NextResponse.json({ subjects: teacherSubjects });
    }

    if (classes === "true") {
      const teacherClasses = await prisma.class.findMany({
        where: {
          teacherId: teacher.id,
        },
        select: {
          id: true,
          name: true,
          section: true,
        },
      });

      return NextResponse.json({ classes: teacherClasses });
    }

    // Get grades for the teacher's classes
    const grades = await prisma.grade.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        student: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedGrades = grades.map((grade) => ({
      id: grade.id,
      name: grade.name,
      studentId: grade.student.id,
      studentName: grade.student.user.name,
      subjectId: grade.subject.id,
      subjectName: grade.subject.name,
      score: grade.score,
      maxScore: grade.maxScore,
      remarks: grade.remarks,
      examDate: grade.examDate?.toISOString(),
      createdAt: grade.createdAt.toISOString(),
    }));

    return NextResponse.json({ grades: formattedGrades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

// POST: Create a new grade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can access this resource" },
        { status: 403 }
      );
    }

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

    const body = await request.json();
    const { studentId, subjectId, name, score, maxScore, remarks, examDate } =
      body;

    // Validate required fields
    if (!studentId || !subjectId || !name || !score || !maxScore) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify the student is in a class taught by the teacher
    if (student.class?.teacherId !== teacher.id) {
      return NextResponse.json(
        { error: "You can only add grades for students in your classes" },
        { status: 403 }
      );
    }

    // Create the grade
    const newGrade = await prisma.grade.create({
      data: {
        name,
        score,
        maxScore,
        remarks,
        examDate: examDate ? new Date(examDate) : null,
        studentId,
        teacherId: teacher.id,
        subjectId,
      },
      include: {
        student: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedGrade = {
      id: newGrade.id,
      name: newGrade.name,
      studentId: newGrade.student.id,
      studentName: newGrade.student.user.name,
      subjectId: newGrade.subject.id,
      subjectName: newGrade.subject.name,
      score: newGrade.score,
      maxScore: newGrade.maxScore,
      remarks: newGrade.remarks,
      examDate: newGrade.examDate?.toISOString(),
      createdAt: newGrade.createdAt.toISOString(),
    };

    return NextResponse.json({ grade: formattedGrade }, { status: 201 });
  } catch (error) {
    console.error("Error creating grade:", error);
    return NextResponse.json(
      { error: "Failed to create grade" },
      { status: 500 }
    );
  }
}
