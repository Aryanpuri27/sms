import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Fetch exam results with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const examId = searchParams.get("examId");
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    // Build the query
    const where: any = {};

    if (examId) {
      where.examId = examId;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    // Handle class ID filter (need to find all students in a class)
    if (classId) {
      where.student = {
        classId,
      };
    }

    // Handle search term (search by student name)
    if (search) {
      where.student = {
        ...where.student,
        user: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      };
    }

    // Count total records for pagination
    const totalResults = await prisma.examResult.count({ where });

    // Fetch exam results with related data
    const results = await prisma.examResult.findMany({
      where,
      include: {
        exam: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            rollNumber: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format the results for the response
    const formattedResults = results.map((result: any) => ({
      id: result.id,
      marks: result.marks,
      maxMarks: result.maxMarks,
      grade: result.grade,
      remarks: result.remarks,
      exam: {
        id: result.exam.id,
        name: result.exam.name,
      },
      student: {
        id: result.student.id,
        rollNumber: result.student.rollNumber,
        name: result.student.user.name,
        image: result.student.user.image,
        class: result.student.class
          ? {
              id: result.student.class.id,
              name: result.student.class.name,
            }
          : null,
      },
      subject: {
        id: result.subject.id,
        name: result.subject.name,
        code: result.subject.code,
      },
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    }));

    return NextResponse.json({
      results: formattedResults,
      meta: {
        total: totalResults,
        page,
        limit,
        totalPages: Math.ceil(totalResults / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam results" },
      { status: 500 }
    );
  }
}

// POST: Create or update exam results
export async function POST(request: NextRequest) {
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

    // Get request data
    const data = await request.json();
    const { examId, results } = data;

    // Validate required fields
    if (
      !examId ||
      !results ||
      !Array.isArray(results) ||
      results.length === 0
    ) {
      return NextResponse.json(
        { error: "Exam ID and results array are required" },
        { status: 400 }
      );
    }

    // Check if exam exists and is completed
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Validate results format
    for (const result of results) {
      const { studentId, subjectId, marks, maxMarks } = result;

      if (
        !studentId ||
        !subjectId ||
        marks === undefined ||
        maxMarks === undefined
      ) {
        return NextResponse.json(
          {
            error:
              "Each result must have studentId, subjectId, marks, and maxMarks",
          },
          { status: 400 }
        );
      }

      if (typeof marks !== "number" || typeof maxMarks !== "number") {
        return NextResponse.json(
          { error: "Marks and maxMarks must be numbers" },
          { status: 400 }
        );
      }

      if (marks < 0 || marks > maxMarks) {
        return NextResponse.json(
          { error: "Marks must be between 0 and maxMarks" },
          { status: 400 }
        );
      }
    }

    // Create or update results in a transaction
    const savedResults = await prisma.$transaction(async (tx) => {
      const resultEntries = [];

      // Type cast the transaction to include our models
      const typedTx = tx as unknown as typeof prisma;

      for (const result of results) {
        const { studentId, subjectId, marks, maxMarks, grade, remarks } =
          result;

        // Check if student is valid
        const student = await typedTx.student.findUnique({
          where: { id: studentId },
        });

        if (!student) {
          throw new Error(`Student with ID ${studentId} not found`);
        }

        // Check if subject is valid
        const subject = await typedTx.subject.findUnique({
          where: { id: subjectId },
        });

        if (!subject) {
          throw new Error(`Subject with ID ${subjectId} not found`);
        }

        // Check if the result already exists
        const existingResult = await typedTx.examResult.findUnique({
          where: {
            examId_studentId_subjectId: {
              examId,
              studentId,
              subjectId,
            },
          },
        });

        let resultEntry;
        if (existingResult) {
          // Update existing result
          resultEntry = await typedTx.examResult.update({
            where: {
              examId_studentId_subjectId: {
                examId,
                studentId,
                subjectId,
              },
            },
            data: {
              marks,
              maxMarks,
              grade,
              remarks,
            },
          });
        } else {
          // Create new result
          resultEntry = await typedTx.examResult.create({
            data: {
              examId,
              studentId,
              subjectId,
              marks,
              maxMarks,
              grade,
              remarks,
            },
          });
        }

        resultEntries.push(resultEntry);
      }

      return resultEntries;
    });

    return NextResponse.json(
      {
        message: "Exam results saved successfully",
        count: savedResults.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving exam results:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save exam results",
      },
      { status: 500 }
    );
  }
}
