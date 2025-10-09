/* eslint-disable @typescript-eslint/no-explicit-any */
import { withCORS } from "@/lib/cors";
import connectDB from "@/lib/db";
import Task from "@/lib/models/task";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const createdAtParam = searchParams.get("createdAt");
    const createdAt = createdAtParam ? new Date(createdAtParam) : null;
    const skip = (page - 1) * limit;

    // 🔹 Get current user info from custom header
    const userHeader = req.headers.get("user");
    let currentUserId: string | null = null;
    let currentUserRole: string | null = null;
    let workspaceId: string | null = null;

    if (userHeader) {
      try {
        const user = JSON.parse(userHeader); // expect JSON string
        currentUserId = user.id;
        currentUserRole = user.role;
        workspaceId = user?.workspaceId
      } catch (err) {
        console.error("Invalid Users header:", err);
      }
    }

    // 🔹 Build query
    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (createdAt) {
      const start = new Date(createdAt);
      start.setHours(0, 0, 0, 0);
      const end = new Date(createdAt);
      end.setHours(23, 59, 59, 999);
      query.scheduledDate = { $gte: start, $lte: end };
    }

    // 🔹 Filter tasks for Member role
    if (currentUserRole === "Member" && currentUserId) {
      query.assignedTo = currentUserId;
    } 
    if(workspaceId) {
      query.workspaceId = workspaceId
    }


    // 🔹 Fetch tasks
    const tasks = await Task.find(query)
      .skip(skip)
      .limit(limit)
      .populate("assignedTo", "firstName lastName email role")
      .lean();

    const total = await Task.countDocuments(query);

    return withCORS(
      NextResponse.json({
        data: tasks,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }, { status: 200 })
    );
  } catch (error) {
    return withCORS(
      NextResponse.json({ message: "Error fetching Tasks", error: String(error) }, { status: 500 })
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return withCORS(NextResponse.json({}, { status: 200 }));
}
