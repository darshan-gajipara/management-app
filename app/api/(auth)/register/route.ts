import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { GenerateJWT } from "@/lib/GenerateJWT";
import { withCORS } from "@/lib/cors";
import User from "@/lib/models/user";

export async function POST(req: NextRequest) {

    try {
        const { firstName, lastName, email, username, password } = await req.json();
        if (!firstName || !lastName || !email || !username || !password) {
            return withCORS(NextResponse.json({ message: "All fields are required" }, { status: 400 }))
        }
        await connectDB();

        const userAvailable = await User.findOne({ email })
        if (userAvailable) {
            return withCORS(NextResponse.json({ message: "User already registered!!" }, { status: 400 }))
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword
        })
        console.log(`user created ${newUser}`);

        if (!newUser) {
            return withCORS(NextResponse.json({ message: "Something went wrong!!" }, { status: 500 }))
        }

        const data = {
            firstName,
            lastName,
            email,
            username,
            id: newUser._id
        }

        const JWT_Token = await GenerateJWT(data);

        return withCORS(NextResponse.json({ username, JWT_Token: JWT_Token }, { status: 200 }))

    } catch (error) {
        return withCORS(NextResponse.json(JSON.stringify(error)))
    }
}