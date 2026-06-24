'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  HeadphonesIcon,
  MapPin,
  CreditCard,
  Clock,
} from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      id: 1,
      icon: ShieldCheck,
      title: 'Secure Booking',
      description:
        'Your transactions are protected with bank-level encryption. Book with complete confidence every time.',
      gradient: 'from-indigo-500 to-violet-500',
      shadow: 'shadow-indigo-500/20',
    },
    {
      id: 2,
      icon: Zap,
      title: 'Instant E-Tickets',
      description:
        'Receive your tickets instantly after booking. No waiting, no hassle — just board and go.',
      gradient: 'from-cyan-500 to-blue-500',
      shadow: 'shadow-cyan-500/20',
    },
    {
      id: 3,
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description:
        'Our dedicated support team is available round the clock to assist you with any queries.',
      gradient: 'from-violet-500 to-fuchsia-500',
      shadow: 'shadow-violet-500/20',
    },
    {
      id: 4,
      icon: MapPin,
      title: 'Live Tracking',
      description:
        'Track your bus, train or launch in real time. Always know exactly where your ride is.',
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/20',
    },
    {
      id: 5,
      icon: CreditCard,
      title: 'Easy Payments',
      description:
        'Pay seamlessly via Stripe. All major cards accepted with zero hidden charges.',
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
    },
    {
      id: 6,
      icon: Clock,
      title: 'Real-Time Availability',
      description:
        'See live seat availability before booking. Never miss a journey due to outdated info.',
      gradient: 'from-rose-500 to-pink-500',
      shadow: 'shadow-rose-500/20',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative py-24 overflow-hidden">

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
            Why Ghurni
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
              Ghurni?
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
            We provide the best travel booking experience in Bangladesh — fast, secure, and
            reliable from start to finish.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group relative bg-white dark:bg-[#1a1d24] rounded-2xl p-6
                border border-gray-100 dark:border-gray-800
                shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.3)]
                hover:shadow-[0_16px_48px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_16px_48px_rgba(99,102,241,0.2)]
                transition-all duration-500 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-2xl`} />

              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} ${feature.shadow} shadow-lg flex items-center justify-center mb-5`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              <div className={`mt-5 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} rounded-full transition-all duration-500 ease-out`} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: '50K+', label: 'Happy Travelers' },
            { value: '200+', label: 'Routes Available' },
            { value: '99.9%', label: 'Uptime Guaranteed' },
            { value: '4.9★', label: 'Average Rating' },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-5 rounded-2xl bg-white dark:bg-[#1a1d24] border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default WhyChooseUs;