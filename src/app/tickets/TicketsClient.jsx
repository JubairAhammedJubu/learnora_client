'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
    Search, MapPin, ArrowRight, Bus, Train, Ship, Plane,
    Star, Clock, Users, SlidersHorizontal, X,
    ChevronUp, ChevronDown, Wifi, Wind, Utensils, Zap
} from 'lucide-react';

const TRANSPORT_TYPES = [
    { value: 'all', label: 'All', icon: SlidersHorizontal, color: 'from-gray-500 to-gray-600' },
    { value: 'bus', label: 'Bus', icon: Bus, color: 'from-emerald-500 to-teal-500' },
    { value: 'train', label: 'Train', icon: Train, color: 'from-blue-500 to-indigo-500' },
    { value: 'launch', label: 'Launch', icon: Ship, color: 'from-cyan-500 to-blue-500' },
    { value: 'plane', label: 'Plane', icon: Plane, color: 'from-violet-500 to-purple-500' },
];

const SORT_OPTIONS = [
    { value: 'default', label: 'Recommended' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'departure', label: 'Earliest Departure' },
];

const PERK_ICONS = {
    'AC': Wind,
    'WiFi': Wifi,
    'Meals Included': Utensils,
    'Meal Included': Utensils,
    'Charging Port': Zap,
};

