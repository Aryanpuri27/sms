import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    const assignment = await prisma.assignment.findUnique({
      where: {
        id,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        class: true,
        subject: true,
        submissions: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
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

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Verify the assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: {
        id,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Ensure only the teacher who created the assignment can update it
    if (existingAssignment.teacher.user.email !== session.user?.email) {
      return NextResponse.json(
        { error: "You do not have permission to update this assignment" },
        { status: 403 }
      );
    }

    // Update the assignment
    const updatedAssignment = await prisma.assignment.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status,
        classId: data.classId,
        subjectId: data.subjectId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        class: true,
        subject: true,
      },
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: {
        id,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Ensure only the teacher who created the assignment can delete it
    if (existingAssignment.teacher.user.email !== session.user?.email) {
      return NextResponse.json(
        { error: "You do not have permission to delete this assignment" },
        { status: 403 }
      );
    }

    // Delete the assignment and its submissions
    await prisma.$transaction([
      prisma.assignmentSubmission.deleteMany({
        where: {
          assignmentId: id,
        },
      }),
      prisma.assignment.delete({
        where: {
          id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
