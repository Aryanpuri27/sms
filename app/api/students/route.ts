import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { hash } from "bcrypt";

// GET: Fetch all students with pagination, sorting, and filtering
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering, sorting, pagination
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const orderBy = searchParams.get("orderBy") || "name";
    const order = searchParams.get("order") || "asc";
    const classFilter = searchParams.get("class");
    const genderFilter = searchParams.get("gender");

    // Build the filter conditions
    const where: any = {};

    if (search) {
      where.OR = [
        {
          user: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        { rollNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (classFilter) {
      where.class = { name: classFilter };
    }

    if (genderFilter) {
      where.gender = genderFilter;
    }

    // Count total records for pagination
    const totalStudents = await prisma.student.count({ where });

    // Fetch students with their related data
    const students = await prisma.student.findMany({
      where,
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
      orderBy:
        orderBy === "name"
          ? { user: { name: order === "asc" ? "asc" : "desc" } }
          : { [orderBy]: order === "asc" ? "asc" : "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform data for the frontend
    const formattedStudents = students.map((student) => {
      return {
        id: student.id,
        rollNumber: student.rollNumber,
        name: student.user.name,
        email: student.user.email,
        image: student.user.image,
        className: student.class?.name || "Unassigned",
        gender: student.gender,
        attendance: "95%", // Placeholder - would calculate from actual attendance records
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        parentName: student.parentName,
        parentContact: student.parentContact,
        createdAt: student.createdAt,
      };
    });

    return NextResponse.json({
      students: formattedStudents,
      meta: {
        total: totalStudents,
        page,
        limit,
        totalPages: Math.ceil(totalStudents / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST: Create a new student
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

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      );
    }

    // Find class if className is provided
    let classId = null;
    if (className) {
      const classRecord = await prisma.class.findFirst({
        where: { name: className },
      });
      if (classRecord) {
        classId = classRecord.id;
      }
    }

    // Hash password if provided
    const hashedPassword = password ? await hash(password, 10) : null;

    // Create student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STUDENT",
        },
      });

      // Then create student profile
      const student = await tx.student.create({
        data: {
          rollNumber,
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          parentName,
          parentContact,
          userId: user.id,
          classId,
        },
      });

      return { user, student };
    });

    return NextResponse.json(
      {
        message: "Student created successfully",
        student: {
          id: result.student.id,
          rollNumber: result.student.rollNumber,
          name: result.user.name,
          email: result.user.email,
          className,
          gender: result.student.gender,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