export default function TicketsClient({ initialParams }) {
    const router = useRouter();

    const [tickets, setTickets] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filters
    const [from, setFrom] = useState(initialParams?.from || '');
    const [to, setTo] = useState(initialParams?.to || '');
    const [transport, setTransport] = useState(initialParams?.type || 'all');
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [page, setPage] = useState(1);
    const perPage = 9;

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (from) params.set('from', from);
            if (to) params.set('to', to);
            if (transport !== 'all') params.set('type', transport);
            if (sortBy !== 'default') params.set('sort', sortBy);
            params.set('minPrice', priceRange[0]);
            params.set('maxPrice', priceRange[1]);
            params.set('page', page);
            params.set('perPage', perPage);
            params.set('verificationStatus', 'approved');

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets?${params.toString()}`);
            const data = await res.json();
            setTickets(data.tickets || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [from, to, transport, sortBy, priceRange, page]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTickets();
    }, [fetchTickets]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchTickets();
    };

    const clearFilters = () => {
        setFrom('');
        setTo('');
        setTransport('all');
        setSortBy('default');
        setPriceRange([0, 10000]);
        setPage(1);
    };

    const totalPages = Math.ceil(total / perPage);
    const hasActiveFilters = from || to || transport !== 'all' || sortBy !== 'default';

    const formatPrice = (price) => {
        return `৳${price?.toLocaleString()}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117]">

            <div className="relative pt-24 pb-32 overflow-visible">
                <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-transparent" />

                <div className="absolute top-10 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-10 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-10"
                    >
                        <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase rounded-full bg-white/10 border border-white/20 text-white/80">
                            Find Your Journey
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                            All Tickets
                        </h1>
                        <p className="text-white/60 text-base max-w-xl mx-auto">
                            Search from hundreds of routes across Bangladesh — bus, train, launch & plane.
                        </p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        onSubmit={handleSearch}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3">

                            <div className="flex-1 relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" />
                                <input
                                    type="text"
                                    placeholder="From (e.g. Dhaka)"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                                />
                            </div>

                            <div className="hidden sm:flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <ArrowRight className="w-4 h-4 text-white/60" />
                                </div>
                            </div>

                            <div className="flex-1 relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300" />
                                <input
                                    type="text"
                                    placeholder="To (e.g. Cox's Bazar)"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <Search className="w-4 h-4" />
                                Search
                            </button>
                        </div>
                    </motion.form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-16 relative z-20">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 p-4 mb-6"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                        <div className="flex items-center gap-2 flex-wrap">
                            {TRANSPORT_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => { setTransport(type.value); setPage(1); }}
                                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${transport === type.value
                                            ? 'text-white shadow-lg scale-105'
                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    style={transport === type.value ? {} : {}}
                                >
                                    {transport === type.value && (
                                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${type.color}`} />
                                    )}
                                    <type.icon className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10">{type.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                                className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${isFilterOpen
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                    }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                                {isFilterOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Price Range
                                                </label>
                                                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                                                    ৳{priceRange[0].toLocaleString()} — ৳{priceRange[1].toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={10000}
                                                    step={100}
                                                    value={priceRange[1]}
                                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                                <div className="flex justify-between text-xs text-gray-400">
                                                    <span>৳0</span>
                                                    <span>৳10,000</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Quick Price Select
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { label: 'Under ৳500', range: [0, 500] },
                                                    { label: '৳500–1000', range: [500, 1000] },
                                                    { label: '৳1000–3000', range: [1000, 3000] },
                                                    { label: '৳3000+', range: [3000, 10000] },
                                                ].map((preset) => (
                                                    <button
                                                        key={preset.label}
                                                        onClick={() => setPriceRange(preset.range)}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1]
                                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                            }`}
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isLoading ? 'Searching...' : (
                            <>
                                Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{tickets.length}</span> of{' '}
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{total}</span> tickets
                                {(from || to) && (
                                    <span className="ml-1">
                                        {from && <span> from <span className="text-indigo-600 dark:text-indigo-400 font-medium">{from}</span></span>}
                                        {to && <span> to <span className="text-indigo-600 dark:text-indigo-400 font-medium">{to}</span></span>}
                                    </span>
                                )}
                            </>
                        )}
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-[#1a1d24] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
                                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : tickets.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24"
                    >
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No tickets found</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
                        <button
                            onClick={clearFilters}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {tickets.map((ticket, index) => (
                            <TicketCard key={ticket._id} ticket={ticket} index={index} />
                        ))}
                    </motion.div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${page === i + 1
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/25'
                                        : 'bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function TicketCard({ ticket, index }) {
    const transportConfig = {
        bus: { icon: Bus, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
        train: { icon: Train, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
        launch: { icon: Ship, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400' },
        plane: { icon: Plane, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' },
    };

    const config = transportConfig[ticket.transportType] || transportConfig.bus;
    const TransportIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="group bg-white dark:bg-[#1a1d24] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800
        shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)]
        hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_12px_40px_rgba(99,102,241,0.2)]
        transition-all duration-500"
        >
            <div className="relative h-44 overflow-hidden">
                <Image
                    src={ticket.image}
                    alt={ticket.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} border border-white/20 backdrop-blur-sm`}>
                    <TransportIcon className={`w-3.5 h-3.5 ${config.text}`} />
                    <span className={`text-xs font-semibold capitalize ${config.text}`}>{ticket.transportType}</span>
                </div>

                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-sm font-bold border border-white/10">
                    ৳{ticket.price?.toLocaleString()}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{ticket.from}</span>
                    <div className="flex-1 flex items-center gap-1">
                        <div className="flex-1 h-px bg-white/40" />
                        <ArrowRight className="w-3 h-3 text-white/60" />
                        <div className="flex-1 h-px bg-white/40" />
                    </div>
                    <span className="text-white font-semibold text-sm">{ticket.to}</span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2 truncate">
                    {ticket.title}
                </h3>

                <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ticket.departureTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{ticket.quantity} seats</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{ticket.rating} ({ticket.totalReviews})</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                    {ticket.perks?.slice(0, 3).map((perk) => {
                        const PerkIcon = PERK_ICONS[perk];
                        return (
                            <span
                                key={perk}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs border border-gray-100 dark:border-gray-700"
                            >
                                {PerkIcon && <PerkIcon className="w-3 h-3" />}
                                {perk}
                            </span>
                        );
                    })}
                    {ticket.perks?.length > 3 && (
                        <span className="px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 text-xs border border-gray-100 dark:border-gray-700">
                            +{ticket.perks.length - 3} more
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Per ticket</p>
                        <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                            ৳{ticket.price?.toLocaleString()}
                        </p>
                    </div>
                    <Link
                        href={`/tickets/${ticket._id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-violet-400 transition-all duration-200"
                    >
                        See Details
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}