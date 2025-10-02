"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Table, LogOut, Menu, CalendarCheck, CalendarCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button"; // shadcn Button
import { ScrollArea } from "@/components/ui/scroll-area"; // optional for sidebar scrolling
import { signOut } from "next-auth/react";
import AxiosApi from "@/lib/axios";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSession } from "next-auth/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getPageTitle } from "@/lib/pageTitleHelper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<string>("");

    useEffect(() => {
        const fetchUser = async () => {
            const data = await getCurrentUser();
            const user = data?.firstName + '  ' + data?.lastName
            setUser(user);
        };
        fetchUser();
    }, [])

    const getCurrentUser = async () => {
        const res = await AxiosApi.get('/currentUser');
        return res.data;
    }

    const handleLogout = async () => {
        localStorage.removeItem("token");

        try {
            await signOut({ redirect: false });
        } catch (error) {
            console.warn("Google logout failed (maybe user was not logged in via Google):", error);
        }
        router.push("/login");
    }

    return (
        <div className="flex h-screen bg-[#0f172a] text-white">
            {/* Sidebar */}
            <aside
                className={cn(
                    "flex flex-col bg-[#1e293b] transition-all border-r border-gray-700",
                    sidebarOpen ? "w-64" : "w-20"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    {sidebarOpen && <h1 className="text-xl font-bold">Management App</h1>}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white p-1"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu size={20} />
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <nav className="flex flex-col gap-2">
                        <Link
                            href="/dashboard"
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 transition",
                                pathname === "/dashboard"
                                    ? "bg-blue-800 text-white"
                                    : "hover:bg-[#334155] text-gray-300"
                            )}
                        >
                            <LayoutDashboard size={20} />
                            {sidebarOpen && <span>Dashboard</span>}
                        </Link>

                        <Link
                            href="/dashboard/reports"
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 transition",
                                pathname === "/dashboard/reports"
                                    ? "bg-blue-800 text-white"
                                    : "hover:bg-[#334155] text-gray-300"
                            )}
                        >
                            <Table size={20} />
                            {sidebarOpen && <span>Reports</span>}
                        </Link>

                        <Link
                            href="/dashboard/task"
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 transition",
                                pathname === "/dashboard/task"
                                    ? "bg-blue-800 text-white"
                                    : "hover:bg-[#334155] text-gray-300"
                            )}
                        >
                            <CalendarCheck  size={20} />
                            {sidebarOpen && <span>Task</span>}
                        </Link>

                        <Link
                            href="/dashboard/task/taskInfo"
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 transition",
                                pathname === "/dashboard/task/taskInfo"
                                    ? "bg-blue-800 text-white"
                                    : "hover:bg-[#334155] text-gray-300"
                            )}
                        >
                            <CalendarCheck2  size={20} />
                            {sidebarOpen && <span>Task Info</span>}
                        </Link>
                    </nav>
                </ScrollArea>
            </aside>

            {/* Main content */}
            <div className="flex flex-col flex-1">
                {/* Navbar */}
                <header className="flex items-center justify-between bg-[#111827] px-6 py-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold">{getPageTitle(pathname)}</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-lg font-semibold">
                            Hello,&nbsp;welcome back <span className="text-green-600">{session ? session.user?.name : user}</span>
                        </div>



                        <AlertDialog>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="p-1">
                                            <LogOut size={16} />
                                        </Button>
                                    </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Logout</p>
                                </TooltipContent>
                            </Tooltip>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to Logout?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleLogout}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>


                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-[#0f172a]">{children}</main>
            </div>
        </div>
    );
}
