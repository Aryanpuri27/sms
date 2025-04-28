import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch all classes
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering and sorting
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const orderBy = searchParams.get("orderBy") || "name";
    const order = searchParams.get("order") || "asc";

    // Build the filter conditions
    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    // Fetch classes
    const classes = await prisma.class.findMany({
      where,
      include: {
        teacher: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { [orderBy]: order === "asc" ? "asc" : "desc" },
    });

    // Transform data for the frontend
    const formattedClasses = classes.map((cls) => {
      return {
        id: cls.id,
        name: cls.name,
        teacherName: cls.teacher?.user?.name || null,
        studentCount: cls._count.students,
        academicYear: cls.academicYear,
        roomNumber: cls.roomNumber,
        section: cls.section,
        createdAt: cls.createdAt,
      };
    });

    return NextResponse.json({
      classes: formattedClasses,
      count: classes.length,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

// POST: Create a new class (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, teacherId, academicYear, roomNumber, section } = data;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      );
    }

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Check if class name already exists
    const existingClass = await prisma.class.findFirst({
      where: { name },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: "A class with this name already exists" },
        { status: 400 }
      );
    }

    // Create the class
    const newClass = await prisma.class.create({
      data: {
        name,
        teacherId,
        academicYear,
        roomNumber,
        section,
      },
      include: {
        teacher: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Class created successfully",
        class: {
          id: newClass.id,
          name: newClass.name,
          teacherName: newClass.teacher?.user?.name || null,
          academicYear: newClass.academicYear,
          roomNumber: newClass.roomNumber,
          section: newClass.section,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing class (Admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, name, teacherId, academicYear, roomNumber, section } = data;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if the new class name already exists (only if name is being updated)
    if (name && name !== existingClass.name) {
      const classWithSameName = await prisma.class.findFirst({
        where: {
          name,
          id: { not: id }, // Exclude the current class from the check
        },
      });

      if (classWithSameName) {
        return NextResponse.json(
          { error: "A class with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name: name || existingClass.name,
        teacherId: teacherId || existingClass.teacherId,
        academicYear:
          academicYear !== undefined
            ? academicYear
            : existingClass.academicYear,
        roomNumber:
          roomNumber !== undefined ? roomNumber : existingClass.roomNumber,
        section: section !== undefined ? section : existingClass.section,
      },
      include: {
        teacher: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Class updated successfully",
      class: {
        id: updatedClass.id,
        name: updatedClass.name,
        teacherName: updatedClass.teacher?.user?.name || null,
        academicYear: updatedClass.academicYear,
        roomNumber: updatedClass.roomNumber,
        section: updatedClass.section,
      },
    });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a class (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Get the class ID from the request URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
        timetableEntries: true,
        assignments: true,
        subjects: true,
        attendanceSessions: true,
      },
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Start a transaction to delete related records
    await prisma.$transaction(async (tx) => {
      // Update students to remove class association
      if (existingClass.students.length > 0) {
        await tx.student.updateMany({
          where: { classId: id },
          data: { classId: null },
        });
      }

      // Delete timetable entries
      if (existingClass.timetableEntries.length > 0) {
        await tx.timetableEntry.deleteMany({
          where: { classId: id },
        });
      }

      // Delete subject-class mappings
      if (existingClass.subjects.length > 0) {
        await tx.subjectClassMapping.deleteMany({
          where: { classId: id },
        });
      }

      // Delete attendance sessions and related attendance records
      for (const session of existingClass.attendanceSessions) {
        await tx.attendance.deleteMany({
          where: { sessionId: session.id },
        });
      }

      if (existingClass.attendanceSessions.length > 0) {
        await tx.attendanceSession.deleteMany({
          where: { classId: id },
        });
      }

      // Delete assignments and related submissions
      for (const assignment of existingClass.assignments) {
        await tx.assignmentSubmission.deleteMany({
          where: { assignmentId: assignment.id },
        });
      }

      if (existingClass.assignments.length > 0) {
        await tx.assignment.deleteMany({
          where: { classId: id },
        });
      }

      // Finally delete the class
      await tx.class.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
