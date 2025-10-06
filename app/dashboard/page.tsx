/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Globe, FileText, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { getDashboardData } from "./dashboardSearvice";

export default function DashboardPage() {
  const [dashboardData, setdashboardData] = useState<any>(null);
  const COLORS = ["#00C49F", "#FFBB28", "#8884d8"]

  useEffect(() => {
    const fetchdashboardData = async () => {
      const data = await getDashboardData();
      setdashboardData(data)
    };
    fetchdashboardData();
  }, [])

  // ✅ Dummy users
  const users = [
    { name: "Alice Johnson", email: "alice@example.com", status: "Active" },
    { name: "Bob Smith", email: "bob@example.com", status: "Pending" },
    { name: "Charlie Lee", email: "charlie@example.com", status: "Active" },
    { name: "Diana Adams", email: "diana@example.com", status: "Inactive" },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* ✅ Task Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Todays Tasks</CardTitle>
            <Wallet className="h-6 w-6 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.todayStats?.total}</div>
            <p className="text-gray-400 text-sm">Total Tasks for Today</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Globe className="h-6 w-6 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.todayStats?.completed}</div>
            <p className="text-green-500 text-sm">
              {dashboardData?.todayStats?.total > 0
                ? `${Math.round(
                  (dashboardData?.todayStats?.completed / dashboardData?.todayStats?.total) * 100
                )}% done`
                : "0% done"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-6 w-6 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.todayStats?.pending}</div>
            <p className="text-yellow-400 text-sm">Work in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <ShoppingCart className="h-6 w-6 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.todayStats?.hold}</div>
            <p className="text-gray-400 text-sm">Paused for review</p>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* ✅ Line Chart: Report Active vs Inactive */}
        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Reports (Active vs Inactive)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData?.reportChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Active" stroke="#00C49F" />
                <Line type="monotone" dataKey="Inactive" stroke="#FF5555" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ✅ Pie Chart: Today's Task Status */}
        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Todays Task Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name} (${entry.value})`}
                >
                  {dashboardData?.pieChartData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Latest Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {users.map((user, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${user.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : user.status === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                      }`}
                  >
                    {user.status}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ✅ Bar Chart: Report Active vs Inactive */}
        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Reports (Active vs Inactive)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.reportChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Active" fill="#00C49F" />
                <Bar dataKey="Inactive" fill="#FF5555" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>


        {/* ✅ Latest Users */}

      </div>
    </div>
  );
}
