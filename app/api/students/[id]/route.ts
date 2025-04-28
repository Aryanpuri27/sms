import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { hash } from "bcrypt";

// GET: Fetch a single student by ID
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

    // Get ID from params
    const { id: studentId } = params;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Fetch student with related data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        class: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Transform data for the frontend
    const formattedStudent = {
      id: student.id,
      rollNumber: student.rollNumber,
      name: student.user.name,
      email: student.user.email,
      image: student.user.image,
      className: student.class?.name || "Unassigned",
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      parentName: student.parentName,
      parentContact: student.parentContact,
      createdAt: student.createdAt,
    };

    return NextResponse.json(formattedStudent);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    );
  }
}

// PUT: Update a student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Get ID from params
    const { id: studentId } = params;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Get the request body
    const data = await request.json();
    const {
      name,
      email,
      password,
      className,
      rollNumber,
      gender,
      dateOfBirth,
      address,
      parentName,
      parentContact,
    } = data;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // If email is being changed, check if the new email is already in use by another user
    if (email !== existingStudent.user.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: existingStudent.userId },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 }
        );
      }
    }

    // Find class if className is provided
    let classId = existingStudent.classId;
    if (className) {
      const classRecord = await prisma.class.findFirst({
        where: { name: className },
      });
      if (classRecord) {
        classId = classRecord.id;
      } else if (className === "") {
        // If className is empty string, remove class assignment
        classId = null;
      }
    }

    // Hash password if provided
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await hash(password, 10);
    }

    // Update student and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: existingStudent.userId },
        data: {
          name,
          email,
          ...(hashedPassword ? { password: hashedPassword } : {}),
        },
      });

      // Update student profile
      const updatedStudent = await tx.student.update({
        where: { id: studentId },
        data: {
          rollNumber,
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          parentName,
          parentContact,
          classId,
        },
      });

      return { user: updatedUser, student: updatedStudent };
    });

    return NextResponse.json({
      message: "Student updated successfully",
      student: {
        id: result.student.id,
        rollNumber: result.student.rollNumber,
        name: result.user.name,
        email: result.user.email,
        className,
        gender: result.student.gender,
      },
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Get ID from params
    const { id: studentId } = params;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Delete student record and user account in a transaction
    await prisma.$transaction(async (tx) => {
      // First delete student record
      await tx.student.delete({
        where: { id: studentId },
      });

      // Then delete user account
      await tx.user.delete({
        where: { id: existingStudent.userId },
      });
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
