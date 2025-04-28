import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET: Fetch a specific subject by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Access params after ensuring it's available
    const { id } = await params;

    // Fetch the subject
    const subject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject" },
      { status: 500 }
    );
  }
}

// PATCH: Update a specific subject
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Access params after ensuring it's available
    const { id } = await params;
    const data = await request.json();
    const { name, code, description } = data;

    // Check if the subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check if name or code conflicts with another subject
    if (name || code) {
      const nameOrCodeConflict = await prisma.subject.findFirst({
        where: {
          id: { not: id },
          OR: [
            name
              ? {
                  name: {
                    equals: name,
                    mode: "insensitive" as Prisma.QueryMode,
                  },
                }
              : {},
            code
              ? {
                  code: {
                    equals: code,
                    mode: "insensitive" as Prisma.QueryMode,
                  },
                }
              : {},
          ],
        },
      });

      if (nameOrCodeConflict) {
        return NextResponse.json(
          { error: "Subject with this name or code already exists" },
          { status: 409 }
        );
      }
    }

    // Update the subject
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        name: name || undefined,
        code: code || undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    return NextResponse.json({
      message: "Subject updated successfully",
      subject: updatedSubject,
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific subject
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Access params after ensuring it's available
    const { id } = await params;

    // Check if the subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check if subject is used in related tables
    const relatedRecords = await Promise.all([
      prisma.subjectClassMapping.count({ where: { subjectId: id } }),
      prisma.timetableEntry.count({ where: { subjectId: id } }),
      prisma.assignment.count({ where: { subjectId: id } }),
      prisma.grade.count({ where: { subjectId: id } }),
      prisma.teachingMaterial.count({ where: { subjectId: id } }),
    ]);

    const totalRelatedRecords = relatedRecords.reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalRelatedRecords > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete subject with existing relationships",
          details:
            "This subject is being used in classes, timetables, assignments, grades, or teaching materials",
        },
        { status: 409 }
      );
    }

    // Delete the subject
    await prisma.subject.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
