import { withCORS } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Task from "@/lib/models/task";
import Report from "@/lib/models/report";

// ✅ Helper: check if two dates are same day
function isSameLocalDate(date1: Date, date2: Date) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // ====== TASK DATA ======
        const tasks = await Task.find();
        const today = new Date();

        let completed = 0;
        let pending = 0;
        let hold = 0;

        const todayTasks = tasks.filter((t) =>
            isSameLocalDate(new Date(t.scheduledDate), today)
        );

        todayTasks.forEach((task) => {
            if (task.currentStatus === "Completed") completed++;
            else if (task.currentStatus === "Pending" || task.currentStatus === "In Progress") pending++;
            else if (task.currentStatus === "On Hold") hold++;
        });

        const total = todayTasks.length;

        const todayStats = {
            total: todayTasks.length,
            completed: todayTasks.filter((t) => t.currentStatus === "Completed").length,
            pending: todayTasks.filter(
                (t) => t.currentStatus === "Pending" || t.currentStatus === "In Progress"
            ).length,
            hold: todayTasks.filter((t) => t.currentStatus === "On Hold").length,
        };

        const pieChartData = [
            { name: "Completed", value: completed },
            { name: "Pending", value: pending },
            { name: "On Hold", value: hold },
        ];

        // ====== REPORT DATA ======
        const reports = await Report.find();

        // Group by month
        const monthlyData: Record<string, { Active: number; Inactive: number }> = {};

        reports.forEach((report) => {
            const created = new Date(report.createdAt);
            const month = created.toLocaleString("default", { month: "short" });

            if (!monthlyData[month]) {
                monthlyData[month] = { Active: 0, Inactive: 0 };
            }

            if (report.status) monthlyData[month].Active += 1;
            else monthlyData[month].Inactive += 1;
        });

        const reportChartData = Object.entries(monthlyData).map(([month, values]) => ({
            month,
            ...values,
        }));

        // ✅ Return everything together
        return withCORS(
            NextResponse.json(
                {
                    message: "Dashboard data fetched successfully",
                    pieChartData,
                    todayStats,
                    reportChartData,
                },
                { status: 200 }
            )
        );
    } catch (error) {
        console.error("Error in dashboard route:", error);
        return withCORS(
            NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
        );
    }
}

// ✅ Handle preflight requests for CORS
export async function OPTIONS() {
    return withCORS(NextResponse.json({}, { status: 200 }));
}
