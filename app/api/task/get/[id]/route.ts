import { withCORS } from "@/lib/cors";
import connectDB from "@/lib/db";
import Task from "@/lib/models/task";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        await connectDB();

        const task = await Task.findById(id);
        if (!task) {
            const response = NextResponse.json({ message: "Task not found" }, { status: 404 });
            return withCORS(response);
        }

        const response = NextResponse.json(task, { status: 200 });
        return withCORS(response);

    } catch (error) {
        const response = NextResponse.json(
            { message: "Error fetching Task", error: String(error) },
            { status: 500 }
        );
        return withCORS(response);
    }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
    return withCORS(NextResponse.json({}, { status: 200 }));
}
