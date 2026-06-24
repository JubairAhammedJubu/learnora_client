import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import UserOverviewClient from './UserOverviewClient';

export default async function UserDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return <UserOverviewClient user={session.user} />;
}