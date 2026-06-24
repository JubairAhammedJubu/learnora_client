import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import DashboardSidebar from './DashboardSidebar';

export default async function DashboardLayout({ children }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/auth/signin?redirect=/dashboard');
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] flex">
            <DashboardSidebar user={session.user} />
            <main className="flex-1 min-w-0 pb-20 lg:pb-0">
                {children}
            </main>
        </div>
    );
}