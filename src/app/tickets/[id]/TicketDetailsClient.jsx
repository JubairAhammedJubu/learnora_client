'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, authClient } from '@/lib/auth-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Clock, Users, Star, ArrowRight, Bus, Train,
    Ship, Plane, Wifi, Wind, Utensils, Zap, Shield,
    Calendar, ChevronLeft, X, Plus, Minus, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const TRANSPORT_CONFIG = {
    bus: { icon: Bus, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    train: { icon: Train, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    launch: { icon: Ship, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400' },
    plane: { icon: Plane, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' },
};

const PERK_ICONS = {
    'AC': Wind,
    'WiFi': Wifi,
    'Meals Included': Utensils,
    'Meal Included': Utensils,
    'Charging Port': Zap,
    'Snacks': Utensils,
};

function Countdown({ departureDate, departureTime }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
    const [isPast, setIsPast] = useState(false);

    useEffect(() => {
        const target = new Date(`${departureDate}T${departureTime}:00`);

        const tick = () => {
            const now = new Date();
            const diff = target - now;

            if (diff <= 0) {
                setIsPast(true);
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                mins: Math.floor((diff / (1000 * 60)) % 60),
                secs: Math.floor((diff / 1000) % 60),
            });
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [departureDate, departureTime]);

    if (isPast) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-500">Departure passed</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hrs' },
                { value: timeLeft.mins, label: 'Min' },
                { value: timeLeft.secs, label: 'Sec' },
            ].map((unit, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {String(unit.value).padStart(2, '0')}
                        </span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{unit.label}</span>
                </div>
            ))}
        </div>
    );
}

// Book Now Modal
function BookModal({ ticket, onClose }) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const subtotal = ticket.price * quantity;
    const serviceFee = Math.round(subtotal * 0.03);
    const total = subtotal + serviceFee;

    const isPast = new Date(`${ticket.departureDate}T${ticket.departureTime}:00`) < new Date();
    const isDisabled = ticket.quantity === 0 || isPast;

    const handleBook = async () => {
        setIsLoading(true);
        try {
            const session = await authClient.getSession();
            const token = session?.data?.session?.token;
            const user = session?.data?.user;

            if (!user) {
                toast.error('Please sign in to book');
                return;
            }

            const bookingData = {
                ticketId: ticket._id,
                ticketTitle: ticket.title,
                image: ticket.image,
                from: ticket.from,
                to: ticket.to,
                price: ticket.price,
                quantity: quantity,
                departureDate: ticket.departureDate,
                departureTime: ticket.departureTime,
                vendorEmail: ticket.vendorEmail,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });

            const data = await res.json();

            if (data.insertedId) {
                toast.success('Booking confirmed! 🎉');
                onClose();
                router.push('/dashboard/user/booked-tickets');
            } else {
                toast.error('Booking failed. Try again.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-full max-w-md bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-28 bg-gradient-to-r from-indigo-600 to-violet-600 p-5 flex flex-col justify-end">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <h3 className="text-white font-bold text-lg">{ticket.title}</h3>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                        <span>{ticket.from}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>{ticket.to}</span>
                    </div>
                </div>

                <div className="p-5 space-y-4">

                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                            Select Quantity
                        </label>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-indigo-400 transition-all"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => Math.min(ticket.quantity, q + 1))}
                                className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-indigo-400 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">{ticket.quantity} seats available</p>
                    </div>

                    <div className="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>৳{ticket.price?.toLocaleString()} × {quantity}</span>
                            <span>৳{subtotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Service fee (3%)</span>
                            <span>৳{serviceFee?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span>Total</span>
                            <span className="text-indigo-600 dark:text-indigo-400">৳{total?.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleBook}
                        disabled={isDisabled || isLoading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : isDisabled ? (
                            'Not Available'
                        ) : (
                            <>Book Now — ৳{total?.toLocaleString()}</>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" />
                        Secure booking — no hidden charges
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function TicketDetailsClient({ ticket }) {
    const [showModal, setShowModal] = useState(false);
    const { data: session } = useSession();
    const user = session?.user;
    const isUser = user?.role === 'user';

    const config = TRANSPORT_CONFIG[ticket.transportType] || TRANSPORT_CONFIG.bus;
    const TransportIcon = config.icon;
    const isPast = new Date(`${ticket.departureDate}T${ticket.departureTime}:00`) < new Date();
    const isDisabled = ticket.quantity === 0 || isPast;

    const formatDate = (date) => new Date(date).toLocaleDateString('en-BD', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117]">

            <div className="relative h-[45vh] md:h-[55vh] overflow-hidden">
                <Image
                    src={ticket.image}
                    alt={ticket.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#0f1117] via-black/30 to-black/20" />

                <Link
                    href="/tickets"
                    className="absolute top-20 left-4 sm:left-8 flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white text-sm font-medium hover:bg-black/50 transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </Link>

                <div className={`absolute top-20 right-4 sm:right-8 flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border border-white/20 backdrop-blur-md`}>
                    <TransportIcon className={`w-4 h-4 ${config.text}`} />
                    <span className={`text-sm font-semibold capitalize ${config.text}`}>{ticket.transportType}</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-6">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        {ticket.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                        <span>{ticket.operatorName}</span>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            <span>{ticket.rating}</span>
                                            <span className="text-gray-400">({ticket.totalReviews} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-gray-400 mb-1">Per ticket</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                                        ৳{ticket.price?.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 mb-1">From</p>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-indigo-500" />
                                        <span className="font-bold text-gray-900 dark:text-gray-100">{ticket.from}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{ticket.departureTime}</p>
                                </div>

                                <div className="flex-1 flex flex-col items-center gap-1">
                                    <div className="flex items-center w-full gap-2">
                                        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
                                        <div className={`p-2 rounded-full bg-gradient-to-r ${config.color}`}>
                                            <TransportIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
                                    </div>
                                    <span className="text-xs text-gray-400 capitalize">{ticket.transportType}</span>
                                </div>

                                <div className="text-center">
                                    <p className="text-xs text-gray-400 mb-1">To</p>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-cyan-500" />
                                        <span className="font-bold text-gray-900 dark:text-gray-100">{ticket.to}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mt-1">{ticket.arrivalTime}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
                        >
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Journey Details</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="w-4 h-4 text-indigo-500" />
                                        <span className="text-xs text-gray-400">Departure Date</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {formatDate(ticket.departureDate)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-indigo-500" />
                                        <span className="text-xs text-gray-400">Departure Time</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{ticket.departureTime}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="w-4 h-4 text-indigo-500" />
                                        <span className="text-xs text-gray-400">Available Seats</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{ticket.quantity}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
                        >
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Onboard Perks</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {ticket.perks?.map((perk) => {
                                    const PerkIcon = PERK_ICONS[perk] || Shield;
                                    return (
                                        <div
                                            key={perk}
                                            className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                                <PerkIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{perk}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                    </div>

                    <div className="space-y-5">

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
                        >
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Departure starts in:
                            </p>
                            <Countdown
                                departureDate={ticket.departureDate}
                                departureTime={ticket.departureTime}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24"
                        >
                            <div className="mb-4">
                                <p className="text-xs text-gray-400 mb-1">Price per ticket</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                                    ৳{ticket.price?.toLocaleString()}
                                </p>
                            </div>

                            <div className="space-y-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        Available
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {ticket.quantity} seats
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        Departure
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {ticket.departureTime}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                                    <span>Seat availability</span>
                                    <span>{ticket.quantity} left</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${ticket.quantity > 20
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                            : ticket.quantity > 5
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                                                : 'bg-gradient-to-r from-red-500 to-rose-400'
                                            }`}
                                        style={{ width: `${Math.min((ticket.quantity / 150) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (!user) {
                                        toast.error('Please sign in to book a ticket');
                                        return;
                                    }
                                    if (!isUser) {
                                        toast.error('Only travellers can book tickets');
                                        return;
                                    }
                                    setShowModal(true);
                                }}
                                disabled={isDisabled}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {ticket.quantity === 0
                                    ? 'Sold Out'
                                    : isPast
                                        ? 'Booking Closed'
                                        : !user
                                            ? 'Sign In to Book'
                                            : !isUser
                                                ? 'Not Available for Your Role'
                                                : 'Book Now'}
                            </button>

                            {!isDisabled && (
                                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Free cancellation before vendor accepts
                                </p>
                            )}
                        </motion.div>

                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <BookModal
                        ticket={ticket}
                        onClose={() => setShowModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}