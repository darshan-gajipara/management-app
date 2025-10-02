import { withCORS } from "@/lib/cors";
import connectDB from "@/lib/db";
import Task from "@/lib/models/task";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await context.params;

        if (!id) {
            const response = NextResponse.json({ message: "Blog id is required" }, { status: 400 });
            return withCORS(response);
        }


        const { title, description, group, currentStatus, scheduledDate } = await req.json();

        if (!title || !description || !group || !scheduledDate) {
            const response = NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
            return withCORS(response);
        }

        await connectDB();

        const task = await Task.findById(id);
        if (!task) {
            const response = NextResponse.json({ message: "Task not found" }, { status: 404 });
            return withCORS(response);
        }

        const updatedTsk = await Task.findByIdAndUpdate(
            id,
            { title, description, group, currentStatus, scheduledDate },
            { new: true }
        );

        const response = NextResponse.json(updatedTsk, { status: 200 });
        return withCORS(response);



    } catch (error) {
        const response = NextResponse.json(
            { message: "Error updating task", error: String(error) },
            { status: 500 }
        );
        return withCORS(response);
    }
}


// Handle preflight requests for CORS
export async function OPTIONS() {
    return withCORS(NextResponse.json({}, { status: 200 }));
}