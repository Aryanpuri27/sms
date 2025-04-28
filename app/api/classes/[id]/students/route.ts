import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

// PUT: Update the students assigned to a class
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Get ID from params using destructuring
    const { id: classId } = params;
    const { studentIds } = await request.json();

    // Validate input
    if (!Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: "studentIds must be an array" },
        { status: 400 }
      );
    }

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // First, unassign all students from this class
      await tx.student.updateMany({
        where: { classId },
        data: { classId: null },
      });

      // Then, assign selected students to this class
      if (studentIds.length > 0) {
        await tx.student.updateMany({
          where: { id: { in: studentIds } },
          data: { classId },
        });
      }
    });

    return NextResponse.json({
      message: "Students updated successfully",
      assignedCount: studentIds.length,
    });
  } catch (error) {
    console.error("Error updating students:", error);
    return NextResponse.json(
      { error: "Failed to update student assignments" },
      { status: 500 }
    );
  }
}

// GET: Get all students assigned to a class
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

    // Get ID from params using destructuring
    const { id: classId } = params;

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Get students assigned to this class
    const students = await prisma.student.findMany({
      where: { classId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Format the response
    const formattedStudents = students.map((student) => ({
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      image: student.user.image,
      rollNumber: student.rollNumber,
    }));

    return NextResponse.json({
      students: formattedStudents,
      count: formattedStudents.length,
    });
  } catch (error) {
    console.error("Error fetching class students:", error);
    return NextResponse.json(
      { error: "Failed to fetch class students" },
      { status: 500 }
    );
  }
}
