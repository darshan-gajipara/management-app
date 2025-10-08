import connectDB from "@/lib/db";
import User from "@/lib/models/user";
import { NextRequest, NextResponse } from "next/server";
import { withCORS } from "@/lib/cors";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get role from query params
        const role = req.nextUrl.searchParams.get("role");

        if (!role) {
            return withCORS(
                NextResponse.json({ message: "Role is required" }, { status: 400 })
            );
        }

        // Find users by role
        const users = await User.find({ role }).select("firstName lastName email role");

        return withCORS(NextResponse.json(users, { status: 200 }));
    } catch (error) {
        return withCORS(
            NextResponse.json(
                { message: "Error fetching users", error: String(error) },
                { status: 500 }
            )
        );
    }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
    return withCORS(NextResponse.json({}, { status: 200 }));
}
