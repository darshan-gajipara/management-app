import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { withCORS } from "@/lib/cors";
import Task from "@/lib/models/task";

export async function POST(req: NextRequest) {
  try {
    const { title, description, group, currentStatus, scheduledDate, assignedTo } = await req.json();

    // Validate required fields
    if (!title || !description || !group || !scheduledDate) {
      const response = NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
      return withCORS(response);
    }

    await connectDB();

    // ✅ Create and save new task
    const newTask = new Task({
      title,
      description,
      group,
      currentStatus,
      scheduledDate,
      assignedTo,
    });

    const task = await newTask.save();

    // ✅ Populate assigned user (optional)
    await task.populate("assignedTo", "firstName lastName email role");

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

export async function OPTIONS() {
  return withCORS(NextResponse.json({}, { status: 200 }));
}
