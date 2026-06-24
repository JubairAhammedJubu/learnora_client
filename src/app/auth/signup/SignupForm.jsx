'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { signUp, signIn, authClient } from '@/lib/auth-client';

export default function SignupForm({ redirectTo = '/' }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp.email({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'user',
      });

      if (error) {
        toast.error(error.message || 'Signup failed. Please try again.');
        return;
      }

      toast.success('Account created successfully! Welcome to Ghurni 🎉');
      router.push(redirectTo);

    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: redirectTo,
      });
    } catch (err) {
      toast.error('Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-screen bg-gray-50 dark:bg-[#0f1117] relative overflow-hidden">

      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="bg-white/80 dark:bg-[#1a1d24]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-900/40 transition-all duration-300 flex flex-col md:flex-row">

          <div className="relative w-full md:w-1/2 h-48 md:h-auto overflow-hidden">
            <Image
              src="https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Travel across Bangladesh"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-800/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
              <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent font-bold text-2xl md:text-3xl drop-shadow-sm mb-3">
                Ghurni
              </span>
              <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-[240px]">
                Explore Bangladesh. Book bus, train, launch & flight tickets easily.
              </p>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Create Your{' '}
                <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                  Account
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Join thousands of travelers booking with Ghurni.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Full Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-indigo-500 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-indigo-500 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-indigo-500 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={showPassword ? 'off' : 'on'}
                      initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-indigo-500 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={showConfirm ? 'off' : 'on'}
                      initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-violet-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-gray-400 dark:text-gray-500 text-xs">Or continue with</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <motion.button
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
              ) : (
                <FcGoogle className="w-5 h-5" />
              )}
              Continue with Google
            </motion.button>

            <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-4">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}