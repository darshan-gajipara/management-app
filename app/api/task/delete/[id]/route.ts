import { withCORS } from "@/lib/cors";
import connectDB from "@/lib/db";
import Task from "@/lib/models/task";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await context.params;
        await connectDB();

        const task = await Task.findById(id);
        if (!task) {
            const reponse = NextResponse.json({ message: "Task not found" }, { status: 404 });
            return withCORS(reponse);
        }

        const deletedTask = await Task.findByIdAndDelete(id);
        const response = NextResponse.json(deletedTask, { status: 200 });
        return withCORS(response);

    } catch (error) {
        const response = NextResponse.json(
            { message: "Error deleting Task", error: String(error) },
            { status: 500 }
        );
        return withCORS(response);
    }
}


// Handle preflight requests for CORS
export async function OPTIONS() {
    return withCORS(NextResponse.json({}, { status: 200 }));
}