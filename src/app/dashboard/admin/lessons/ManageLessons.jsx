"use client";

import {useState, useEffect} from "react";
import {motion} from "motion/react";
import {
  BookOpen,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Filter,
  Star,
  Flag,
  Eye,
  EyeOff,
  Sparkles,
  SparklesIcon,
  Globe,
  Lock,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import {authClient} from "@/lib/auth-client";
import Link from "next/link";

const ACCESS_CONFIG = {
  free: {
    label: "Free",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: Globe,
  },
  premium: {
    label: "Premium",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    icon: Lock,
  },
};

export default function ManageLessonsClient({currentUser}) {
  const [lessons, setLessons] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [filterAccess, setFilterAccess] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterFlag, setFilterFlag] = useState("all"); // all | flagged | featured | reviewed
  const [deleteConfirm, setDeleteConfirm] = useState(null); // lesson._id to confirm

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const s = await authClient.getSession();
      const token = s?.data?.session?.token;
      const headers = {authorization: `Bearer ${token}`};

      const [lessonsRes, reportsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/lessons`, {
          headers,
        }),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reports`, {headers}),
      ]);

      const lessonsData = await lessonsRes.json();
      const reportsData = await reportsRes.json();

      setLessons(Array.isArray(lessonsData) ? lessonsData : []);
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch {
      toast.error("Failed to load lessons");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const getToken = async () => {
    const s = await authClient.getSession();
    return s?.data?.session?.token;
  };

  // Toggle featured
  const handleFeatured = async (lessonId, featured, title) => {
    setActionLoading(lessonId + "featured");
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/lessons/${lessonId}/featured`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({featured}),
        },
      );
      if (res.ok) {
        toast.success(
          featured
            ? `"${title}" is now featured!`
            : `"${title}" removed from featured.`,
        );
        setLessons((prev) =>
          prev.map((l) => (l._id === lessonId ? {...l, featured} : l)),
        );
      } else {
        toast.error("Failed to update featured status");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  // Mark as reviewed
  const handleReviewed = async (lessonId, reviewed, title) => {
    setActionLoading(lessonId + "reviewed");
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({reviewed}),
        },
      );
      if (res.ok) {
        toast.success(
          reviewed
            ? `"${title}" marked as reviewed.`
            : `"${title}" review removed.`,
        );
        setLessons((prev) =>
          prev.map((l) => (l._id === lessonId ? {...l, reviewed} : l)),
        );
      } else {
        toast.error("Failed to update review status");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete with confirmation
  const handleDelete = async (lessonId) => {
    setActionLoading(lessonId + "delete");
    setDeleteConfirm(null);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/lessons/${lessonId}`,
        {
          method: "DELETE",
          headers: {authorization: `Bearer ${token}`},
        },
      );
      if (res.ok) {
        toast.success("Lesson deleted successfully!");
        setLessons((prev) => prev.filter((l) => l._id !== lessonId));
      } else {
        toast.error("Failed to delete lesson");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  // Derived data
  const flaggedIds = new Set(reports.map((r) => r.lessonId));
  const categories = [
    "all",
    ...new Set(lessons.map((l) => l.category).filter(Boolean)),
  ];

  const filtered = lessons.filter((l) => {
    const matchSearch = search
      ? l.title?.toLowerCase().includes(search.toLowerCase()) ||
        l.authorName?.toLowerCase().includes(search.toLowerCase()) ||
        l.category?.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchAccess =
      filterAccess === "all" ? true : l.accessLevel === filterAccess;
    const matchCategory =
      filterCategory === "all" ? true : l.category === filterCategory;
    const matchFlag =
      filterFlag === "all"
        ? true
        : filterFlag === "flagged"
          ? flaggedIds.has(l._id?.toString())
          : filterFlag === "featured"
            ? l.featured === true
            : filterFlag === "reviewed"
              ? l.reviewed === true
              : true;
    return matchSearch && matchAccess && matchCategory && matchFlag;
  });

  const counts = {
    total: lessons.length,
    free: lessons.filter((l) => l.accessLevel === "free").length,
    premium: lessons.filter((l) => l.accessLevel === "premium").length,
    flagged: lessons.filter((l) => flaggedIds.has(l._id?.toString())).length,
    featured: lessons.filter((l) => l.featured).length,
  };

  return (
    <div className="p-6 pt-8 max-w-7xl mx-auto space-y-6 mt-4">
      {/* Header */}
      <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Manage Lessons
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Review, feature, or remove lessons from the platform
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.1}}
        className="grid grid-cols-2 sm:grid-cols-5 gap-4"
      >
        {[
          {
            label: "Total Lessons",
            value: counts.total,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-900/20",
            icon: BookOpen,
          },
          {
            label: "Free Lessons",
            value: counts.free,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            icon: Globe,
          },
          {
            label: "Premium",
            value: counts.premium,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            icon: Lock,
          },
          {
            label: "Featured",
            value: counts.featured,
            color: "text-yellow-600 dark:text-yellow-400",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
            icon: Star,
          },
          {
            label: "Flagged",
            value: counts.flagged,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-900/20",
            icon: Flag,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3`}
          >
            <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center flex-shrink-0">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.15}}
        className="flex flex-col gap-3"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, author or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
          />
        </div>

        {/* Filter buttons row */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />

          {/* Access filter */}
          {["all", "free", "premium"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterAccess(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                filterAccess === f
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              {f === "all" ? "All Access" : f}
            </button>
          ))}

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Flag filter */}
          {[
            {value: "all", label: "All"},
            {value: "flagged", label: "🚩 Flagged"},
            {value: "featured", label: "⭐ Featured"},
            {value: "reviewed", label: "✅ Reviewed"},
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterFlag(f.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterFlag === f.value
                  ? "bg-indigo-500 text-white shadow-md"
                  : "bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No lessons found</p>
        </div>
      ) : (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 0.2}}
          className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Lesson
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Author
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Access
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Flags
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((lesson, i) => {
                  const accessConfig =
                    ACCESS_CONFIG[lesson.accessLevel] || ACCESS_CONFIG.free;
                  const AccessIcon = accessConfig.icon;
                  const lessonId = lesson._id?.toString();
                  const isFlagged = flaggedIds.has(lessonId);
                  const reportCount = reports.filter(
                    (r) => r.lessonId === lessonId,
                  ).length;

                  return (
                    <motion.tr
                      key={lessonId}
                      initial={{opacity: 0, x: -10}}
                      animate={{opacity: 1, x: 0}}
                      transition={{delay: i * 0.02}}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                        isFlagged ? "bg-rose-50/30 dark:bg-rose-900/5" : ""
                      }`}
                    >
                      {/* Lesson title */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px] flex items-center gap-1.5">
                              {lesson.title}
                              {lesson.featured && (
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                              )}
                              {lesson.reviewed && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              )}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(lesson.createdAt).toLocaleDateString(
                                "en-BD",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {lesson.authorName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {lesson.authorName}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[120px]">
                              {lesson.authorEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                          {lesson.category || "—"}
                        </span>
                      </td>

                      {/* Access level */}
                      <td className="px-4 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${accessConfig.bg} ${accessConfig.border} border`}
                        >
                          <AccessIcon
                            className={`w-3.5 h-3.5 ${accessConfig.color}`}
                          />
                          <span
                            className={`text-xs font-semibold ${accessConfig.color}`}
                          >
                            {accessConfig.label}
                          </span>
                        </div>
                      </td>

                      {/* Flags */}
                      <td className="px-4 py-4">
                        {isFlagged ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                            <Flag className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                              {reportCount} report{reportCount > 1 ? "s" : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <Link
                            href={`/lessons/${lessonId}`}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-indigo-500 hover:border-indigo-300 transition-all"
                            title="View lesson"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Feature / Unfeature */}
                          <button
                            onClick={() =>
                              handleFeatured(
                                lessonId,
                                !lesson.featured,
                                lesson.title,
                              )
                            }
                            disabled={!!actionLoading}
                            title={
                              lesson.featured
                                ? "Remove from featured"
                                : "Make featured"
                            }
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                              lesson.featured
                                ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100"
                                : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-600"
                            }`}
                          >
                            {actionLoading === lessonId + "featured" ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Star
                                className={`w-3 h-3 ${lesson.featured ? "fill-current" : ""}`}
                              />
                            )}
                            {lesson.featured ? "Unfeature" : "Feature"}
                          </button>

                          {/* Mark reviewed */}
                          <button
                            onClick={() =>
                              handleReviewed(
                                lessonId,
                                !lesson.reviewed,
                                lesson.title,
                              )
                            }
                            disabled={!!actionLoading}
                            title={
                              lesson.reviewed
                                ? "Remove reviewed mark"
                                : "Mark as reviewed"
                            }
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                              lesson.reviewed
                                ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                                : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
                            }`}
                          >
                            {actionLoading === lessonId + "reviewed" ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3 h-3" />
                            )}
                            {lesson.reviewed ? "Reviewed" : "Review"}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirm(lessonId)}
                            disabled={!!actionLoading}
                            title="Delete lesson"
                            className="p-1.5 rounded-lg border border-red-100 dark:border-red-900/30 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                          >
                            {actionLoading === lessonId + "delete" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <p className="text-xs text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {lessons.length}
              </span>{" "}
              lessons
            </p>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Delete Lesson?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This action is permanent and cannot be undone. The lesson will be
              removed from the platform.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={!!actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
