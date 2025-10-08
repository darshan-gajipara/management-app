/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signIn } from "next-auth/react";
import { withBgImage } from "@/lib/withbgimage";
import { useEffect, useState } from "react";

const registerSchema = yup.object({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid Email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  role: yup.string().required("Role is required"),

  // ✅ these 3 are optional, but conditionally required
  workspaceName: yup
    .string()
    .optional()
    .when("role", {
      is: "Admin",
      then: (schema) => schema.required("Workspace name is required"),
      otherwise: (schema) => schema.optional(),
    }),
  workspaceDescription: yup
    .string()
    .optional()
    .when("role", {
      is: "Admin",
      then: (schema) => schema.required("Workspace description is required"),
      otherwise: (schema) => schema.optional(),
    }),
  selectedWorkspace: yup
    .string()
    .optional()
    .when("role", {
      is: "Member",
      then: (schema) => schema.required("Select a workspace"),
      otherwise: (schema) => schema.optional(),
    }),
});


// // Make optional fields truly optional for react-hook-form compatibility
// type RegisterForm = {
//   firstName: string;
//   lastName: string;
//   username: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   role: string;
//   workspaceName?: string | undefined;
//   workspaceDescription?: string | undefined;
//   selectedWorkspace?: string | undefined;
// };

type RegisterForm = yup.InferType<typeof registerSchema>;

function RegisterPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<{ _id: string; name: string }[]>([]);
  const [role, setRole] = useState<string>("");

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema) as any,
  });

  const selectedRole = watch("role");

  // ✅ Fetch all available workspaces for Member selection
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch("/api/workspaces");
        if (res.ok) {
          const data = await res.json();
          setWorkspaces(data);
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    };
    fetchWorkspaces();
  }, []);

  // ✅ Handle Register Submit
  const onSubmit = async (data: RegisterForm) => {
    const { workspaceName, workspaceDescription, selectedWorkspace, ...rest } = data;

    const payload: any = {
      ...rest,
    };

    if (data.role === "Admin") {
      payload.workspaceData = {
        name: workspaceName,
        description: workspaceDescription,
      };
    }

    if (data.role === "Member") {
      payload.workspaceId = selectedWorkspace;
    }

    console.log("Register Payload:", payload);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Register failed");

      localStorage.setItem("token", result?.JWT_Token);
      router.push("/dashboard");
    } catch (err) {
      console.error("Error registering:", err);
    }
  };

  // ✅ Google & GitHub Auth
  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };
  const handleGitHubLogin = async () => {
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* First Name */}
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input {...register("firstName")} />
              {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input {...register("lastName")} />
              {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...register("email")} type="email" />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label>Username</Label>
              <Input {...register("username")} />
              {errors.username && <p className="text-red-500">{errors.username.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <Input {...register("password")} type="password" />
              {errors.password && <p className="text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input {...register("confirmPassword")} type="password" />
              {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                onValueChange={(value) => {
                  setValue("role", value);
                  setRole(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500">{errors.role.message}</p>}
            </div>

            {/* If Admin → show workspace fields */}
            {selectedRole === "Admin" && (
              <>
                <div className="space-y-2">
                  <Label>Workspace Name</Label>
                  <Input {...register("workspaceName")} />
                  {errors.workspaceName && <p className="text-red-500">{errors.workspaceName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Workspace Description</Label>
                  <Input {...register("workspaceDescription")} />
                  {errors.workspaceDescription && <p className="text-red-500">{errors.workspaceDescription.message}</p>}
                </div>
              </>
            )}

            {/* If Member → show workspace dropdown */}
            {selectedRole === "Member" && (
              <div className="space-y-2">
                <Label>Select Workspace</Label>
                <Select onValueChange={(value) => setValue("selectedWorkspace", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((ws) => (
                      <SelectItem key={ws._id} value={ws._id}>
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.selectedWorkspace && (
                  <p className="text-red-500">{errors.selectedWorkspace.message}</p>
                )}
              </div>
            )}

            {/* Register Button */}
            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleGoogleLogin}>
              <FcGoogle className="mr-2 text-xl" />
              Register with Google
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleGitHubLogin}>
              <FaGithub className="mr-2 text-xl" />
              Register with GitHub
            </Button>
          </div>

          {/* Link to Login */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default withBgImage(RegisterPage);
