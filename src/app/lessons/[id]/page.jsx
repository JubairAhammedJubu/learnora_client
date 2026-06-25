import {notFound} from "next/navigation";
import {headers} from "next/headers";

import {auth} from "@/lib/auth";
import PublicLessonDetails from "./PublicLessonDetails";

export default async function LessonDetailsPage({params}) {
  const {id} = await params;

  // Current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${id}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return notFound();
    }

    const data = await response.json();

    if (!data?.lesson) {
      return notFound();
    }

    const lesson = data.lesson;

    const canAccess = lesson.accessLevel === "free" || session?.user?.isPremium;

    return (
      // eslint-disable-next-line react-hooks/error-boundaries
      <PublicLessonDetails
        lesson={lesson}
        user={session?.user || null}
        canAccess={canAccess}
      />
    );
  } catch (error) {
    console.error("Lesson fetch error:", error);

    return notFound();
  }
}

export async function generateMetadata({params}) {
  try {
    const {id} = await params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${id}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        title: "Lesson Not Found",
      };
    }

    const data = await response.json();

    const lesson = data.lesson;

    if (!lesson) {
      return {
        title: "Lesson Not Found",
      };
    }

    return {
      title: lesson.title,
      description: lesson.description?.slice(0, 160),

      openGraph: {
        title: lesson.title,
        description: lesson.description?.slice(0, 160),
        images: lesson.image
          ? [
              {
                url: lesson.image,
              },
            ]
          : [],
      },
    };
  } catch {
    return {
      title: "Life Lesson",
    };
  }
}
