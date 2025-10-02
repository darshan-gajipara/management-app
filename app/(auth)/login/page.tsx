"use client";

import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signIn } from "next-auth/react";
import { withBgImage } from "@/lib/withbgimage";

const loginSchema = yup.object({
    email: yup.string().email("Invalid Email formate").required("Email is Required"),
    password: yup
        .string()
        .required("Password is required")

})
type LoginForm = yup.InferType<typeof loginSchema>

function LoginPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: yupResolver(loginSchema)
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Login failed");

            const result = await res.json();
            localStorage.setItem("token", result?.JWT_Token);
            router.push("/dashboard");
        } catch (err) {
            console.error("Error logging in:", err);
        }
    };

    const handleGoogleLogin = async () => {
        await signIn("google", { callbackUrl: '/dashboard' })
    };

    const handleGitHubLogin = async () => {
        await signIn("github", { callbackUrl: "/dashboard" });
    };


    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input {...register("email")} type="email" required />
                            {errors.email?.type === "required" && (
                                <p role="alert" className="text-danger">
                                    Email is required
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input {...register("password")} type="password" required />
                            {errors.password?.type === "required" && (
                                <p role="alert" className="text-danger">
                                    Password is required
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full">
                            Sign In
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-gray-300" />
                        <span className="mx-2 text-gray-500">or</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>

                    {/* Social Logins */}
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full flex items-center justify-center"
                            onClick={handleGoogleLogin}
                        >
                            <FcGoogle className="mr-2 text-xl" />
                            Sign in with Google
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full flex items-center justify-center"
                            onClick={handleGitHubLogin}
                        >
                            <FaGithub className="mr-2 text-xl" />
                            Sign in with GitHub
                        </Button>
                    </div>

                    {/* Register Link */}
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Don’t have an account?{" "}
                        <Link
                            href="/register"
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Register
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default withBgImage(LoginPage);