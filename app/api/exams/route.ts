import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { Prisma } from "@prisma/client";

// GET: Fetch exams with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const classId = searchParams.get("classId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Build the query
    const where: any = {};

    // Filter by status
    if (status) {
      // Handle comma-separated status values
      if (status.includes(",")) {
        const statusList = status.split(",");
        where.status = { in: statusList };
      } else {
        where.status = status;
      }
    }

    // Filter by date range
    if (startDate || endDate) {
      where.OR = [
        // Start date falls in range
        {
          startDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
        // End date falls in range
        {
          endDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
        // Exam spans the entire range
        {
          AND: [
            {
              startDate: {
                ...(startDate && { lte: new Date(startDate) }),
              },
            },
            {
              endDate: {
                ...(endDate && { gte: new Date(endDate) }),
              },
            },
          ],
        },
      ];
    }

    // Filter by class
    if (classId) {
      where.classExams = {
        some: {
          classId,
        },
      };
    }

    // Search by name
    if (search) {
      where.OR = [
        ...(where.OR || []),
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Count total records for pagination
    const totalExams = await prisma.exam.count({ where });

    // Fetch exams with related data
    const exams = await prisma.exam.findMany({
      where,
      include: {
        classExams: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
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
      },
      orderBy: [{ status: "asc" }, { startDate: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format the exams for the response
    const formattedExams = exams.map((exam: any) => {
      // Extract all class names for this exam
      const classes = exam.classExams.map((ce: any) => ({
        id: ce.class.id,
        name: ce.class.name,
      }));

      return {
        id: exam.id,
        name: exam.name,
        description: exam.description,
        startDate: exam.startDate,
        endDate: exam.endDate,
        status: exam.status,
        classes,
        schedulesCount: exam.schedules.length,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
      };
    });

    return NextResponse.json({
      exams: formattedExams,
      meta: {
        total: totalExams,
        page,
        limit,
        totalPages: Math.ceil(totalExams / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

// POST: Create a new exam
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
    const { name, description, startDate, endDate, status, classes } = data;

    // Validate required fields
    if (
      !name ||
      !startDate ||
      !endDate ||
      !classes ||
      !Array.isArray(classes) ||
      classes.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Name, start date, end date, and at least one class are required",
        },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    try {
      // Check if classes exist
      const classIds = classes.map((c: string) => c);
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

      // Check if all classes were found
      if (existingClasses.length !== classIds.length) {
        return NextResponse.json(
          { error: "One or more classes not found" },
          { status: 404 }
        );
      }

      // Create the exam using Prisma's API
      const exam = await prisma.exam.create({
        data: {
          name,
          description: description || null,
          startDate: start,
          endDate: end,
          status: status || "UPCOMING",
          classExams: {
            create: classIds.map((classId) => ({
              class: {
                connect: {
                  id: classId,
                },
              },
            })),
          },
        },
        include: {
          classExams: true,
        },
      });

      return NextResponse.json(
        {
          message: "Exam created successfully",
          exam: {
            id: exam.id,
            name: exam.name,
            startDate: exam.startDate,
            endDate: exam.endDate,
            status: exam.status,
            classCount: exam.classExams.length,
          },
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: `Database operation failed: ${dbError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}
