import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import MyLessonClient from "./MyLessonClient";

export default async function MyTicketsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return <MyLessonClient user={session.user} />;
}