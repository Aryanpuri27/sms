import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET handler to fetch classes assigned to a teacher
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin or the teacher themselves
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get teacher ID from params using destructuring
    const { id: teacherId } = params;

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Fetch teacher with assigned classes
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        classes: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json({ classes: teacher.classes });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher classes" },
      { status: 500 }
    );
  }
}

// PUT handler to update classes assigned to a teacher
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access: Admin rights required" },
        { status: 401 }
      );
    }

    // Ensure we use the id correctly
    const parm = await params;
    const teacherId = parm?.id;
    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { classIds } = data;

    if (!Array.isArray(classIds)) {
      return NextResponse.json(
        { error: "Invalid request: classIds must be an array" },
        { status: 400 }
      );
    }

    // Verify the teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Fetch all classes that are in the requested list
    const classesToAssign = await prisma.class.findMany({
      where: { id: { in: classIds } },
    });

    // Find which classes are already assigned to other teachers
    const conflictingClasses = classesToAssign.filter(
      (cls) => cls.teacherId !== null && cls.teacherId !== teacherId
    );

    if (conflictingClasses.length > 0) {
      return NextResponse.json(
        {
          error: "Some classes are already assigned to other teachers",
          conflictingClasses,
        },
        { status: 409 }
      );
    }

    // First, unassign all current classes
    await prisma.class.updateMany({
      where: { teacherId },
      data: { teacherId: undefined },
    });

    // Assign the new classes to this teacher
    if (classIds.length > 0) {
      await prisma.class.updateMany({
        where: { id: { in: classIds } },
        data: { teacherId },
      });
    }

    // Fetch updated teacher with new class assignments
    const updatedTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        classes: {
          select: {
            id: true,
            name: true,
            section: true,
            academicYear: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error("Error updating teacher classes:", error);
    return NextResponse.json(
      { error: "Failed to update teacher classes" },
      { status: 500 }
    );
  }
}
