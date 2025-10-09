import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/lib/models/notification";
import { withCORS } from "@/lib/cors";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const userHeader = req.headers.get("user");
    if (!userHeader) {
      return withCORS(
        NextResponse.json({ message: "User header missing" }, { status: 400 })
      );
    }

    // ✅ Parse the user header
    let userId: string | null = null;
    try {
      const parsedUser = JSON.parse(userHeader);
      userId = parsedUser?.id; // adjust this key if it's 'id' in your app
    } catch (err) {
      console.error("Invalid user header:", err);
      return withCORS(
        NextResponse.json({ message: "Invalid user header" }, { status: 400 })
      );
    }

    if (!userId) {
      return withCORS(
        NextResponse.json({ message: "User ID missing" }, { status: 400 })
      );
    }

    // ✅ Correct filter based on Notification model field
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    return withCORS(
      NextResponse.json({
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount,
      })
    );
  } catch (err) {
    console.error(err);
    return withCORS(
      NextResponse.json({ message: "Server error" }, { status: 500 })
    );
  }
}

