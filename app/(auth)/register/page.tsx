"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signIn } from "next-auth/react";
import { withBgImage } from "@/lib/withbgimage";

const registerSchema = yup.object({
    firstName: yup.string().required("FirstName is required "),
    lastName: yup.string().required("LastName is required "),
    username: yup.string().required("Username is required "),
    email: yup.string().email("Invalid Email formate").required("Email is Required"),
    password: yup
        .string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),

})
type RegisterForm = yup.InferType<typeof registerSchema>
function RegisterPage() {
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: yupResolver(registerSchema)
    });

    const onSubmit = async (data: RegisterForm) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...payload } = data;
        console.log("Register Data:", payload);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                throw new Error("Register failed");
            }

            const result = await res.json();
            console.log("Login success:", result);
            localStorage.setItem("token", result?.JWT_Token)
            router.push("/dashboard/reports");
        } catch (err) {
            console.error("Error logging in:", err);
        }


    };

    const handleGoogleLogin = async () => {
        await signIn("google", { callbackUrl: '/dashboard/reports' }) // Redirect after login
    };

    const handleGitHubLogin = async () => {
        await signIn("github", { callbackUrl: "/dashboard/reports" });
    };


    return (
        <div className="flex items-center justify-center min-h-screen ">
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
                            {errors.confirmPassword && (
                                <p className="text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

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
                        <Button
                            variant="outline"
                            className="w-full flex items-center justify-center"
                            onClick={handleGoogleLogin}
                        >
                            <FcGoogle className="mr-2 text-xl" />
                            Register with Google
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full flex items-center justify-center"
                            onClick={handleGitHubLogin}
                        >
                            <FaGithub className="mr-2 text-xl" />
                            Register with GitHub
                        </Button>
                    </div>

                    {/* Link to Login */}
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Login
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default withBgImage(RegisterPage);