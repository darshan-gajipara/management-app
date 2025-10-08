import { withCORS } from "@/lib/cors";
import connectDB from "@/lib/db";
import { GenerateJWT } from "@/lib/GenerateJWT";
import "@/lib/models/workSpace"; // ensure model is registered
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        
        if (!email || !password) {
            return withCORS(
                NextResponse.json(
                    { message: "All fields are required" }, 
                    { status: 400 }
                )
            );
        }
        
        await connectDB();
        const user = await User.findOne({ email }).populate("workspaceId", "name");
        if (!user) {
            return withCORS(
                NextResponse.json(
                    { message: "User not found!!" }, 
                    { status: 404 }
                )
            );
        }
        
        console.log("user => ", user);
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return withCORS(
                NextResponse.json(
                    { message: "Invalid Email or Password!!" }, 
                    { status: 401 }
                )
            );
        }
        
        const data = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            role: user.role,
            id: user._id.toString(),
            workspace: user?.workspaceId?.name
        };
        
        // Generate JWT Token
        const JWT_Token = await GenerateJWT(data);
        
        // Create response
        const response = withCORS(
            NextResponse.json(
                { 
                    JWT_Token: JWT_Token,
                    user: data,
                    message: "Login successful" 
                }, 
                { status: 200 }
            )
        );
        
        // Set cookie for middleware to access
        // Using same naming convention as NextAuth
        const isProduction = process.env.NODE_ENV === "production";
        // Set cookie with proper configuration to persist across refreshes
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction, // Only secure in production (HTTPS)
            sameSite: "lax" as const,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days, 
            path: "/",
        };
        
        // Set the session token cookie
        const cookieName = isProduction 
            ? "__Secure-next-auth.session-token" 
            : "next-auth.session-token";
        
        response.cookies.set(cookieName, JWT_Token, cookieOptions);
        
        return response;
    } catch (error) {
        console.error("Login error:", error);
        return withCORS(
            NextResponse.json(
                { 
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : "Unknown error"
                }, 
                { status: 500 }
            )
        );
    }
}