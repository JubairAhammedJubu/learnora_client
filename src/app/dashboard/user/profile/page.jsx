import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import UserProfile from './UserProfile';

export default async function UserProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return <UserProfile user={session.user} />;
}