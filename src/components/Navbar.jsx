'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, ChevronDown, LayoutDashboard, LogOut, User, Shield, Store } from "lucide-react";
import { useSession, signOut } from '@/lib/auth-client';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  user: { label: 'Lessoner', color: 'from-indigo-500 to-violet-500', icon: User },
  admin: { label: 'Admin', color: 'from-red-500 to-rose-500', icon: Shield },
};

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: session, isPending } = useSession();
  const user = session?.user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("ghurni-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = saved === "dark" || (!saved && prefersDark);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(initialDark);
    if (initialDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ghurni-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ghurni-theme", "light");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully!');
    router.push('/');
    setIsDropdownOpen(false);
  };

  const dashboardLinks = {
    user: '/dashboard/user',
    vendor: '/dashboard/vendor',
    admin: '/dashboard/admin',
  };

  const isTransparent = pathname === "/" && !scrolled;
  const isDashboard = pathname?.startsWith('/dashboard');

const navLinks = [
  {
    name: "Home",
    href: "/",
  },

  {
    name: "Public Lessons",
    href: "/public-lessons",
  },

  ...(user
    ? [
        {
          name: "Add Lesson",
          href: "/dashboard/add-lesson",
        },

        {
          name: "My Lessons",
          href: "/dashboard/my-lessons",
        },

        ...(!user?.isPremium
          ? [
              {
                name: "Upgrade",
                href: "/pricing",
              },
            ]
          : []),
      ]
    : []),
];

  const role = user?.role || 'user';
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.user;

  // Navbar Position Class
  const navPosition = isDashboard
    ? "relative bg-white dark:bg-[#0f1117] border-b border-gray-200 dark:border-gray-800 shadow-sm"
    : isTransparent
      ? "fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-white/10"
      : "fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0f1117] backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800";

  return (
    <>
      <nav
        className={`w-full transition-all duration-500 ease-in-out ${navPosition}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/Image/logo2.png"
                alt="Learnora Logo"
                width={38}
                height={38}
                className="rounded-lg object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                Learnora
              </span>
            </Link>

            <div className="hidden md:flex items-center justify-center flex-1 mx-8">
              <div
                className={`flex items-center space-x-1 rounded-full p-1 transition-all duration-500 ${
                  isTransparent && isDark
                    ? "bg-white/10 backdrop-blur-sm"
                    : isTransparent && !isDark
                      ? "bg-black/10 backdrop-blur-sm"
                      : "bg-gray-100 dark:bg-gray-800/60"
                }`}
              >
                {navLinks.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                        isActive
                          ? "text-white bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md"
                          : isTransparent && isDark
                            ? "text-white/90 hover:text-white hover:bg-white/20"
                            : isTransparent && !isDark
                              ? "text-gray-800 hover:text-indigo-600 hover:bg-black/10"
                              : "text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-700"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isTransparent && isDark
                    ? "text-white/90 hover:text-white hover:bg-white/20"
                    : isTransparent && !isDark
                      ? "text-gray-800 hover:bg-black/10"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {isPending ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
                      isTransparent
                        ? "border-white/20 bg-white/10 hover:bg-white/20"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <img
                      src={
                        user.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=32`
                      }
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span
                      className={`text-sm font-medium max-w-[80px] truncate ${
                        isTransparent
                          ? "text-white"
                          : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {user.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      } ${isTransparent ? "text-white/70" : "text-gray-400"}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{opacity: 0, y: 8, scale: 0.95}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: 8, scale: 0.95}}
                        transition={{duration: 0.15}}
                        className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${roleConfig.color} text-white capitalize`}
                          >
                            {roleConfig.label}
                          </span>
                        </div>

                        <div className="p-1.5">
                          <Link
                            href={dashboardLinks[user?.role || "user"]}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/user/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      isTransparent && isDark
                        ? "text-white hover:bg-white/20"
                        : isTransparent && !isDark
                          ? "text-gray-800 hover:text-indigo-600 hover:bg-black/10"
                          : "text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-5 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 shadow-md shadow-indigo-300/25 hover:shadow-indigo-400/40 hover:from-indigo-500 hover:to-violet-400 transition-all duration-200"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  isTransparent && isDark
                    ? "text-white hover:bg-white/20"
                    : isTransparent && !isDark
                      ? "text-gray-800 hover:bg-black/10"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              {user && (
                <img
                  src={
                    user.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=32`
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500/30"
                />
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-full transition-colors ${
                  isTransparent && isDark
                    ? "text-white hover:bg-white/20"
                    : isTransparent && !isDark
                      ? "text-gray-800 hover:bg-black/10"
                      : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
                  <span
                    className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
                  />
                  <span
                    className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
                  />
                  <span
                    className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: "auto"}}
              exit={{opacity: 0, height: 0}}
              transition={{duration: 0.3, ease: "easeInOut"}}
              className="md:hidden bg-white dark:bg-[#0f1117] border-t border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden"
            >
              <div className="px-4 py-5 space-y-2">
                {user && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                    <img
                      src={
                        user.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=32`
                      }
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${roleConfig.color} text-white capitalize`}
                    >
                      {roleConfig.label}
                    </span>
                  </div>
                )}

                {navLinks.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="w-full py-3 text-center text-sm font-medium rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full py-3 text-center text-sm font-medium rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-indigo-600 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full py-3 text-center text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-md"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;