/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Table, LogOut, Menu, CalendarCheck, CalendarCheck2, ListTodo } from "lucide-react";
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
import { Bell } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import dateFormat from "@/lib/util/dateFormat";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");
    const [userWorkSpace, setUserWorkSpace] = useState<string>("");
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    useEffect(() => {
        const fetchUser = async () => {
            const data = await getCurrentUser();
            const user = data?.firstName + '  ' + data?.lastName
            setUser(user);
            setUserRole(data?.role || "");
            setUserWorkSpace(data?.workspace)
        };
        fetchUser();
    }, [])

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await AxiosApi.get("/notifications");
                const data = res.data || [];
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.isRead).length);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    const handleMarkAllAsRead = async () => {
        try {
            // ✅ API call to mark all as read
            await AxiosApi.patch("/notifications/mark-all-read", {}, {
            });

            // ✅ Update frontend state instantly
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };


    const getCurrentUser = async () => {
        const res = await AxiosApi.get('/currentUser');
        return res.data;
    }

    const handleLogout = async () => {
        localStorage.removeItem("token");
        await fetch("/api/logout", { method: "POST", credentials: "include" });
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

                        {userRole === "Admin" && (
                            <>
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
                                    <CalendarCheck size={20} />
                                    {sidebarOpen && <span>Task</span>}
                                </Link>
                            </>
                        )}

                        <Link
                            href="/dashboard/taskView"
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 transition",
                                pathname === "/dashboard/taskView"
                                    ? "bg-blue-800 text-white"
                                    : "hover:bg-[#334155] text-gray-300"
                            )}
                        >
                            <CalendarCheck2 size={20} />
                            {sidebarOpen && <span>Task View</span>}
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
                            <ListTodo size={20} />
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
                        {/* Greeting */}
                        <div className="text-lg font-semibold">
                            Hello,&nbsp;welcome back{" "}
                            <span className="text-green-600">
                                {session ? session.user?.name : user}
                            </span>
                            &nbsp;
                            (<span className="text-green-600">
                                {userRole + " of " + userWorkSpace}
                            </span>)
                        </div>

                        {/* 🔔 Notification Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="relative p-1">
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full"></span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>

                            {unreadCount > 0 && (<DropdownMenuContent
                                align="end"
                                className="w-80 bg-[#1e293b] text-white border border-gray-700"
                            >
                                <DropdownMenuLabel className="text-gray-300">
                                    Notifications
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-700" />

                                {notifications.length === 0 ? (
                                    <div className="p-3 text-sm text-gray-400">No notifications found.</div>
                                ) : (
                                    notifications.map((notif) => (
                                        <DropdownMenuItem
                                            key={notif._id}
                                            className="hover:bg-[#334155] cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-black">NT</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{notif.title}</p>
                                                    <p className="text-xs text-gray-400">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">
                                                        {dateFormat(notif.createdAt)}  {new Date(notif.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            second: "2-digit",
                                                            hour12: true,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                    ))
                                )}

                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem className="text-blue-400 hover:bg-[#334155] justify-center"
                                    onClick={handleMarkAllAsRead}>
                                    View All Notifications
                                </DropdownMenuItem>
                            </DropdownMenuContent>)}
                        </DropdownMenu>


                        {/* 🚪 Logout Button */}
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
