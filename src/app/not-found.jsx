import Link from "next/link";
import {ArrowLeft, BookOpen} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {" "}
      <div className="space-y-6 max-w-2xl">
        <div className="text-9xl font-bold bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
          404
        </div>

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
          This Lesson Hasn’t Been Written Yet
        </h1>

        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
          The page you’re looking for doesn’t exist or may have been moved.
          Every journey teaches a lesson, but this one seems to be missing from
          our collection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-medium shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            href="/public-lessons"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            Explore Lessons
          </Link>
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-500 pt-4">
          Learnora • Share Wisdom. Inspire Growth.
        </p>
      </div>
    </div>
  );
}
