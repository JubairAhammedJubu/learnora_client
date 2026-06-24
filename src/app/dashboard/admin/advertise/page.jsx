import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import AdvertiseClient from './AdvertiseClient';

export default async function AdvertisePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return <AdvertiseClient user={session.user} />;
}