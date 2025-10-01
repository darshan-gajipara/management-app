import { withCORS } from "@/lib/cors";
import connectDB from "@/lib/db";
import { GenerateJWT } from "@/lib/GenerateJWT";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {

        const { email, password } = await req.json();
        if (!email || !password) {
            return withCORS(NextResponse.json({ message: "All fields are required" }, { status: 400 }))
        }
        await connectDB();

        const user = await User.findOne({ email })
        if (!user) {
            return withCORS(NextResponse.json({ message: "User not found!!" }, { status: 404 }))
        }
        console.log("user => ", user)

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return withCORS(NextResponse.json({ message: "Invalid Email or Password!!" }, { status: 401 }))
        }

        const data = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            id: user._id
        }

        // const JWT_Token = await GenerateJWT(data);
        const JWT_Token = await GenerateJWT(data);

        return withCORS(NextResponse.json({ JWT_Token: JWT_Token }, { status: 200 }))

    } catch (error) {
        return withCORS(NextResponse.json(JSON.stringify(error)))
    }
}