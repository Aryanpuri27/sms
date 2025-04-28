import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { Prisma } from "@prisma/client";

// GET: Fetch all subjects
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search query from URL
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    // Get pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: Prisma.SubjectWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
            {
              code: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
          ],
        }
      : {};

    // Fetch subjects with pagination
    const subjects = await prisma.subject.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
    });

    // Get total count for pagination
    const totalCount = await prisma.subject.count({ where });

    return NextResponse.json({
      subjects,
      meta: {
        total: totalCount,
        page,
        limit,
        pageCount: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

// POST: Create a new subject
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

    // Parse the request body
    const data = await request.json();
    const { name, code, description } = data;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Subject name is required" },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "Subject code is required" },
        { status: 400 }
      );
    }

    // Check if subject with same code already exists
    const existingSubject = await prisma.subject.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" as Prisma.QueryMode } },
          { code: { equals: code, mode: "insensitive" as Prisma.QueryMode } },
        ],
      },
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: "A subject with this name or code already exists" },
        { status: 409 }
      );
    }

    // Create the new subject
    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        description: description || null,
      },
    });

    return NextResponse.json(
      {
        message: "Subject created successfully",
        subject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
