import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET handler for fetching a single teacher
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Get teacher ID from params
    const { id: teacherId } = params;

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Check if user is authenticated and is admin
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Only admins can access teacher details
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // First try to find the teacher by the Teacher model id
    let teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        classes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If not found, try by User id
    if (!teacher) {
      teacher = await prisma.teacher.findUnique({
        where: { userId: teacherId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          classes: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher details" },
      { status: 500 }
    );
  }
}

// PUT handler for updating a teacher
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Get teacher ID from params
    const { id: teacherId } = params;

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Check if user is authenticated and is admin
    if (!session || !session.user || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      name,
      email,
      password,
      qualification,
      designation,
      phoneNumber,
      bio,
    } = data;

    // Find the teacher
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Update in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user data
      const updatedUser = await tx.user.update({
        where: { id: teacher.userId },
        data: {
          name: name || undefined,
          email: email || undefined,
          password: password || undefined, // In a real app, hash this password
        },
      });

      // Update teacher data
      const updatedTeacher = await tx.teacher.update({
        where: { id: teacherId },
        data: {
          qualification: qualification || undefined,
          designation: designation || undefined,
          phoneNumber: phoneNumber || undefined,
          bio: bio || undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          classes: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return updatedTeacher;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Failed to update teacher" },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a teacher
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Get teacher ID from params
    const { id: teacherId } = params;

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Check if user is authenticated and is admin
    if (!session || !session.user || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Find the teacher
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Delete in a transaction - first the teacher, then the user
    await prisma.$transaction(async (tx) => {
      await tx.teacher.delete({
        where: { id: teacherId },
      });

      await tx.user.delete({
        where: { id: teacher.userId },
      });
    });

    return NextResponse.json(
      { message: "Teacher deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
