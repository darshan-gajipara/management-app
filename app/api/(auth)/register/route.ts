import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { GenerateJWT } from "@/lib/GenerateJWT";
import { withCORS } from "@/lib/cors";
import User from "@/lib/models/user";
import WorkSpace from "@/lib/models/workSpace";
import Cookies from "js-cookie";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, username, password, role, workspaceData, workspaceId } = await req.json();

    if (!firstName || !lastName || !email || !username || !password || !role) {
      return withCORS(
        NextResponse.json({ message: "All fields are required" }, { status: 400 })
      );
    }

    await connectDB();

    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
      return withCORS(
        NextResponse.json({ message: "User already registered!!" }, { status: 400 })
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let workspaceToAssign = null;

    // 🔹 If role is Admin → Create new workspace
    if (role === "Admin") {
      if (!workspaceData?.name || !workspaceData?.description) {
        return withCORS(
          NextResponse.json({ message: "Workspace name & description required for Admin" }, { status: 400 })
        );
      }

      const newWorkspace = await WorkSpace.create({
        name: workspaceData.name,
        description: workspaceData.description,
        adminId: null, // temporarily null, will update after user creation
        memberIds: [],
      });

      workspaceToAssign = newWorkspace._id;
    }

    // 🔹 If role is Member → must include workspaceId
    if (role === "Member") {
      if (!workspaceId) {
        return withCORS(
          NextResponse.json({ message: "workspaceId is required for Member" }, { status: 400 })
        );
      }
      workspaceToAssign = workspaceId;
    }

    // ✅ Create User
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      role,
      workspaceId: workspaceToAssign,
    });

    // 🔹 If Admin → update workspace with adminId
    if (role === "Admin" && workspaceToAssign) {
      await WorkSpace.findByIdAndUpdate(workspaceToAssign, {
        adminId: newUser._id,
      });
    }

    // 🔹 If Member → add to workspace memberIds
    if (role === "Member" && workspaceToAssign) {
      await WorkSpace.findByIdAndUpdate(workspaceToAssign, {
        $push: { memberIds: newUser._id },
      });
    }

    const data = {
      firstName,
      lastName,
      email,
      username,
      id: newUser._id,
      role,
      workspaceId: workspaceToAssign,
    };

        const JWT_Token = await GenerateJWT(data);

        return withCORS(NextResponse.json({ username, JWT_Token: JWT_Token }, { status: 200 }))

    } catch (error) {
        return withCORS(NextResponse.json(JSON.stringify(error)))
    }
}