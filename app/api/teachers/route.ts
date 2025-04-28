import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET: Fetch all teachers
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    // Build the filter conditions
    const where: any = {};

    // Add user relation filter for search
    if (search) {
      where.user = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    // Fetch teachers
    const teachers = await prisma.teacher.findMany({
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
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    // Transform data for the frontend
    const formattedTeachers = teachers.map((teacher) => {
      return {
        id: teacher.id,
        name: teacher.user.name,
        email: teacher.user.email,
        image: teacher.user.image,
        designation: teacher.designation,
        phoneNumber: teacher.phoneNumber,
      };
    });

    return NextResponse.json({
      teachers: formattedTeachers,
      count: teachers.length,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

// POST handler for creating a new teacher
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      name,
      email,
      password,
      qualification,
      designation,
      phoneNumber,
      bio,
    } = data;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user and teacher in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user first
      const user = await tx.user.create({
        data: {
          name,
          email,
          password, // In a real app, hash this password
          role: "TEACHER",
        },
      });

      // Create the teacher record
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          qualification,
          designation,
          phoneNumber,
          bio,
        },
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

      return teacher;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 }
    );
  }
}
