'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Loader2, ArrowRight,
  Calendar, Hash, Ticket, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

export default function TransactionClient({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions?userId=${user?.id}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="p-6 pt-8 max-w-5xl mx-auto space-y-6 mt-4">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transaction History</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">All your payment records</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: 'Total Transactions', value: transactions.length, icon: CreditCard, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Total Spent', value: `৳${totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Tickets Booked', value: transactions.reduce((sum, t) => sum + (t.quantity || 1), 0), icon: Ticket, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex items-center gap-4`}>
            <div className="w-11 h-11 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800">
          <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">No transactions yet</h3>
          <p className="text-sm text-gray-400">Your payment history will appear here</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Transaction ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ticket</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {transactions.map((tx, i) => (
                  <motion.tr
                    key={tx._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                          {tx.transactionId}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[160px]">
                          {tx.ticketTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ৳{tx.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(tx.paidAt || tx.createdAt).toLocaleDateString('en-BD', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        ✓ Paid
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <p className="text-xs text-gray-400">
              Total: <span className="font-semibold text-gray-600 dark:text-gray-300">{transactions.length}</span> transactions
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}