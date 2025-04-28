import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Fetch exam schedules with filtering and pagination
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
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build the query
    const where: any = {};

    if (examId) {
      where.examId = examId;
    }

    if (classId) {
      where.classId = classId;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      };
    }

    // Count total records for pagination
    const totalSchedules = await prisma.examSchedule.count({ where });

    // Fetch exam schedules with related data
    const schedules = await prisma.examSchedule.findMany({
      where,
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            roomNumber: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
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
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format the schedules for the response
    const formattedSchedules = schedules.map((schedule: any) => ({
      id: schedule.id,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      exam: {
        id: schedule.exam.id,
        name: schedule.exam.name,
        status: schedule.exam.status,
      },
      subject: {
        id: schedule.subject.id,
        name: schedule.subject.name,
        code: schedule.subject.code,
      },
      class: {
        id: schedule.class.id,
        name: schedule.class.name,
        roomNumber: schedule.class.roomNumber,
      },
      invigilators: schedule.invigilators.map((inv: any) => ({
        id: inv.teacher.id,
        name: inv.teacher.user.name,
        image: inv.teacher.user.image,
      })),
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    }));

    return NextResponse.json({
      schedules: formattedSchedules,
      meta: {
        total: totalSchedules,
        page,
        limit,
        totalPages: Math.ceil(totalSchedules / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching exam schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam schedules" },
      { status: 500 }
    );
  }
}

// POST: Create a new exam schedule
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
    const {
      examId,
      classId,
      subjectId,
      date,
      startTime,
      endTime,
      location,
      invigilators,
    } = data;

    // Validate required fields
    if (!examId || !classId || !subjectId || !date || !startTime || !endTime) {
      return NextResponse.json(
        {
          error:
            "Exam ID, class ID, subject ID, date, start time, and end time are required",
        },
        { status: 400 }
      );
    }

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check if class is associated with this exam
    const classExam = await prisma.classExam.findUnique({
      where: {
        examId_classId: {
          examId,
          classId,
        },
      },
    });

    if (!classExam) {
      return NextResponse.json(
        { error: "Class is not associated with this exam" },
        { status: 400 }
      );
    }

    // Validate dates
    const examDate = new Date(date);
    const examStartTime = new Date(startTime);
    const examEndTime = new Date(endTime);

    if (
      isNaN(examDate.getTime()) ||
      isNaN(examStartTime.getTime()) ||
      isNaN(examEndTime.getTime())
    ) {
      return NextResponse.json(
        { error: "Invalid date or time format" },
        { status: 400 }
      );
    }

    if (examStartTime >= examEndTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check if exam date is within the exam date range
    if (examDate < exam.startDate || examDate > exam.endDate) {
      return NextResponse.json(
        { error: "Exam schedule date must be within the exam date range" },
        { status: 400 }
      );
    }

    // Validate invigilators if provided
    let teacherIds: string[] = [];
    if (
      invigilators &&
      Array.isArray(invigilators) &&
      invigilators.length > 0
    ) {
      teacherIds = invigilators;

      // Check if teachers exist
      const teachers = await prisma.teacher.findMany({
        where: {
          id: {
            in: teacherIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (teachers.length !== teacherIds.length) {
        return NextResponse.json(
          { error: "One or more invigilators not found" },
          { status: 404 }
        );
      }
    }

    // Create exam schedule in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Type cast the transaction to include our models
      const typedTx = tx as unknown as typeof prisma;

      // Create the exam schedule
      const schedule = await typedTx.examSchedule.create({
        data: {
          examId,
          classId,
          subjectId,
          date: examDate,
          startTime: examStartTime,
          endTime: examEndTime,
          location,
        },
      });

      // Assign invigilators if provided
      if (teacherIds.length > 0) {
        await Promise.all(
          teacherIds.map(async (teacherId) => {
            return typedTx.examInvigilator.create({
              data: {
                examScheduleId: schedule.id,
                teacherId,
              },
            });
          })
        );
      }

      return schedule;
    });

    return NextResponse.json(
      {
        message: "Exam schedule created successfully",
        schedule: {
          id: result.id,
          examId: result.examId,
          classId: result.classId,
          subjectId: result.subjectId,
          date: result.date,
          startTime: result.startTime,
          endTime: result.endTime,
          location: result.location,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating exam schedule:", error);
    return NextResponse.json(
      { error: "Failed to create exam schedule" },
      { status: 500 }
    );
  }
}
