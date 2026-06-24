import { Suspense } from 'react';
import TicketsClient from './TicketsClient';

export default async function TicketsPage({ searchParams }) {
  const params = await searchParams;
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TicketsClient initialParams={params} />
    </Suspense>
  );
}