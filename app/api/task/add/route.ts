import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { withCORS } from "@/lib/cors";
import Task from "@/lib/models/task";

export async function POST(req: NextRequest) {
  try {
    const { title, description, group, currentStatus, scheduledDate } = await req.json();

    if (!title || !description || !group || !scheduledDate) {
      const response = NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
      return withCORS(response);
    }

    await connectDB();
    const newTask = new Task({ title, description, group, currentStatus, scheduledDate });
    const task = await newTask.save();

    const response = NextResponse.json(task, { status: 200 });
    return withCORS(response);
  } catch (error) {
    const response = NextResponse.json(
      { message: "Error creating task", error: String(error) },
      { status: 500 }
    );
    return withCORS(response);
  }
}

// Handle preflight requests (important for CORS)
export async function OPTIONS() {
  return withCORS(NextResponse.json({}, { status: 200 }));
}
