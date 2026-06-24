"use client";

import {useState, useEffect} from "react";
import {motion} from "motion/react";
import Link from "next/link";
import {
  BookOpen,
  Heart,
  PenLine,
  Star,
  ArrowRight,
  Loader2,
  TrendingUp,
  Clock,
  Sparkles,
  Plus,
  Eye,
} from "lucide-react";
import {authClient, useSession} from "@/lib/auth-client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function UserOverviewClient({user: serverUser}) {
  const {data: session} = useSession();
  const user = session?.user || serverUser;

  const [myLessons, setMyLessons] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const s = await authClient.getSession();
      const token = s?.data?.session?.token;
      const headers = {authorization: `Bearer ${token}`};
      const userId = s?.data?.user?.id;

      const [lessonsRes, favsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/lessons/user/${userId}`,
          {headers},
        ),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/favorites`, {headers}),
      ]);

      const lessonsData = await lessonsRes.json();
      const favsData = await favsRes.json();

      setMyLessons(Array.isArray(lessonsData) ? lessonsData : []);
      setFavorites(Array.isArray(favsData) ? favsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  // Weekly contributions chart — last 7 days
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-US", {weekday: "short"});
    const dateStr = d.toISOString().split("T")[0];
    const count = myLessons.filter((l) => {
      const created = new Date(l.createdAt).toISOString().split("T")[0];
      return created === dateStr;
    }).length;
    return {day: label, lessons: count};
  });

  const recentLessons = [...myLessons]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const featuredCount = myLessons.filter((l) => l.featured).length;
  const premiumCount = myLessons.filter(
    (l) => l.accessLevel === "premium",
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 pt-8 max-w-6xl mx-auto space-y-6 mt-4">
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
            <p className="text-white/70 text-sm font-medium mb-1">
              Welcome back 👋
            </p>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-white/60 text-sm mt-1">
              {user?.isPremium
                ? "⭐ Premium member — share unlimited lessons"
                : "Free plan — upgrade to share premium lessons"}
            </p>
          </div>
          <Link
            href="/dashboard/user/add-lesson"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white text-sm font-semibold transition-all border border-white/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add New Lesson
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.1}}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: "My Lessons",
            value: myLessons.length,
            icon: BookOpen,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            border: "border-amber-100 dark:border-amber-800",
            href: "/dashboard/user/my-lessons",
          },
          {
            label: "Saved Lessons",
            value: favorites.length,
            icon: Heart,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-900/20",
            border: "border-rose-100 dark:border-rose-800",
            href: "/dashboard/user/favorites",
          },
          {
            label: "Featured",
            value: featuredCount,
            icon: Star,
            color: "text-yellow-600 dark:text-yellow-400",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
            border: "border-yellow-100 dark:border-yellow-800",
            href: "/dashboard/user/my-lessons",
          },
          {
            label: "Premium Posts",
            value: premiumCount,
            icon: Sparkles,
            color: "text-violet-600 dark:text-violet-400",
            bg: "bg-violet-50 dark:bg-violet-900/20",
            border: "border-violet-100 dark:border-violet-800",
            href: "/dashboard/user/my-lessons",
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

      {/* Chart + Recent Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Contributions Chart */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.2}}
          className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Weekly Contributions
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              Last 7 days
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
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
                formatter={(value) => [
                  `${value} lesson${value !== 1 ? "s" : ""}`,
                  "Posted",
                ]}
              />
              <Area
                type="monotone"
                dataKey="lessons"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#userGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Lessons */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.25}}
          className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Recently Added
            </h2>
            <Link
              href="/dashboard/user/my-lessons"
              className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[180px] gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <PenLine className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-sm text-gray-400">No lessons yet</p>
              <Link
                href="/dashboard/user/add-lesson"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold transition-all"
              >
                Write your first lesson
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLessons.map((lesson, i) => (
                <div
                  key={lesson._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(lesson.createdAt).toLocaleDateString(
                          "en-BD",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>
                      {lesson.featured && (
                        <span className="flex items-center gap-0.5 text-yellow-500">
                          <Star className="w-3 h-3 fill-yellow-400" /> Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/lessons/${lesson._id}`}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-amber-500 hover:border-amber-300 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Shortcuts */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.3}}
        className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Add Lesson",
              desc: "Share your wisdom",
              icon: PenLine,
              href: "/dashboard/user/add-lesson",
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-900/20",
              border:
                "border-amber-100 dark:border-amber-800 hover:border-amber-300",
            },
            {
              label: "My Lessons",
              desc: "Manage your posts",
              icon: BookOpen,
              href: "/dashboard/user/my-lessons",
              color: "text-indigo-600 dark:text-indigo-400",
              bg: "bg-indigo-50 dark:bg-indigo-900/20",
              border:
                "border-indigo-100 dark:border-indigo-800 hover:border-indigo-300",
            },
            {
              label: "Saved Lessons",
              desc: "Your favorites",
              icon: Heart,
              href: "/dashboard/user/favorites",
              color: "text-rose-600 dark:text-rose-400",
              bg: "bg-rose-50 dark:bg-rose-900/20",
              border:
                "border-rose-100 dark:border-rose-800 hover:border-rose-300",
            },
            {
              label: user?.isPremium ? "Premium Active" : "Upgrade Plan",
              desc: user?.isPremium
                ? "Full access unlocked"
                : "Unlock premium lessons",
              icon: Sparkles,
              href: user?.isPremium ? "/lessons" : "/pricing",
              color: "text-violet-600 dark:text-violet-400",
              bg: "bg-violet-50 dark:bg-violet-900/20",
              border:
                "border-violet-100 dark:border-violet-800 hover:border-violet-300",
            },
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <div
                className={`flex flex-col gap-2 p-4 rounded-xl border ${action.border} bg-white dark:bg-[#1a1d24] hover:shadow-sm transition-all cursor-pointer`}
              >
                <div
                  className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}
                >
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${action.color}`}>
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
