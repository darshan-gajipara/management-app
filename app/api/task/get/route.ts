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

    // 🔹 Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (createdAt) {
      const start = new Date(createdAt);
      start.setHours(0, 0, 0, 0);
      const end = new Date(createdAt);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    // 🔹 Await the query result
    const tasks = await Task.find(query)
      .skip(skip)
      .limit(limit)
      .lean(); // lean() returns plain JS objects (better for JSON)

    const total = await Task.countDocuments(query);

    const response = NextResponse.json(
      {
        data: tasks,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
    return withCORS(response);
  } catch (error) {
    const response = NextResponse.json(
      { message: "Error fetching Tasks", error: String(error) },
      { status: 500 }
    );
    return withCORS(response);
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return withCORS(NextResponse.json({}, { status: 200 }));
}

