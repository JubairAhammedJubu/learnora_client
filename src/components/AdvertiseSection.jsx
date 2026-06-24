'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
    Sparkles, ArrowRight, Bus, Train, Ship, Plane,
    MapPin, Clock, Users, Tag, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

const TRANSPORT_ICONS = { bus: Bus, train: Train, launch: Ship, plane: Plane };
const TRANSPORT_COLORS = {
    bus: 'from-emerald-500 to-teal-500',
    train: 'from-blue-500 to-indigo-500',
    launch: 'from-cyan-500 to-blue-500',
    plane: 'from-violet-500 to-purple-500',
};

function TicketCard({ ticket, index }) {
    const TransportIcon = TRANSPORT_ICONS[ticket.transportType] || Bus;
    const transportColor = TRANSPORT_COLORS[ticket.transportType] || 'from-indigo-500 to-violet-500';

    return (
        <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ 
                duration: 3 + (index % 3) * 0.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatType: "loop",
                delay: index * 0.2 
            }}
            whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.2 } }}
            className="relative flex-shrink-0 w-[300px] md:w-[320px]"
        >
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${transportColor} rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500`} />

            <div className="relative bg-white dark:bg-[#1a1d24] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-shadow duration-500">

                <div className="relative h-44 overflow-hidden">
                    {ticket.image ? (
                        <img
                            src={ticket.image}
                            alt={ticket.ticketTitle}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${transportColor} flex items-center justify-center`}>
                            <TransportIcon className="w-16 h-16 text-white/40" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        Featured
                    </div>

                    <div className={`absolute top-3 right-3 w-8 h-8 rounded-xl bg-gradient-to-br ${transportColor} flex items-center justify-center shadow-lg`}>
                        <TransportIcon className="w-4 h-4 text-white" />
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex-1 min-w-0">
                                <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                                <span className="text-white text-xs font-semibold truncate">{ticket.from}</span>
                                <ArrowRight className="w-3 h-3 text-white/50 flex-shrink-0" />
                                <span className="text-white text-xs font-semibold truncate">{ticket.to}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3 truncate">
                        {ticket.ticketTitle}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{ticket.departureTime || '--:--'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{ticket.quantity} seats</span>
                        </div>
                    </div>

                    {ticket.perks?.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mb-3">
                            {ticket.perks.slice(0, 3).map((perk, i) => (
                                <span key={i} className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                                    <Tag className="w-2.5 h-2.5" />
                                    {perk}
                                </span>
                            ))}
                            {ticket.perks.length > 3 && (
                                <span className="text-xs text-gray-400">+{ticket.perks.length - 3}</span>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            <p className="text-xs text-gray-400">per ticket</p>
                            <p className={`text-xl font-bold bg-gradient-to-r ${transportColor} bg-clip-text text-transparent`}>
                                ৳{ticket.price?.toLocaleString()}
                            </p>
                        </div>
                        <Link
                            href={`/tickets/${ticket._id}`}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${transportColor} text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105`}
                        >
                            See Details
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function AdvertiseSection() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(0);
    const scrollRef = useRef(null);
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start']
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [-80, 80]);
    const y3 = useTransform(scrollYProgress, [0, 1], [40, -40]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        fetchAdvertised();
    }, []);

    const fetchAdvertised = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/advertised`);
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch {
            console.error('Failed to fetch advertised tickets');
        } finally {
            setIsLoading(false);
        }
    };

    const CARD_WIDTH = 320; 
    const GAP_WIDTH = 20;  
    const PAGE_WIDTH = (CARD_WIDTH * 3) + (GAP_WIDTH * 2); 

    const totalPages = Math.ceil(tickets.length / 3);

    const scrollToPage = (page) => {
        setCurrentPage(page);
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                left: page * PAGE_WIDTH,
                behavior: 'smooth'
            });
        }
    };

    const scrollLeft = () => {
        if (currentPage > 0) scrollToPage(currentPage - 1);
    };

    const scrollRight = () => {
        if (currentPage < totalPages - 1) scrollToPage(currentPage + 1);
    };

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollLeftPos = scrollRef.current.scrollLeft;
        const newPage = Math.round(scrollLeftPos / PAGE_WIDTH);
        if (newPage !== currentPage && newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (!isLoading && tickets.length === 0) return null;

    return (
        <section ref={sectionRef} className="relative py-24 overflow-hidden">

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/50 via-transparent to-violet-50/50 dark:from-indigo-950/30 dark:via-transparent dark:to-violet-950/30" />
                <motion.div style={{ y: y1 }} className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-[80px]" />
                <motion.div style={{ y: y2 }} className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-[100px]" />
                <motion.div style={{ y: y3 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 dark:bg-cyan-500/3 rounded-full blur-[120px]" />
            </div>

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/40 dark:bg-indigo-400/20"
                        style={{
                            left: `${10 + i * 12}%`,
                            top: `${20 + (i % 3) * 25}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, 10, 0],
                            opacity: [0.2, 0.8, 0.2],
                            scale: [1, 1.8, 1],
                        }}
                        transition={{
                            duration: 4 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
                >
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-widest uppercase"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Featured Picks
                            <Zap className="w-3.5 h-3.5" />
                        </motion.div>

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                            Handpicked{' '}
                            <span className="relative">
                                <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
                                    Exclusive Deals
                                </span>
                                <motion.span
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 rounded-full"
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                />
                            </span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-base max-w-lg">
                            Limited seats, unbeatable prices. These hand-selected journeys sell out fast — grab yours before they&apos;re gone.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={scrollLeft}
                                disabled={currentPage === 0}
                                className="w-10 h-10 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={scrollRight}
                                disabled={currentPage === totalPages - 1}
                                className="w-10 h-10 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <Link
                            href="/tickets"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105"
                        >
                            View All
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20 gap-3">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-[300px] h-[360px] rounded-2xl bg-gray-100 dark:bg-gray-800/50"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {tickets.map((ticket, index) => (
                                <TicketCard key={ticket._id} ticket={ticket} index={index} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {[...Array(totalPages)].map((_, i) => (
                                    <motion.button
                                        key={i}
                                        onClick={() => scrollToPage(i)}
                                        className={`rounded-full transition-all duration-300 ${
                                            currentPage === i
                                                ? 'w-6 h-2 bg-gradient-to-r from-indigo-500 to-violet-500'
                                                : 'w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-indigo-300'
                                        }`}
                                        whileTap={{ scale: 0.8 }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"
            />
        </section>
    );
}