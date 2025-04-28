import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET: Fetch a single exam with all its details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get exam ID from route params
    const { id: examId } = params;

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    try {
      // Fetch the exam with full details
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          classExams: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  roomNumber: true,
                  section: true,
                  academicYear: true,
                  teacher: {
                    select: {
                      id: true,
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
          },
          schedules: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              class: {
                select: {
                  id: true,
                  name: true,
                },
              },
              invigilators: {
                include: {
                  teacher: {
                    select: {
                      id: true,
                      user: {
                        select: {
                          name: true,
                          image: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: [{ date: "asc" }, { startTime: "asc" }],
          },
        },
      });

      if (!exam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      // Format the response
      const formattedExam = {
        id: exam.id,
        name: exam.name,
        description: exam.description,
        startDate: exam.startDate,
        endDate: exam.endDate,
        status: exam.status,
        classes: exam.classExams.map((ce: any) => ({
          id: ce.class.id,
          name: ce.class.name,
          roomNumber: ce.class.roomNumber,
          section: ce.class.section,
          academicYear: ce.class.academicYear,
          teacher: {
            id: ce.class.teacher.id,
            name: ce.class.teacher.user.name,
          },
        })),
        schedules: exam.schedules.map((schedule: any) => ({
          id: schedule.id,
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          location: schedule.location,
          subject: {
            id: schedule.subject.id,
            name: schedule.subject.name,
            code: schedule.subject.code,
          },
          class: {
            id: schedule.class.id,
            name: schedule.class.name,
          },
          invigilators: schedule.invigilators.map((inv: any) => ({
            id: inv.teacher.id,
            name: inv.teacher.user.name,
            image: inv.teacher.user.image,
          })),
        })),
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
      };

      return NextResponse.json(formattedExam);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch exam from database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam details" },
      { status: 500 }
    );
  }
}

// PATCH: Update an exam
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user?.role !== "ADMIN" && session.user?.role !== "TEACHER")
    ) {
      return NextResponse.json(
        { error: "Unauthorized: Admin or Teacher access required" },
        { status: 401 }
      );
    }

    // Get exam ID from route params
    const { id: examId } = params;

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    // Check if exam exists
    const examExists = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!examExists) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    try {
      // Get request data
      const data = await request.json();
      const { name, description, startDate, endDate, status, classes } = data;

      // Validate dates if updating
      let start = undefined;
      let end = undefined;

      if (startDate) {
        start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return NextResponse.json(
            { error: "Invalid start date format" },
            { status: 400 }
          );
        }
      }

      if (endDate) {
        end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return NextResponse.json(
            { error: "Invalid end date format" },
            { status: 400 }
          );
        }
      }

      if (start && end && start > end) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }

      // Check if classes exist if updating classes
      let classIds: string[] = [];
      if (classes && Array.isArray(classes)) {
        classIds = classes.map((c: string) => c);

        const existingClasses = await prisma.class.findMany({
          where: {
            id: {
              in: classIds,
            },
          },
          select: {
            id: true,
          },
        });

        if (existingClasses.length !== classIds.length) {
          return NextResponse.json(
            { error: "One or more classes not found" },
            { status: 404 }
          );
        }
      }

      // Update exam and class associations in a transaction
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Type cast the transaction to include our models
          const typedTx = tx as unknown as typeof prisma;

          // Update the exam
          const updatedExam = await typedTx.exam.update({
            where: { id: examId },
            data: {
              ...(name && { name }),
              ...(description !== undefined && { description }),
              ...(start && { startDate: start }),
              ...(end && { endDate: end }),
              ...(status && { status }),
            },
          });

          // Update class associations if provided
          if (classes && Array.isArray(classes)) {
            // Delete existing class associations
            await typedTx.classExam.deleteMany({
              where: { examId },
            });

            // Create new class associations
            await Promise.all(
              classIds.map(async (classId) => {
                return typedTx.classExam.create({
                  data: {
                    examId,
                    classId,
                  },
                });
              })
            );
          }

          return updatedExam;
        });

        return NextResponse.json({
          message: "Exam updated successfully",
          exam: {
            id: result.id,
            name: result.name,
            startDate: result.startDate,
            endDate: result.endDate,
            status: result.status,
          },
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        return NextResponse.json(
          { error: "Failed to update exam in database" },
          { status: 500 }
        );
      }
    } catch (parseError) {
      console.error("Error parsing request data:", parseError);
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { error: "Failed to update exam" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an exam
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Get exam ID from route params
    const { id: examId } = params;

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    // Check if exam exists
    const examExists = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!examExists) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    try {
      // Delete the exam (this will cascade delete all related records)
      await prisma.exam.delete({
        where: { id: examId },
      });

      return NextResponse.json({
        message: "Exam deleted successfully",
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to delete exam from database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
