import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

// GET: Get a single assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the assignment
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: params.id,
        teacherId: teacher.id,
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
        submissions: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

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
      submissionCount: assignment.submissions.length,
      createdAt: assignment.createdAt.toISOString(),
    };

    return NextResponse.json({ assignment: formattedAssignment });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

// PUT: Update an assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify the assignment exists and belongs to the teacher
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id: params.id,
        teacherId: teacher.id,
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
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

    // Update the assignment
    const updatedAssignment = await prisma.assignment.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        subjectId,
        classId,
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
        submissions: {
          select: {
            id: true,
          },
        },
      },
    });

    // Format the response
    const formattedAssignment = {
      id: updatedAssignment.id,
      title: updatedAssignment.title,
      description: updatedAssignment.description,
      dueDate: updatedAssignment.dueDate.toISOString(),
      status: updatedAssignment.status,
      subject: updatedAssignment.subject.name,
      subjectId: updatedAssignment.subject.id,
      classId: updatedAssignment.class.id,
      className: updatedAssignment.class.name,
      submissionCount: updatedAssignment.submissions.length,
      createdAt: updatedAssignment.createdAt.toISOString(),
    };

    return NextResponse.json({ assignment: formattedAssignment });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify the assignment exists and belongs to the teacher
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id: params.id,
        teacherId: teacher.id,
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Delete the assignment
    await prisma.assignment.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
