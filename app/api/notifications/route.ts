import connectDB from "@/lib/db";
import Notification from "@/lib/models/notification";
import { NextRequest, NextResponse } from "next/server";
import { withCORS } from "@/lib/cors";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userHeader = req.headers.get("user");
    let userId = null;

    if (userHeader) {
      try {
        const user = JSON.parse(userHeader);
        userId = user?.id;
      } catch (err) {
        console.error("Invalid Users header:", err);
      }
    }

    if (!userId) {
      return withCORS(
        NextResponse.json({ message: "User not found" }, { status: 400 })
      );
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const response = NextResponse.json(notifications, { status: 200 });
    return withCORS(response);
  } catch (error) {
    const response = NextResponse.json(
      { message: "Error fetching notifications", error: String(error) },
      { status: 500 }
    );
    return withCORS(response);
  }
}

export async function OPTIONS() {
  return withCORS(NextResponse.json({}, { status: 200 }));
}
