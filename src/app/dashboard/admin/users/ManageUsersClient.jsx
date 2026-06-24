'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Search, Shield, Store, User,
    Loader2, CheckCircle, AlertTriangle,
    Mail, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

const ROLE_CONFIG = {
    user: {
        label: 'Traveller',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        border: 'border-indigo-200 dark:border-indigo-800',
        icon: User
    },
    vendor: {
        label: 'Vendor',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        icon: Store
    },
    admin: {
        label: 'Admin',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: Shield
    },
};

export default function ManageUsersClient({ currentUser }) {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        fetchUsers();
    }, []);

    const getToken = async () => {
        const session = await authClient.getSession();
        return session?.data?.session?.token;
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
                { headers: { authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (userId, role, userName) => {
        if (userId === currentUser?.id) {
            toast.error("You can't change your own role!");
            return;
        }
        setActionLoading(userId + role);
        try {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/role`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ role })
                }
            );
            if (res.ok) {
                toast.success(`${userName} is now a ${role}!`);
                setUsers(prev =>
                    prev.map(u =>
                        (u.id === userId || u._id?.toString() === userId)
                            ? { ...u, role }
                            : u
                    )
                );
            } else {
                toast.error('Failed to update role');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setActionLoading(null);
        }
    };

    const handleFraud = async (userId, isFraud, userName) => {
        setActionLoading(userId + 'fraud');
        try {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/fraud`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ isFraud })
                }
            );
            if (res.ok) {
                toast.success(isFraud ? `${userName} marked as fraud!` : `${userName} fraud status removed!`);
                setUsers(prev =>
                    prev.map(u =>
                        (u.id === userId || u._id?.toString() === userId)
                            ? { ...u, isFraud }
                            : u
                    )
                );
            } else {
                toast.error('Failed to update fraud status');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = users.filter(u => {
        const matchSearch = search
            ? u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
            : true;
        const matchFilter = filter === 'all' ? true : u.role === filter;
        return matchSearch && matchFilter;
    });

    const counts = {
        all: users.length,
        user: users.filter(u => u.role === 'user').length,
        vendor: users.filter(u => u.role === 'vendor').length,
        admin: users.filter(u => u.role === 'admin').length,
    };

    return (
        <div className="p-6 pt-8 max-w-7xl mx-auto space-y-6 mt-4">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Users</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View and manage all platform users</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
                {[
                    { label: 'Total Users', value: counts.all, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: Users },
                    { label: 'Travellers', value: counts.user, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: User },
                    { label: 'Vendors', value: counts.vendor, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: Store },
                    { label: 'Admins', value: counts.admin, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: Shield },
                ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3`}>
                        <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center flex-shrink-0">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col sm:flex-row gap-3"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {[
                        { value: 'all', label: 'All' },
                        { value: 'user', label: 'Travellers' },
                        { value: 'vendor', label: 'Vendors' },
                        { value: 'admin', label: 'Admins' },
                    ].map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === f.value
                                ? 'bg-red-500 text-white shadow-md'
                                : 'bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No users found</p>
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
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Role</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Joined</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Verified</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {filtered.map((user, i) => {
                                    const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
                                    const RoleIcon = roleConfig.icon;
                                    const userId = user._id?.toString() || user.id;
                                    const isSelf = userId === currentUser?.id;

                                    return (
                                        <motion.tr
                                            key={userId}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.02 }}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${user.isFraud ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img
                                                            src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=6366f1&color=fff&size=36`}
                                                            alt={user.name || 'User'}
                                                            className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                                                        />
                                                        {user.isFraud && (
                                                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                                                <AlertTriangle className="w-2.5 h-2.5 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                                            {user.name}
                                                            {isSelf && <span className="text-xs text-indigo-500 font-medium">(You)</span>}
                                                            {user.isFraud && <span className="text-xs text-red-500 font-medium">⚠ Fraud</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[180px]">{user.email}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${roleConfig.bg} ${roleConfig.border} border`}>
                                                    <RoleIcon className={`w-3.5 h-3.5 ${roleConfig.color}`} />
                                                    <span className={`text-xs font-semibold ${roleConfig.color}`}>{roleConfig.label}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {new Date(user.createdAt).toLocaleDateString('en-BD', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                {user.emailVerified ? (
                                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span className="text-xs font-medium">Verified</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span className="text-xs font-medium">Unverified</span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                    {isSelf ? (
                                                        <span className="text-xs text-gray-400 italic">Your account</span>
                                                    ) : (
                                                        <>
                                                            {user.role !== 'user' && (
                                                                <button
                                                                    onClick={() => handleRoleChange(userId, 'user', user.name)}
                                                                    disabled={!!actionLoading}
                                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition-all disabled:opacity-50"
                                                                >
                                                                    {actionLoading === userId + 'user' ? <Loader2 className="w-3 h-3 animate-spin" /> : <User className="w-3 h-3" />}
                                                                    Traveller
                                                                </button>
                                                            )}

                                                            {user.role !== 'vendor' && (
                                                                <button
                                                                    onClick={() => handleRoleChange(userId, 'vendor', user.name)}
                                                                    disabled={!!actionLoading}
                                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 transition-all disabled:opacity-50"
                                                                >
                                                                    {actionLoading === userId + 'vendor' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Store className="w-3 h-3" />}
                                                                    Vendor
                                                                </button>
                                                            )}

                                                            {user.role !== 'admin' && (
                                                                <button
                                                                    onClick={() => handleRoleChange(userId, 'admin', user.name)}
                                                                    disabled={!!actionLoading}
                                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-500 text-xs font-semibold hover:bg-red-100 transition-all disabled:opacity-50"
                                                                >
                                                                    {actionLoading === userId + 'admin' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                                                                    Admin
                                                                </button>
                                                            )}

                                                            {user.role === 'vendor' && (
                                                                <button
                                                                    onClick={() => handleFraud(userId, !user.isFraud, user.name)}
                                                                    disabled={!!actionLoading}
                                                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${user.isFraud
                                                                        ? 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500'
                                                                        : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                                                                        }`}
                                                                >
                                                                    {actionLoading === userId + 'fraud'
                                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                                        : <AlertTriangle className="w-3 h-3" />
                                                                    }
                                                                    {user.isFraud ? 'Remove Fraud' : 'Mark Fraud'}
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                        <p className="text-xs text-gray-400">
                            Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span> of{' '}
                            <span className="font-semibold text-gray-600 dark:text-gray-300">{users.length}</span> users
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}