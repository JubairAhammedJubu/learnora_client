'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';

const PopularRoutes = () => {
  const popularRoutes = [
    {
      id: 1,
      from: 'Dhaka',
      to: "Cox's Bazar",
      image: 'https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Explore the longest unbroken sea beach in the world.',
    },
    {
      id: 2,
      from: 'Dhaka',
      to: 'Sylhet',
      image: 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Visit the majestic tea gardens & the shrine of Hazrat Shah Jalal.',
    },
    {
      id: 3,
      from: 'Dhaka',
      to: 'Sajek Valley',
      image: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Experience the breathtaking beauty of the hill tracts.',
    },
    {
      id: 4,
      from: 'Dhaka',
      to: 'Sundarbans',
      image: 'https://images.pexels.com/photos/975771/pexels-photo-975771.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: "Witness the world's largest mangrove forest & Royal Bengal Tigers.",
    },
    {
      id: 5,
      from: 'Dhaka',
      to: 'Chittagong',
      image: 'https://images.pexels.com/photos/1098515/pexels-photo-1098515.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Discover the bustling port city and its beautiful hills.',
    },
    {
      id: 6,
      from: 'Dhaka',
      to: 'Bandarban',
      image: 'https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Find peace among the highest peaks of Bangladesh.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
          Top Destinations
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Popular Routes Across{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            Bangladesh
          </span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base">
          Discover the most loved destinations across the country and book your journey today.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {popularRoutes.map((route) => (
          <motion.div
            key={route.id}
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
            className="group relative bg-white dark:bg-[#1a1d24] rounded-2xl overflow-hidden
              shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.4)]
              hover:shadow-[0_16px_48px_rgba(99,102,241,0.18)] dark:hover:shadow-[0_16px_48px_rgba(99,102,241,0.25)]
              border border-gray-100 dark:border-gray-800
              transition-shadow duration-500"
          >
            <div className="relative h-52 w-full overflow-hidden">
              <Image
                src={route.image}
                alt={`${route.from} to ${route.to}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-medium text-white border border-white/10">
                Popular
              </div>

              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-semibold text-white">
                <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span>{route.from}</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
                <span>{route.to}</span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5 flex items-center gap-2">
                {route.from}
                <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                {route.to}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {route.description}
              </p>

              <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500 ease-out" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default PopularRoutes;