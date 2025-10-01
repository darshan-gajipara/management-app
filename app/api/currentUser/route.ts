import { withCORS } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    const userHeader = request.headers.get("user");
    const User  = JSON.parse(userHeader!)
    return withCORS(NextResponse.json(User,{status:200}))
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return withCORS(NextResponse.json({}, { status: 200 }));
}