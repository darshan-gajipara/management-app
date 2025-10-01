"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Globe, FileText, ShoppingCart } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  // Example Data
  const salesData = [
    { month: "Jan", revenue: 4000, profit: 2400 },
    { month: "Feb", revenue: 3000, profit: 1398 },
    { month: "Mar", revenue: 2000, profit: 9800 },
    { month: "Apr", revenue: 2780, profit: 3908 },
    { month: "May", revenue: 1890, profit: 4800 },
    { month: "Jun", revenue: 2390, profit: 3800 },
    { month: "Jul", revenue: 3490, profit: 4300 },
  ];

  const usersData = [
    { role: "Admin", value: 12 },
    { role: "Managers", value: 30 },
    { role: "Employees", value: 58 },
  ];

  const users = [
    { name: "Alice Johnson", email: "alice@example.com", status: "Active" },
    { name: "Bob Smith", email: "bob@example.com", status: "Pending" },
    { name: "Charlie Lee", email: "charlie@example.com", status: "Active" },
    { name: "Diana Adams", email: "diana@example.com", status: "Inactive" },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="p-6 space-y-8">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Todays Money</CardTitle>
            <Wallet className="h-6 w-6 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$53,000</div>
            <p className="text-green-500 text-sm">+55%</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Todays Users</CardTitle>
            <Globe className="h-6 w-6 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,300</div>
            <p className="text-green-500 text-sm">+5%</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Clients</CardTitle>
            <FileText className="h-6 w-6 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+3,020</div>
            <p className="text-red-500 text-sm">-14%</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-6 w-6 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$173,000</div>
            <p className="text-green-500 text-sm">+8%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Line Chart */}
        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Profit (Monthly)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0088FE" />
                <Line type="monotone" dataKey="profit" stroke="#00C49F" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Revenue Comparison</CardTitle>
          </CardHeader>
          <CardContent className=" h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
                <Bar dataKey="profit" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usersData}
                  dataKey="value"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {usersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1E1E2F] text-white rounded-2xl shadow-lg col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Latest Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {users.map((user, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
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
      </div>
    </div>
  );
}
