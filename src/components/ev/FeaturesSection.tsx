"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Clock, CreditCard, MapPin, Smartphone } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Fast Charging",
    description: "Access DC fast chargers up to 350kW. Charge your EV in minutes, not hours.",
  },
  {
    icon: Shield,
    title: "Secure Booking",
    description: "Atomic booking system prevents double bookings. Your slot is guaranteed.",
  },
  {
    icon: Clock,
    title: "Real-time Availability",
    description: "See live availability of charging slots. No more guessing or waiting.",
  },
  {
    icon: CreditCard,
    title: "Transparent Pricing",
    description: "Know the price before you book. No hidden fees or surprise charges.",
  },
  {
    icon: MapPin,
    title: "Location Based",
    description: "Find stations near you with precise GPS coordinates and navigation.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Book on the go with our responsive design. Works on any device.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We&apos;ve built the most reliable and user-friendly EV charging booking system.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
