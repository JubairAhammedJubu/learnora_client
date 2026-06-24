import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, Lock, ArrowRight, MapPin } from 'lucide-react';
import { FaFacebookF } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="relative bg-gray-50 dark:bg-[#0a0a0f] border-t border-gray-200 dark:border-gray-800 mt-auto overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-10 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Ready to share your life lessons?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Join Learnora and inspire thousands through your experiences,
              wisdom, and personal growth stories.
            </p>
          </div>
          <Link
            href="/public-lessons"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-violet-400 transition-all duration-300 whitespace-nowrap"
          >
            Explore Lessons
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-14">
          <div className="space-y-5 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/Image/Logo.png"
                alt="Ghurni Logo"
                width={36}
                height={36}
                className="rounded-xl object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                Learnora 
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              A community-driven platform where people share meaningful life
              lessons, experiences, and wisdom. Learn from others, reflect on
              your journey, and grow together.
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                {label: "Home", href: "/"},
                {label: "Lessons", href: "/public-lessons"},
                {label: "Contact Us", href: "/contact"},
                {label: "About", href: "/about"},
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-indigo-500 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">
              Contact Info
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:support@ghurni.com"
                  className="flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                    <Mail className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                      Email
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      support@learnora.com
                    </p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:+8801234567890"
                  className="flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                    <Phone className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                      Phone
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      +880 1234 567890
                    </p>
                  </div>
                </a>
              </li>
              <li>
                <Link
                  href="https://facebook.com"
                  target="_blank"
                  className="flex items-start gap-3 group"
                >
                  {/* UPDATED HERE: Replaced Facebook with FaFacebookF */}
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                    <FaFacebookF className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                      Facebook
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Learnora Official Page
                    </p>
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">
              Payment Methods
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Stripe
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Secured & Encrypted
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                All transactions are secured with SSL encryption. Never store
                your card details.
              </p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  SSL Secured
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="py-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Learnora. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;