"use client";

import {useState, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import {motion, AnimatePresence} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Heart,
  Star,
  Clock,
  Eye,
  Lock,
  ArrowRight,
  Users,
  Tag,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
  {value: "all", label: "All Categories"},
  {value: "Personal Growth", label: "Personal Growth"},
  {value: "Career", label: "Career"},
  {value: "Relationships", label: "Relationships"},
  {value: "Mindset", label: "Mindset"},
  {value: "Mistakes Learned", label: "Mistakes Learned"},
];

const EMOTIONAL_TONES = [
  {value: "all", label: "All Tones"},
  {value: "Motivational", label: "Motivational"},
  {value: "Sad", label: "Sad"},
  {value: "Realization", label: "Realization"},
  {value: "Gratitude", label: "Gratitude"},
];

const SORT_OPTIONS = [
  {value: "newest", label: "Newest First"},
  {value: "most_saved", label: "Most Saved"},
  {value: "most_liked", label: "Most Liked"},
];

export default function PublicLessonsClient({initialParams, user}) {
  const router = useRouter();

  const [lessons, setLessons] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState(initialParams?.search || "");
  const [category, setCategory] = useState(initialParams?.category || "all");
  const [emotionalTone, setEmotionalTone] = useState(
    initialParams?.emotionalTone || "all",
  );
  const [sortBy, setSortBy] = useState(initialParams?.sort || "newest");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "all") params.set("category", category);
      if (emotionalTone !== "all") params.set("emotionalTone", emotionalTone);
      if (sortBy !== "newest") params.set("sort", sortBy);
      params.set("page", page);
      params.set("perPage", perPage);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lessons?${params.toString()}`,
        {
          cache: "no-store",
        },
      );
      const data = await res.json();
      setLessons(data.lessons || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to load lessons");
    } finally {
      setIsLoading(false);
    }
  }, [search, category, emotionalTone, sortBy, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLessons();
  }, [fetchLessons]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLessons();
    // Update URL params
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (emotionalTone !== "all") params.set("tone", emotionalTone);
    if (sortBy !== "newest") params.set("sort", sortBy);
    router.push(`/lessons?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setEmotionalTone("all");
    setSortBy("newest");
    setPage(1);
    router.push("/lessons");
  };

  const totalPages = Math.ceil(total / perPage);
  const hasActiveFilters =
    search ||
    category !== "all" ||
    emotionalTone !== "all" ||
    sortBy !== "newest";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#0f1117] dark:to-[#15181f]">
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 overflow-visible bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#0f1117] via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
            className="text-center mb-10"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase rounded-full bg-white/20 border border-white/30 text-white">
              Explore Wisdom
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Life Lessons From the Community
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Discover meaningful insights, personal growth stories, and wisdom
              shared by people from all walks of life.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6, delay: 0.1}}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto"
          >
            <div className="flex gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search lessons by title or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </motion.form>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-16 relative z-20">
        {/* Filter Bar */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.2}}
          className="bg-white dark:bg-[#1a1d24] rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Category Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setCategory(cat.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    category === cat.value
                      ? "bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-lg"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  isFilterOpen
                    ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {isFilterOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{opacity: 0, height: 0}}
                animate={{opacity: 1, height: "auto"}}
                exit={{opacity: 0, height: 0}}
                transition={{duration: 0.3}}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Emotional Tone
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {EMOTIONAL_TONES.map((tone) => (
                          <button
                            key={tone.value}
                            onClick={() => {
                              setEmotionalTone(tone.value);
                              setPage(1);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                              emotionalTone === tone.value
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300"
                            }`}
                          >
                            {tone.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {lessons.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {total}
                </span>{" "}
                lessons
              </>
            )}
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#1a1d24] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="text-center py-24 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No lessons found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-semibold hover:from-indigo-500 hover:to-violet-400 transition-all"
            >
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {lessons.map((lesson, index) => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                index={index}
                user={user}
              />
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>

            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                    page === pageNum
                      ? "bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                      : "bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Lesson Card Component
function LessonCard({lesson, index, user}) {
  const isPremium = lesson.accessLevel === "premium";
  const isLocked = isPremium && (!user || !user.isPremium);

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, delay: index * 0.05}}
      whileHover={{y: -6}}
      className="group bg-white dark:bg-[#1a1d24] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* IMAGE SECTION */}
      <div className="relative h-48 overflow-hidden">
        {/* IMAGE (BLUR IF LOCKED) */}
        {lesson.image ? (
          <Image
            src={lesson.image}
            alt={lesson.title}
            fill
            className={`object-cover transition-all duration-500 ${
              isLocked ? "blur-md scale-110" : "group-hover:scale-105"
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white/40" />
          </div>
        )}

        {/* DARK OVERLAY FOR LOCKED CONTENT */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white px-4 text-center">
            <Lock className="w-8 h-8 mb-2" />
            <p className="text-sm font-semibold">Premium Content</p>
            <p className="text-xs opacity-80">Upgrade to unlock full lesson</p>
          </div>
        )}

        {/* TOP BADGES */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/50 text-white backdrop-blur">
          {isPremium ? "⭐ Premium" : "Free"}
        </div>

        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/50 text-white backdrop-blur">
          {lesson.emotionalTone}
        </div>

        {/* CATEGORY BADGE */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs bg-black/50 text-white backdrop-blur">
          {lesson.category}
        </div>

        {/* NETFLIX STYLE FADE */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="p-5">
        {/* TITLE */}
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-2">
          {lesson.title}
        </h3>

        {/* DESCRIPTION (BLUR IF LOCKED) */}
        <p
          className={`text-sm mt-2 text-gray-500 dark:text-gray-400 line-clamp-2 transition ${
            isLocked ? "blur-sm" : ""
          }`}
        >
          {lesson.description}
        </p>

        {/* CREATOR INFO */}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <img
            src={
              lesson.creatorPhoto ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                lesson.creatorName,
              )}&background=6366F1&color=fff`
            }
            className="w-6 h-6 rounded-full"
          />
          <span>{lesson.creatorName}</span>
        </div>

        {/* STATS */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {lesson.likesCount || 0}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            {lesson.favoritesCount || 5}
          </div>
        </div>

        {/* ACTION */}
        <div className="mt-4 flex items-center justify-between">
          {/* LOCKED STATE */}
          {isLocked ? (
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:opacity-90 transition"
            >
              🔒 Unlock Premium
            </Link>
          ) : (
            <Link
              href={`/lessons/${lesson._id}`}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-500 text-white hover:opacity-90 transition"
            >
              See Details →
            </Link>
          )}

          {/* LOCK LABEL */}
          {isLocked && (
            <span className="text-xs text-yellow-500 font-medium">
              Preview Locked
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}