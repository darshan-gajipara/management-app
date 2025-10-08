import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WorkSpace from "@/lib/models/workSpace";

export async function GET() {
  await connectDB();
  const workspaces = await WorkSpace.find({}, "_id name");
  return NextResponse.json(workspaces);
}
