import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import TicketDetailsClient from './TicketDetailsClient';

export default async function TicketDetailsPage({ params }) {
    const { id } = await params;

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect(`/auth/signin?redirect=/tickets/${id}`);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${id}`, {
        cache: 'no-store'
    });

    if (!res.ok) return notFound();

    const ticket = await res.json();
    if (!ticket) return notFound();

    return <TicketDetailsClient ticket={ticket} />;
}