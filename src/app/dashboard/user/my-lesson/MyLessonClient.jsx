'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
    Ticket, Plus, Edit2, Trash2, Eye,
    CheckCircle, XCircle, Clock3, Loader2,
    Bus, Train, Ship, Plane, ArrowRight,
    AlertTriangle, X, Save, MapPin, DollarSign,
    Hash, Calendar, Clock, Tag, Upload, Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

const VERIFY_CONFIG = {
    pending: { label: 'Pending Review', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: Clock3 },
    approved: { label: 'Approved', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: XCircle },
};

const TRANSPORT_ICONS = { bus: Bus, train: Train, launch: Ship, plane: Plane };

const TRANSPORT_TYPES = [
    { value: 'bus', label: 'Bus', icon: Bus },
    { value: 'train', label: 'Train', icon: Train },
    { value: 'plane', label: 'Plane', icon: Plane },
    { value: 'launch', label: 'Launch', icon: Ship },
];

const PERKS = [
    'AC', 'WiFi', 'Breakfast', 'Lunch', 'Dinner',
    'Luggage', 'USB Charging', 'Recliner Seat',
    'Blanket & Pillow', 'Entertainment', 'Snacks', 'Water Bottle'
];

const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
};

function DeleteModal({ ticket, onConfirm, onCancel, isLoading }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-sm bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center mb-2">Delete Ticket?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                    Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{ticket?.ticketTitle}&quot;</span>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function EditModal({ ticket, onSave, onCancel, isLoading }) {
    const [form, setForm] = useState({
        ticketTitle: ticket?.ticketTitle || '',
        from: ticket?.from || '',
        to: ticket?.to || '',
        transportType: ticket?.transportType || '',
        price: ticket?.price || '',
        quantity: ticket?.quantity || '',
        departureDate: ticket?.departureDate || '',
        departureTime: ticket?.departureTime || '',
        perks: ticket?.perks || [],
        image: ticket?.image || '',
    });

    const [imageTab, setImageTab] = useState('upload');
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState(ticket?.image || null);
    const [pendingImage, setPendingImage] = useState(null);
    const [isUploadLoading, setIsUploadLoading] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePerkToggle = (perk) => {
        setForm(prev => ({
            ...prev,
            perks: prev.perks.includes(perk)
                ? prev.perks.filter(p => p !== perk)
                : [...prev.perks, perk]
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
        setIsUploadLoading(true);
        try {
            toast.loading('Uploading...', { id: 'edit-img' });
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch(
                `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`,
                { method: 'POST', body: formData }
            );
            const data = await res.json();
            const url = data.data.url;
            setPendingImage(url);
            setImagePreview(url);
            toast.success('Image ready!', { id: 'edit-img' });
        } catch {
            toast.error('Upload failed', { id: 'edit-img' });
        } finally {
            setIsUploadLoading(false);
        }
    };

    const handleLinkPreview = () => {
        if (!imageUrl.trim()) { toast.error('Enter an image URL'); return; }
        setPendingImage(imageUrl.trim());
        setImagePreview(imageUrl.trim());
        toast.success('Preview ready!');
    };

    const handleSaveImage = () => {
        if (!pendingImage) { toast.error('Upload or preview an image first'); return; }
        setForm(prev => ({ ...prev, image: pendingImage }));
        setPendingImage(null);
        toast.success('Image saved!');
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setPendingImage(null);
        setImageUrl('');
        setForm(prev => ({ ...prev, image: '' }));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1d24] rounded-t-2xl">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit Ticket</h3>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-5">

                    <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Ticket Title</label>
                        <div className="relative">
                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="ticketTitle"
                                value={form.ticketTitle}
                                onChange={handleChange}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">From</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="from"
                                    value={form.from}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">To</label>
                            <div className="relative">
                                <ArrowRight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="to"
                                    value={form.to}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Transport Type</label>
                        <div className="grid grid-cols-4 gap-2">
                            {TRANSPORT_TYPES.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setForm(prev => ({ ...prev, transportType: value }))}
                                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${form.transportType === value
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Price ৳</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Quantity</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Departure Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="departureDate"
                                    value={form.departureDate}
                                    onChange={handleChange}
                                    min={getMinDate()}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Departure Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="time"
                                    name="departureTime"
                                    value={form.departureTime}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Perks & Amenities</label>
                        <div className="flex flex-wrap gap-2">
                            {PERKS.map((perk) => {
                                const selected = form.perks.includes(perk);
                                return (
                                    <button
                                        key={perk}
                                        onClick={() => handlePerkToggle(perk)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${selected
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-300'
                                            }`}
                                    >
                                        {selected ? <CheckCircle className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                                        {perk}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Ticket Image</label>

                        {imagePreview && (
                            <div className="mb-3 space-y-2">
                                <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                                    <button
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                {pendingImage && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-amber-500 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-800 flex-1 text-center">
                                            Preview only — click Save Image
                                        </span>
                                        <button
                                            onClick={handleSaveImage}
                                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-semibold"
                                        >
                                            Save Image
                                        </button>
                                    </div>
                                )}
                                {form.image && !pendingImage && (
                                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800 block text-center">
                                        ✓ Image saved
                                    </span>
                                )}
                            </div>
                        )}

                        {!imagePreview && (
                            <>
                                <div className="flex gap-2 mb-3 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <button
                                        onClick={() => setImageTab('upload')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${imageTab === 'upload'
                                            ? 'bg-white dark:bg-[#1a1d24] text-emerald-600 dark:text-emerald-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        Upload File
                                    </button>
                                    <button
                                        onClick={() => setImageTab('link')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${imageTab === 'link'
                                            ? 'bg-white dark:bg-[#1a1d24] text-emerald-600 dark:text-emerald-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        <LinkIcon className="w-3.5 h-3.5" />
                                        Image Link
                                    </button>
                                </div>

                                {imageTab === 'upload' ? (
                                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-400 rounded-xl p-6 cursor-pointer transition-all group">
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        {isUploadLoading
                                            ? <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                                            : <Upload className="w-7 h-7 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                        }
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 transition-colors">
                                            {isUploadLoading ? 'Uploading...' : 'Click to upload'}
                                        </p>
                                    </label>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={handleLinkPreview}
                                            className="w-full py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                        >
                                            Preview Image
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="sticky bottom-0 flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1d24] rounded-b-2xl">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-sm font-semibold shadow-md shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function MyTicketsClient({ user }) {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/tickets?vendorEmail=${user?.email}&perPage=100`,
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

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const session = await authClient.getSession();
            const token = session?.data?.session?.token;
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${deleteTarget._id}`,
                { method: 'DELETE', headers: { authorization: `Bearer ${token}` } }
            );
            if (res.ok) {
                toast.success('Ticket deleted!');
                setTickets(prev => prev.filter(t => t._id !== deleteTarget._id));
                setDeleteTarget(null);
            } else {
                toast.error('Failed to delete ticket');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = async (formData) => {
        if (!editTarget) return;
        setIsEditing(true);
        try {
            const session = await authClient.getSession();
            const token = session?.data?.session?.token;
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${editTarget._id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...formData,
                        price: parseFloat(formData.price),
                        quantity: parseInt(formData.quantity),
                    })
                }
            );
            if (res.ok) {
                toast.success('Ticket updated!');
                setTickets(prev => prev.map(t =>
                    t._id === editTarget._id
                        ? { ...t, ...formData, price: parseFloat(formData.price), quantity: parseInt(formData.quantity) }
                        : t
                ));
                setEditTarget(null);
            } else {
                toast.error('Failed to update ticket');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsEditing(false);
        }
    };

    const filteredTickets = filter === 'all'
        ? tickets
        : tickets.filter(t => t.verificationStatus === filter);

    const counts = {
        all: tickets.length,
        pending: tickets.filter(t => t.verificationStatus === 'pending').length,
        approved: tickets.filter(t => t.verificationStatus === 'approved').length,
        rejected: tickets.filter(t => t.verificationStatus === 'rejected').length,
    };

    return (
        <div className="p-6 pt-8 max-w-6xl mx-auto space-y-6 mt-4">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Tickets</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage all your added tickets</p>
                </div>
                <Link
                    href="/dashboard/vendor/add-ticket"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-sm font-semibold shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add New Ticket
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 flex-wrap"
            >
                {[
                    { value: 'all', label: 'All' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === tab.value
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                            : 'bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300'
                            }`}
                    >
                        {tab.label}
                        <span className={`px-1.5 py-0.5 rounded-lg text-xs font-bold ${filter === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                            }`}>
                            {counts[tab.value]}
                        </span>
                    </button>
                ))}
            </motion.div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : filteredTickets.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800"
                >
                    <Ticket className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">No tickets found</h3>
                    <p className="text-sm text-gray-400 mb-5">
                        {filter === 'all' ? "You haven't added any tickets yet." : `No ${filter} tickets.`}
                    </p>
                    {filter === 'all' && (
                        <Link
                            href="/dashboard/vendor/add-ticket"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-sm font-semibold"
                        >
                            <Plus className="w-4 h-4" />
                            Add Your First Ticket
                        </Link>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {filteredTickets.map((ticket, index) => {
                        const verify = VERIFY_CONFIG[ticket.verificationStatus] || VERIFY_CONFIG.pending;
                        const VerifyIcon = verify.icon;
                        const TransportIcon = TRANSPORT_ICONS[ticket.transportType] || Bus;
                        const isRejected = ticket.verificationStatus === 'rejected';

                        return (
                            <motion.div
                                key={ticket._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white dark:bg-[#1a1d24] rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${isRejected
                                    ? 'border-red-100 dark:border-red-900/30 opacity-75'
                                    : 'border-gray-100 dark:border-gray-800 hover:shadow-emerald-500/10'
                                    }`}
                            >
                                <div className="relative h-40 overflow-hidden">
                                    {ticket.image ? (
                                        <Image src={ticket.image} alt={ticket.ticketTitle} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center">
                                            <Ticket className="w-12 h-12 text-emerald-300" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                    <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${verify.bg} ${verify.border} border backdrop-blur-sm`}>
                                        <VerifyIcon className={`w-3.5 h-3.5 ${verify.color}`} />
                                        <span className={`text-xs font-semibold ${verify.color}`}>{verify.label}</span>
                                    </div>

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
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                            ৳{ticket.price?.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-gray-400">{ticket.quantity} seats</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/tickets/${ticket._id}`}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium hover:border-emerald-300 hover:text-emerald-600 transition-all"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </Link>
                                        <button
                                            onClick={() => setEditTarget(ticket)}
                                            disabled={isRejected}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium hover:border-emerald-300 hover:text-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(ticket)}
                                            disabled={isRejected}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 dark:border-red-900/30 text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            <AnimatePresence>
                {deleteTarget && (
                    <DeleteModal
                        ticket={deleteTarget}
                        onConfirm={handleDelete}
                        onCancel={() => setDeleteTarget(null)}
                        isLoading={isDeleting}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editTarget && (
                    <EditModal
                        ticket={editTarget}
                        onSave={handleEdit}
                        onCancel={() => setEditTarget(null)}
                        isLoading={isEditing}
                    />
                )}
            </AnimatePresence>

        </div>
    );
}