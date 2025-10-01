import connectDB from "@/lib/db";
import { PipelineStage } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { withCORS } from "@/lib/cors";
import Report from "@/lib/models/report";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      { $skip: skip },
      { $limit: limit },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // const blogs = await Report.aggregate(pipeline);
    const blogs = await Report.find();
    const total = await Report.countDocuments();

    const response = NextResponse.json(
      {
        data: blogs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );

    return withCORS(response);
  } catch (error) {
    const response = NextResponse.json(
      { message: "Error fetching blogs", error: String(error) },
      { status: 500 }
    );
    return withCORS(response);
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return withCORS(NextResponse.json({}, { status: 200 }));
}
