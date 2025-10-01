import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { withCORS } from "@/lib/cors";
import Report from "@/lib/models/report";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ await params

    if (!id) {
      const response = NextResponse.json({ message: "Blog id is required" }, { status: 400 });
      return withCORS(response);
    }

    const { title, content, author, type, status = false } = await req.json();

    if (!title || !content || !author || !type) {
      const response = NextResponse.json({ message: "All fields are required" }, { status: 400 });
      return withCORS(response);
    }

    await connectDB();

    const report = await Report.findById(id);
    if (!report) {
      const response = NextResponse.json({ message: "Report not found" }, { status: 404 });
      return withCORS(response);
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { title, content, author, status , type },
      { new: true }
    );

    const response = NextResponse.json(updatedReport, { status: 200 });
    return withCORS(response);
  } catch (error) {
    const response = NextResponse.json(
      { message: "Error updating blog", error: String(error) },
      { status: 500 }
    );
    return withCORS(response);
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return withCORS(NextResponse.json({}, { status: 200 }));
}
