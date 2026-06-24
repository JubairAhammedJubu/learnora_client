import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import ManageUsersClient from './ManageUsersClient';

export default async function ManageUsersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return <ManageUsersClient currentUser={session.user} />;
}