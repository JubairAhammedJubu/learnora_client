/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  MapPin, Clock, Calendar, Users,
  ArrowRight, Ticket, CheckCircle,
  XCircle, Clock3, CreditCard, AlertCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

// Countdown component
function Countdown({ departureDate, departureTime }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const target = new Date(`${departureDate}T${departureTime}:00`);

    const tick = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) { setIsPast(true); return; }
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

  if (isPast) return null;

  return (
    <div className="flex items-center gap-1.5 mt-2">
      {[
        { value: timeLeft.days, label: 'D' },
        { value: timeLeft.hours, label: 'H' },
        { value: timeLeft.mins, label: 'M' },
        { value: timeLeft.secs, label: 'S' },
      ].map((unit, i) => (
        <div key={i} className="flex items-center gap-0.5">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-lg min-w-[28px] text-center">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[9px] text-gray-400 mt-0.5">{unit.label}</span>
          </div>
          {i < 3 && <span className="text-gray-400 text-xs mb-3">:</span>}
        </div>
      ))}
    </div>
  );
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock3,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
  },
  paid: {
    label: 'Paid',
    icon: CreditCard,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
  },
};

function BookingCard({ booking, onCancel, onPay }) {
  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const isPast = new Date(`${booking.departureDate}T${booking.departureTime}:00`) < new Date();
  const totalPrice = booking.price * booking.quantity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300"
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src={booking.image || 'https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={booking.ticketTitle}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg} ${status.border} border backdrop-blur-sm`}>
          <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
          <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <span className="text-white font-semibold text-sm">{booking.from}</span>
          <div className="flex-1 flex items-center gap-1">
            <div className="flex-1 h-px bg-white/40" />
            <ArrowRight className="w-3 h-3 text-white/60" />
            <div className="flex-1 h-px bg-white/40" />
          </div>
          <span className="text-white font-semibold text-sm">{booking.to}</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base truncate">
            {booking.ticketTitle}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{new Date(booking.departureDate).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{booking.departureTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">{booking.from} → {booking.to}</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-400">Total Amount</span>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            ৳{totalPrice?.toLocaleString()}
          </span>
        </div>

        {/* Countdown — only show if not rejected/paid and not past */}
        {booking.status !== 'rejected' && booking.status !== 'paid' && !isPast && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Departure in:</p>
            <Countdown
              departureDate={booking.departureDate}
              departureTime={booking.departureTime}
            />
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {/* Cancel — only if pending */}
          {booking.status === 'pending' && (
            <button
              onClick={() => onCancel(booking._id)}
              className="flex-1 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              Cancel Booking
            </button>
          )}

          {/* Pay Now — only if accepted and not past */}
          {booking.status === 'accepted' && !isPast && (
            <button
              onClick={() => onPay(booking)}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pay Now
            </button>
          )}

          {/* Paid status */}
          {booking.status === 'paid' && (
            <div className="flex-1 py-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-xs font-semibold text-center">
              ✓ Payment Complete
            </div>
          )}

          {/* Rejected */}
          {booking.status === 'rejected' && (
            <div className="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-500 text-xs font-semibold text-center">
              Booking Rejected
            </div>
          )}

          {/* Expired */}
          {booking.status === 'accepted' && isPast && (
            <div className="flex-1 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 text-xs font-semibold text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Payment Expired
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function BookedTicketsClient({ user }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings?userId=${user?.id}`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`,
        {
          method: 'DELETE',
          headers: { authorization: `Bearer ${token}` }
        }
      );

      if (res.ok) {
        toast.success('Booking cancelled!');
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      } else {
        toast.error('Failed to cancel booking');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setCancellingId(null);
    }
  };

  const handlePay = async (booking) => {
    console.log('Booking object:', booking); // check field names
    try {
      const totalAmount = booking.price * booking.quantity;
      /* const serviceFee = Math.round(totalAmount * 0.03);
      const grandTotal = totalAmount + serviceFee; */

      const res = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id,
          ticketTitle: booking.ticketTitle || booking.title || 'Ghurni Ticket',
          amount: totalAmount,
          quantity: booking.quantity,
        })
      });

      const data = await res.json();
      console.log('Checkout response:', data);

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment failed. Try again.');
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    paid: bookings.filter(b => b.status === 'paid').length,
  };

  return (
    <div className="p-6 pt-8 max-w-6xl mx-auto mt-4">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Booked Tickets</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Track and manage all your bookings
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total', value: stats.total, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Accepted', value: stats.accepted, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Paid', value: stats.paid, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} rounded-2xl p-4 border border-gray-100 dark:border-gray-800`}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No bookings yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
            Start exploring tickets and book your first journey!
          </p>
          <a
            href="/tickets"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-semibold shadow-md"
          >
            Browse Tickets
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
              onPay={handlePay}
            />
          ))}
        </div>
      )}
    </div>
  );
}