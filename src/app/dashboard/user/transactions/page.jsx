import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import TransactionClient from './TransactionClient';

export default async function TransactionPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return <TransactionClient user={session.user} />;
}