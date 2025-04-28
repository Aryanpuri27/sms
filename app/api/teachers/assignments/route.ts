import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Get all assignments for a teacher
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

    if (classId) {
      where.classId = classId;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (status) {
      where.status = status;
    }

    // Get assignments
    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        submissions: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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
        roomNumber: true,
      },
    });

    // Get all subjects taught by the teacher
    const subjects = await prisma.subject.findMany({
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
        code: true,
      },
    });

    // Format the response
    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.toISOString(),
      status: assignment.status,
      subject: assignment.subject.name,
      subjectId: assignment.subject.id,
      classId: assignment.class.id,
      className: assignment.class.name,
      submissionCount: assignment.submissions.length,
      createdAt: assignment.createdAt.toISOString(),
    }));

    return NextResponse.json({
      assignments: formattedAssignments,
      classes,
      subjects,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// POST: Create a new assignment
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
    const { title, description, dueDate, subjectId, classId } = body;

    // Validate required fields
    if (!title || !dueDate || !subjectId || !classId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the class belongs to the teacher
    const classExists = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: teacher.id,
      },
    });

    if (!classExists) {
      return NextResponse.json(
        { error: "Class not found or you don't have access to this class" },
        { status: 404 }
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

    // Create the assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        status: "ACTIVE", // Default status
        teacherId: teacher.id,
        classId,
        subjectId,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
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

    // Format the response
    const formattedAssignment = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.toISOString(),
      status: assignment.status,
      subject: assignment.subject.name,
      subjectId: assignment.subject.id,
      classId: assignment.class.id,
      className: assignment.class.name,
      submissionCount: 0,
      createdAt: assignment.createdAt.toISOString(),
    };

    return NextResponse.json({
      assignment: formattedAssignment,
      message: "Assignment created successfully",
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
