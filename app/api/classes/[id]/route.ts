import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Fetch a specific class by ID
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

    // Get class ID from params (destructure to avoid NextJS sync warning)
    const { id } = params;

    // Fetch the class with detailed information
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        students: {
          select: {
            id: true,
            rollNumber: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
        _count: {
          select: {
            students: true,
            assignments: true,
            timetableEntries: true,
          },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Transform data for the frontend
    const formattedClass = {
      id: classData.id,
      name: classData.name,
      roomNumber: classData.roomNumber,
      section: classData.section,
      academicYear: classData.academicYear,
      teacher: classData.teacher
        ? {
            id: classData.teacher.id,
            name: classData.teacher.user.name,
            email: classData.teacher.user.email,
            image: classData.teacher.user.image,
          }
        : null,
      students: classData.students.map((student) => ({
        id: student.id,
        rollNumber: student.rollNumber,
        name: student.user.name,
        email: student.user.email,
        image: student.user.image,
      })),
      subjects: classData.subjects.map((subjectMapping) => ({
        id: subjectMapping.subject.id,
        name: subjectMapping.subject.name,
        code: subjectMapping.subject.code,
      })),
      counts: {
        students: classData._count.students,
        assignments: classData._count.assignments,
        timetableEntries: classData._count.timetableEntries,
      },
      createdAt: classData.createdAt,
      updatedAt: classData.updatedAt,
    };

    return NextResponse.json(formattedClass);
  } catch (error) {
    console.error("Error fetching class:", error);
    return NextResponse.json(
      { error: "Failed to fetch class details" },
      { status: 500 }
    );
  }
}

// PUT: Update a specific class by ID
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

    // Get class ID from params (destructure to avoid NextJS sync warning)
    const { id } = params;
    const data = await request.json();
    const { name, teacherId, academicYear, roomNumber, section } = data;

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
        name: name !== undefined ? name : existingClass.name,
        teacherId:
          teacherId !== undefined ? teacherId : existingClass.teacherId,
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

// DELETE: Delete a specific class by ID
export async function DELETE(
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

    // Get class ID from params (destructure to avoid NextJS sync warning)
    const { id } = params;

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
