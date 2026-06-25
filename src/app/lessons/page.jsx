import {Suspense} from "react";
import {headers} from "next/headers";
import {auth} from "@/lib/auth"; // Your Better Auth instance
import PublicLesson from "./PublicLesson";

export default async function PublicLessonPage({searchParams}) {
  const params = await searchParams;

  // Get session for checking premium status
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f1117]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Loading lessons...
            </p>
          </div>
        </div>
      }
    >
      <PublicLesson
        initialParams={params}
        user={session?.user || null}
      />
    </Suspense>
  );
}
