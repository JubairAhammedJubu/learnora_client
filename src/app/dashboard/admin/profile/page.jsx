import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import AdminProfile from './AdminProfile';

export default async function AdminProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    return <AdminProfile user={session?.user} />;
}