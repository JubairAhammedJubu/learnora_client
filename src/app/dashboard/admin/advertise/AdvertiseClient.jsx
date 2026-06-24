'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
    Megaphone, Bus, Train, Ship, Plane,
    ArrowRight, Loader2,
    Star, Users, AlertTriangle, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

const TRANSPORT_ICONS = { bus: Bus, train: Train, launch: Ship, plane: Plane };

const MAX_ADVERTISED = 6;

export default function AdvertiseClient() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const session = await authClient.getSession();
            const token = session?.data?.session?.token;

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tickets?verificationStatus=approved&perPage=100`,
                { headers: { authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setTickets(Array.isArray(data.tickets) ? data.tickets : []);
        } catch {
            toast.error('Failed to load tickets');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAdvertise = async (ticketId, currentStatus) => {
        const newStatus = !currentStatus;

        if (newStatus) {
            const advertisedCount = tickets.filter(t => t.isAdvertised).length;
            if (advertisedCount >= MAX_ADVERTISED) {
                toast.error(`Maximum ${MAX_ADVERTISED} tickets can be advertised at a time!`);
                return;
            }
        }

        setActionLoading(ticketId);
        try {
            const session = await authClient.getSession();
            const token = session?.data?.session?.token;

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/advertise`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ isAdvertised: newStatus })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Failed to update');
                return;
            }

            toast.success(newStatus ? 'Ticket is now advertised! 🎉' : 'Ticket removed from ads');
            setTickets(prev =>
                prev.map(t => t._id === ticketId ? { ...t, isAdvertised: newStatus } : t)
            );
        } catch {
            toast.error('Something went wrong');
        } finally {
            setActionLoading(null);
        }
    };

    const advertisedCount = tickets.filter(t => t.isAdvertised).length;
    const remaining = MAX_ADVERTISED - advertisedCount;

    const filtered = filter === 'all'
        ? tickets
        : filter === 'advertised'
            ? tickets.filter(t => t.isAdvertised)
            : tickets.filter(t => !t.isAdvertised);

    return (
        <div className="p-6 pt-8 max-w-7xl mx-auto space-y-6 mt-4">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Advertise Tickets
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Choose up to 6 approved tickets to feature on the homepage
                    </p>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex gap-1.5">
                        {[...Array(MAX_ADVERTISED)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full transition-all duration-300 ${i < advertisedCount
                                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 shadow-sm shadow-indigo-500/30'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="border-l border-gray-200 dark:border-gray-700 pl-3">
                        <p className="text-xs text-gray-400">Slots used</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {advertisedCount}/{MAX_ADVERTISED}
                        </p>
                    </div>
                </div>
            </motion.div>

            {remaining === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                >
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                        All 6 advertisement slots are filled. Remove one to add another.
                    </p>
                </motion.div>
            )}

            {remaining > 0 && remaining <= 2 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                >
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                        {remaining} advertisement slot{remaining > 1 ? 's' : ''} remaining.
                    </p>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2"
            >
                {[
                    { value: 'all', label: 'All Approved', count: tickets.length },
                    { value: 'advertised', label: 'Advertised', count: advertisedCount },
                    { value: 'not_advertised', label: 'Not Advertised', count: tickets.length - advertisedCount },
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === tab.value
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                            : 'bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                            }`}
                    >
                        {tab.label}
                        <span className={`px-1.5 py-0.5 rounded-lg text-xs font-bold ${filter === tab.value
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </motion.div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Megaphone className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No tickets found</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {filtered.map((ticket, index) => {
                        const TransportIcon = TRANSPORT_ICONS[ticket.transportType] || Bus;
                        const isAdvertised = ticket.isAdvertised;
                        const isThisLoading = actionLoading === ticket._id;

                        return (
                            <motion.div
                                key={ticket._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className={`relative bg-white dark:bg-[#1a1d24] rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${isAdvertised
                                    ? 'border-indigo-200 dark:border-indigo-800 shadow-indigo-500/10'
                                    : 'border-gray-100 dark:border-gray-800'
                                    }`}
                            >
                                {isAdvertised && (
                                    <div className="absolute top-3 left-0 z-10">
                                        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-xs font-bold rounded-r-full shadow-md">
                                            <Megaphone className="w-3 h-3" />
                                            Advertised
                                        </div>
                                    </div>
                                )}

                                <div className="relative h-40 overflow-hidden">
                                    {ticket.image ? (
                                        <Image
                                            src={ticket.image}
                                            alt={ticket.ticketTitle}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/20 dark:to-violet-900/20 flex items-center justify-center">
                                            <TransportIcon className="w-12 h-12 text-indigo-300" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center">
                                        <TransportIcon className="w-4 h-4 text-white" />
                                    </div>

                                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
                                        <span className="text-white font-semibold text-sm truncate">{ticket.from}</span>
                                        <ArrowRight className="w-3 h-3 text-white/60 flex-shrink-0" />
                                        <span className="text-white font-semibold text-sm truncate">{ticket.to}</span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1 truncate">
                                        {ticket.ticketTitle}
                                    </h3>

                                    <div className="flex items-center gap-3 mb-4 text-xs text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                            <span>{ticket.rating || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            <span>{ticket.quantity} seats</span>
                                        </div>
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                            ৳{ticket.price?.toLocaleString()}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleToggleAdvertise(ticket._id, isAdvertised)}
                                        disabled={isThisLoading || (!isAdvertised && remaining === 0)}
                                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${isAdvertised
                                            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
                                            : remaining === 0
                                                ? 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40'
                                            }`}
                                    >
                                        {isThisLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isAdvertised ? (
                                            <>
                                                <Megaphone className="w-4 h-4" />
                                                Remove from Ads
                                            </>
                                        ) : remaining === 0 ? (
                                            'Slots Full'
                                        ) : (
                                            <>
                                                <Megaphone className="w-4 h-4" />
                                                Advertise This
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}