import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import AdminOverviewClient from './AdminOverviewClient';

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return <AdminOverviewClient user={session.user} />;
}