import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { withCORS } from "@/lib/cors";
import Report from "@/lib/models/report";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ await params
    await connectDB();

    const report = await Report.findById(id);
    if (!report) {
      const response = NextResponse.json({ message: "Report not found" }, { status: 404 });
      return withCORS(response);
    }

    const deletedReport = await Report.findByIdAndDelete(id);
    const response = NextResponse.json(deletedReport, { status: 200 });
    return withCORS(response);
  } catch (error) {
    const response = NextResponse.json(
      { message: "Error deleting blog", error: String(error) },
      { status: 500 }
    );
    return withCORS(response);
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return withCORS(NextResponse.json({}, { status: 200 }));
}
