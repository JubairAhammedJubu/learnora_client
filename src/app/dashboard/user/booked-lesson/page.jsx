import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import BookedLessonsClient from "./BookedLessonsClient";

export default async function BookedTicketsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return <BookedLessonsClient user={session.user} />;
}