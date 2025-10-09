import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { withCORS } from "@/lib/cors";
import Task from "@/lib/models/task";
import Notification from "@/lib/models/notification";

export async function POST(req: NextRequest) {
  try {
    const { title, description, group, currentStatus, scheduledDate, assignedTo } =
      await req.json();

    if (!title || !description || !group || !scheduledDate) {
      const response = NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
      return withCORS(response);
    }

    const userHeader = req.headers.get("user");
    let workspaceId: string | null = null;
    let adminName = "Admin";

    if (userHeader) {
      try {
        const user = JSON.parse(userHeader);
        workspaceId = user?.workspaceId;
        adminName = user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`
          : "Admin";
      } catch (err) {
        console.error("Invalid Users header:", err);
      }
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
      workspaceId,
    });

    const task = await newTask.save();

    // ✅ Populate assigned user (optional)
    await task.populate("assignedTo", "firstName lastName email role");

    // ✅ Create notification for assigned user
    if (assignedTo) {
      await Notification.create({
        userId: assignedTo,
        title: "New Task Assigned",
        message: `${adminName} assigned you a new task: "${title}"`,
        relatedTask: task._id,
      });
    }

    const response = NextResponse.json(
      { message: "Task created successfully", task },
      { status: 200 }
    );
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
