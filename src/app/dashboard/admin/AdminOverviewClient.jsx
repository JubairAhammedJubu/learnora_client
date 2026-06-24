"use client";

import {useState, useEffect} from "react";
import {motion} from "motion/react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Flag,
  TrendingUp,
  Star,
  Loader2,
  ArrowRight,
  Shield,
  PenLine,
  UserCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import {authClient} from "@/lib/auth-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

export default function AdminOverviewClient({user}) {
  const [stats, setStats] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const s = await authClient.getSession();
      const token = s?.data?.session?.token;
      const headers = {authorization: `Bearer ${token}`};

      const [statsRes, lessonsRes, reportsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stats`),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/lessons`, {
          headers,
        }),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reports`, {headers}),
      ]);

      const statsData = await statsRes.json();
      const lessonsData = await lessonsRes.json();
      const reportsData = await reportsRes.json();

      setStats({
        ...statsData,
        totalReports: Array.isArray(reportsData) ? reportsData.length : 0,
        pendingReports: Array.isArray(reportsData)
          ? reportsData.filter((r) => r.status === "pending").length
          : 0,
      });
      setLessons(Array.isArray(lessonsData) ? lessonsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Lessons by category for bar chart
  const lessonsByCategory =
    stats?.byCategory?.slice(0, 6).map((item) => ({
      category:
        item.category?.length > 10
          ? item.category.slice(0, 10) + "…"
          : item.category || "Other",
      count: item.count,
    })) || [];

  // Lesson growth over last 7 days (derived from lessons data)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-US", {weekday: "short"});
    const dateStr = d.toISOString().split("T")[0];
    const count = lessons.filter((l) => {
      const created = new Date(l.createdAt).toISOString().split("T")[0];
      return created === dateStr;
    }).length;
    return {day: label, lessons: count};
  });

  // Today's new lessons
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysLessons = lessons.filter(
    (l) => new Date(l.createdAt).toISOString().split("T")[0] === todayStr,
  );

  // Most active contributors
  const contributorMap = {};
  lessons.forEach((l) => {
    if (!contributorMap[l.authorName]) {
      contributorMap[l.authorName] = {name: l.authorName, count: 0};
    }
    contributorMap[l.authorName].count++;
  });
  const topContributors = Object.values(contributorMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-2xl p-6 text-white"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-sm font-medium">
                Admin Dashboard
              </span>
            </div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Platform overview — Digital Life Lessons
            </p>
          </div>
          <Link
            href="/dashboard/admin/lessons"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white text-sm font-semibold transition-all border border-white/20 whitespace-nowrap"
          >
            Manage Lessons
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.1}}
        className="grid grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {[
          {
            label: "Total Users",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "text-indigo-500 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-900/20",
            border: "border-indigo-100 dark:border-indigo-800/50",
            href: "/dashboard/admin/users",
          },
          {
            label: "Total Lessons",
            value: stats?.totalLessons || 0,
            icon: BookOpen,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            border: "border-amber-100 dark:border-amber-800/50",
            href: "/dashboard/admin/lessons",
          },
          {
            label: "Premium Users",
            value: stats?.totalPremiumUsers || 0,
            icon: Star,
            color: "text-yellow-600 dark:text-yellow-400",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
            border: "border-yellow-100 dark:border-yellow-800/50",
            href: "/dashboard/admin/users",
          },
          {
            label: "Featured Lessons",
            value: stats?.totalFeatured || 0,
            icon: Sparkles,
            color: "text-cyan-600 dark:text-cyan-400",
            bg: "bg-cyan-50 dark:bg-cyan-900/20",
            border: "border-cyan-100 dark:border-cyan-800/50",
            href: "/dashboard/admin/lessons",
          },
          {
            label: "Reported Lessons",
            value: stats?.totalReports || 0,
            icon: Flag,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-900/20",
            border: "border-rose-100 dark:border-rose-800/50",
            href: "/dashboard/admin/reports",
          },
          {
            label: "Today's Lessons",
            value: todaysLessons.length,
            icon: PenLine,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            border: "border-emerald-100 dark:border-emerald-800/50",
            href: "/dashboard/admin/lessons",
          },
        ].map((stat, i) => (
          <Link key={i} href={stat.href}>
            <div
              className={`bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border ${stat.border} shadow-sm hover:shadow-md transition-all cursor-pointer`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lesson Growth (last 7 days) */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.2}}
          className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Lesson Growth — Last 7 Days
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="lessonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.2}
              />
              <XAxis dataKey="day" tick={{fontSize: 11, fill: "#9ca3af"}} />
              <YAxis
                tick={{fontSize: 11, fill: "#9ca3af"}}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1d24",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="lessons"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#lessonGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Lessons by Category */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.25}}
          className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Lessons by Category
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lessonsByCategory}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.2}
              />
              <XAxis
                dataKey="category"
                tick={{fontSize: 10, fill: "#9ca3af"}}
              />
              <YAxis
                tick={{fontSize: 11, fill: "#9ca3af"}}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1d24",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="count"
                fill="url(#adminBarGrad)"
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="adminBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row: Top Contributors + Pending Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contributors */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.3}}
          className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Most Active Contributors
            </h2>
            <Link
              href="/dashboard/admin/users"
              className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {topContributors.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No lessons yet.
              </p>
            ) : (
              topContributors.map((contributor, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {contributor.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {contributor.name}
                    </p>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        initial={{width: 0}}
                        animate={{
                          width:
                            topContributors[0]?.count > 0
                              ? `${(contributor.count / topContributors[0].count) * 100}%`
                              : "0%",
                        }}
                        transition={{
                          delay: 0.4 + i * 0.05,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-500 flex-shrink-0">
                    {contributor.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Reports & Quick Actions */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.35}}
          className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Reports Overview
          </h2>

          <div className="space-y-3 mb-6">
            {[
              {
                label: "Pending Reports",
                value: stats?.pendingReports || 0,
                color: "#f59e0b",
              },
              {
                label: "Total Reports",
                value: stats?.totalReports || 0,
                color: "#ef4444",
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {item.value}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{width: 0}}
                    animate={{
                      width:
                        stats?.totalReports > 0
                          ? `${(item.value / stats.totalReports) * 100}%`
                          : `${i === 0 ? 0 : 100}%`,
                    }}
                    transition={{
                      delay: 0.4 + i * 0.1,
                      duration: 0.8,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full"
                    style={{backgroundColor: item.color}}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2">
            <Link
              href="/dashboard/admin/reports"
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Review Reports
            </Link>
            <Link
              href="/dashboard/admin/users"
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Manage Users
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
