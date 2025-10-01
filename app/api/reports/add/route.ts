import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { withCORS } from "@/lib/cors";
import Report from "@/lib/models/report";

export async function POST(req: NextRequest) {
  try {
    const { title, content, author, type, status = false } = await req.json();

    if (!title || !content || !author || !type) {
      const response = NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
      return withCORS(response);
    }

    await connectDB();
    const newReport = new Report({ title, content, author, type, status });
    const blog = await newReport.save();

    const response = NextResponse.json(blog, { status: 200 });
    return withCORS(response);
  } catch (error) {
    const response = NextResponse.json(
      { message: "Error creating blog", error: String(error) },
      { status: 500 }
    );
    return withCORS(response);
  }
}

// Handle preflight requests (important for CORS)
export async function OPTIONS() {
  return withCORS(NextResponse.json({}, { status: 200 }));
}
