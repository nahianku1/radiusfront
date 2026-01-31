import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import axios from "axios";
import {
  Users,
  Activity,
  Server,
  Plus,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Wifi,
  DollarSign,
  Cpu,
  HardDrive,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { IUser } from "@/types/user.interface";
import type { IPackage } from "@/types/package.interface";
import { UsersDataTable } from "./users/components/UsersDataTable";

export const Route = createFileRoute("/")({
  component: DashboardLanding,
});

function DashboardLanding() {
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalPackages: 0,
    activeNas: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [recentUsers, setRecentUsers] = React.useState<IUser[]>([]);
  const [packages, setPackages] = React.useState<IPackage[]>([]);

  // Mock System Data State
  const [cpuData, setCpuData] = React.useState<
    { time: number; value: number }[]
  >([]);
  const [ramUsage, setRamUsage] = React.useState(45); // Initial mock value
  const [diskUsage, setDiskUsage] = React.useState(62);

  const fetchStats = async () => {
    try {
      const [usersRes, packagesRes, nasRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/users/getall-users`),
        axios.get(`${import.meta.env.VITE_API_URL}/services/getall-service`),
        axios.get(`${import.meta.env.VITE_API_URL}/nas/getall-nas`),
      ]);

      setStats({
        totalUsers: usersRes.data.data.result?.length || 0,
        onlineUsers:
          usersRes.data.data.result?.filter(
            (u: { is_online?: boolean }) => u.is_online,
          ).length || 0,
        totalPackages: packagesRes.data.data?.length || 0,
        activeNas: nasRes.data.data?.length || 0,
      });

      // Keep only top 5 for simplified view, but allow edit/delete actions
      setRecentUsers(usersRes.data.data.result?.slice(0, 5) || []);
      setPackages(packagesRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  // Poll Live System Data
  React.useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/system/stats`,
        );

        if (data.success && data.data) {
          const { cpu, ram, disk } = data.data;

          setCpuData((prev) => {
            const now = Date.now();
            const newData = [...prev, { time: now, value: cpu }];
            return newData.slice(-30);
          });

          setRamUsage(ram);
          setDiskUsage(disk);
        }
      } catch (error) {
        console.error("Failed to fetch system stats", error);
      }
    };

    fetchSystemStats(); // Initial fetch
    const interval = setInterval(fetchSystemStats, 2000); // Poll every 2s

    return () => clearInterval(interval);
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {greeting()}, Admin
          </h1>
          <p className="text-slate-500 font-medium">
            Here's what's happening with your network today.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border shadow-xs animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-sm font-bold text-slate-700">
            System Operational
          </span>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Subscribers",
            value: stats.totalUsers,
            trend: "+12% this month",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
          {
            title: "Active Sessions",
            value: stats.onlineUsers,
            trend: "Live now",
            icon: Wifi,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
          },
          {
            title: "Active Packages",
            value: stats.totalPackages,
            trend: "4 tiers available",
            icon: DollarSign,
            color: "text-violet-600",
            bg: "bg-violet-50",
            border: "border-violet-100",
          },
          {
            title: "Network Nodes",
            value: stats.activeNas,
            trend: "All systems go",
            icon: Server,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className={`border ${stat.border} shadow-sm bg-white/60 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300`}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900">
                    {loading ? "-" : stat.value}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Register Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
              <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">New Subscriber</h3>
                  <p className="text-blue-100 text-sm mt-1">
                    Onboard a new user with ease.
                  </p>
                </div>
                <Link to="/users/new" className="inline-block">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold border-0 mt-2">
                    Start Registration
                  </Button>
                </Link>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500">
                <Users size={140} />
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="grid gap-4">
              <Link
                to="/packages/new"
                className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800">Add Package</h4>
                    <p className="text-xs text-slate-400">
                      Update pricing tiers
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/nas/new"
                className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Server className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800">Add NAS Node</h4>
                    <p className="text-xs text-slate-400">
                      Expand infrastructure
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>

        {/* System Health / Monitor */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">System Monitor</h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-6 shadow-sm">
            {/* CPU Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-bold text-slate-700">
                    CPU Load
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {cpuData.length > 0 ? cpuData[cpuData.length - 1].value : 0}%
                </span>
              </div>
              <div className="h-24 w-full bg-violet-50/50 rounded-xl overflow-hidden relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuData}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      content={<></>}
                      cursor={{ stroke: "#8b5cf6", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCpu)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RAM & Disk Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* RAM Usage */}
              <div className="p-3 bg-slate-50 rounded-2xl flex flex-col items-center justify-center relative">
                <h5 className="text-xs font-bold text-slate-500 mb-2">
                  RAM Usage
                </h5>
                <div className="w-20 h-20 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Used", value: ramUsage, color: "#10b981" },
                          {
                            name: "Free",
                            value: 100 - ramUsage,
                            color: "#e2e8f0",
                          },
                        ]}
                        innerRadius={25}
                        outerRadius={35}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {[
                          { name: "Used", value: ramUsage, color: "#10b981" },
                          {
                            name: "Free",
                            value: 100 - ramUsage,
                            color: "#e2e8f0",
                          },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-700">
                      {ramUsage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Disk Usage */}
              <div className="p-3 bg-slate-50 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-bold text-slate-500">Disk</span>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-1">
                    <span>Used</span>
                    <span>{diskUsage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${diskUsage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-right">
                    450GB Free
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-800">Recent Users</h2>
        </div>

        <UsersDataTable
          data={recentUsers}
          packages={packages}
          loading={loading}
          onRefresh={fetchStats}
        />
      </div>
    </div>
  );
}
