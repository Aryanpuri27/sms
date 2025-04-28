import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET: Get all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all unique conversations where current user is either sender or receiver
    const conversations = await prisma.$queryRaw`
      WITH conversations AS (
        SELECT 
          CASE
            WHEN "senderId" = ${userId} THEN "receiverId"
            ELSE "senderId"
          END as "participantId",
          MAX("createdAt") as "lastMessageAt"
        FROM "Message"
        WHERE "senderId" = ${userId} OR "receiverId" = ${userId}
        GROUP BY "participantId"
      )
      SELECT 
        u.id as "participantId",
        u.name as "participantName",
        u.email as "participantEmail",
        u.image as "participantImage",
        u.role as "participantRole",
        c."lastMessageAt",
        (
          SELECT count(*) 
          FROM "Message" 
          WHERE "receiverId" = ${userId} 
          AND "senderId" = u.id 
          AND "read" = false
        ) as "unreadCount",
        (
          SELECT json_build_object(
            'id', m.id,
            'subject', m.subject,
            'content', m.content,
            'createdAt', m."createdAt",
            'senderId', m."senderId",
            'read', m."read"
          )
          FROM "Message" m
          WHERE (m."senderId" = ${userId} AND m."receiverId" = u.id)
          OR (m."receiverId" = ${userId} AND m."senderId" = u.id)
          ORDER BY m."createdAt" DESC
          LIMIT 1
        ) as "lastMessage"
      FROM conversations c
      JOIN "User" u ON u.id = c."participantId"
      ORDER BY c."lastMessageAt" DESC;
    `;

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
