'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Shield, Calendar,
  CheckCircle, Camera, Link, Edit3,
  Save, X, Upload, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

export default function UserProfile({ user }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [imageUrl, setImageUrl] = useState('');
  const [imageTab, setImageTab] = useState('upload');

  const [savedImage, setSavedImage] = useState(user?.image || null);
  const [pendingImage, setPendingImage] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  const joinDate = new Date(user?.createdAt).toLocaleDateString('en-BD', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const uploadToImgbb = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    return data.data.url;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadLoading(true);
    try {
      toast.loading('Uploading...', { id: 'upload' });
      const url = await uploadToImgbb(file);
      setPendingImage(url);
      toast.success('Image ready! Click Save to apply.', { id: 'upload' });
    } catch {
      toast.error('Upload failed', { id: 'upload' });
    } finally {
      setIsUploadLoading(false);
    }
  };

  const handleLinkPreview = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }
    setPendingImage(imageUrl.trim());
    toast.success('Preview ready! Click Save to apply.');
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await authClient.updateUser({ name: name.trim() });
      if (error) {
        toast.error(error.message || 'Failed to update name');
        return;
      }
      toast.success('Name updated!');
      setIsEditingName(false);
    } catch {
      toast.error('Failed to update name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveImage = async () => {
    if (!pendingImage) {
      toast.error('Please select or preview an image first');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await authClient.updateUser({ image: pendingImage });
      if (error) {
        toast.error(error.message || 'Failed to update photo');
        return;
      }
      setSavedImage(pendingImage);
      setPendingImage(null);
      setImageUrl('');
      toast.success('Profile photo saved!');
      setIsEditingImage(false);
    } catch {
      toast.error('Failed to save photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelImage = () => {
    setPendingImage(null);
    setImageUrl('');
    setIsEditingImage(false);
  };

  const modalPreviewSrc = pendingImage || savedImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=96`;

  const profileImageSrc = savedImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=96`;

  return (
    <div className="p-6 pt-8 max-w-4xl mx-auto space-y-6 mt-16">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your personal information and photo
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
          />
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-5">
            <div className="relative inline-block">
              <img
                src={profileImageSrc}
                alt={name}
                className="w-24 h-24 rounded-2xl border-4 border-white dark:border-[#1a1d24] object-cover shadow-lg"
              />
              <button
                onClick={() => setIsEditingImage(true)}
                className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setIsEditingImage(true)}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div className="flex items-center gap-2 pb-1">
              {user?.emailVerified && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Verified</span>
                </div>
              )}
              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                ✈️ Traveller
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-lg font-bold bg-gray-50 dark:bg-gray-800 border border-indigo-400 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isLoading}
                    className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setIsEditingName(false); setName(user?.name || ''); }}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{name}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {isEditingImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancelImage} />
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Update Profile Photo</h3>
              <button
                onClick={handleCancelImage}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-5 gap-2">
              <img
                src={modalPreviewSrc}
                alt="Preview"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-indigo-100 dark:border-indigo-900 shadow-md"
              />
              {pendingImage && (
                <span className="text-xs text-amber-500 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-800">
                  Preview only — not saved yet
                </span>
              )}
            </div>

            <div className="flex gap-2 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <button
                onClick={() => setImageTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  imageTab === 'upload'
                    ? 'bg-white dark:bg-[#1a1d24] text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
              <button
                onClick={() => setImageTab('link')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  imageTab === 'link'
                    ? 'bg-white dark:bg-[#1a1d24] text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Link className="w-4 h-4" />
                Image Link
              </button>
            </div>

            {imageTab === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl p-6 text-center cursor-pointer transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {isUploadLoading ? (
                  <Loader2 className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mx-auto mb-2 transition-colors" />
                )}
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">
                  {isUploadLoading ? 'Uploading...' : 'Click to upload image'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  />
                </div>
                <button
                  onClick={handleLinkPreview}
                  className="w-full py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  Preview Image
                </button>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCancelImage}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImage}
                disabled={isLoading || !pendingImage}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Photo
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {[
          { icon: User, label: 'Full Name', value: name, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { icon: Mail, label: 'Email Address', value: user?.email, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { icon: Shield, label: 'Account Role', value: '✈️ Traveller', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
          { icon: Calendar, label: 'Member Since', value: joinDate, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {item.value || '—'}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Account Status</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Account</span>
          </div>
          {user?.emailVerified && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Email Verified</span>
            </div>
          )}
          {savedImage && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
              <Camera className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs font-medium text-violet-600 dark:text-violet-400">Profile Photo Set</span>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}