import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export default async function UserLayout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) redirect('/auth/signin');

  const role = session.user?.role || 'user';
  console.log('role check:', role, typeof role);

  if (!role || role !== 'user') {
    redirect('/unauthorized');
  }

  return children;
}