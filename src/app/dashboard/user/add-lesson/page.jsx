import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import AddLessonClient from './AddLessonClient';

export default async function AddTicketPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return <AddLessonClient user={session?.user} />;
}