"use client";

import { motion } from "framer-motion";
import { Zap, MapPin, Calendar, Users, MessageSquare, TrendingUp } from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface DashboardCardsProps {
  stats: StatCard[];
}

export function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.title}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -5 }}
          className={`p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 ${stat.color}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">{stat.icon}</div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function UserDashboardCards({ bookings = 0, active = 0 }) {
  const stats: StatCard[] = [
    {
      title: "Total Bookings",
      value: bookings,
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Active Bookings",
      value: active,
      icon: <Zap className="w-6 h-6 text-green-600" />,
      color: "bg-green-50 dark:bg-green-900/20",
    },
  ];
  return <DashboardCards stats={stats} />;
}

export function OwnerDashboardCards({ stations = 0, slots = 0, bookings = 0 }) {
  const stats: StatCard[] = [
    {
      title: "My Stations",
      value: stations,
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Total Slots",
      value: slots,
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      color: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      title: "Total Bookings",
      value: bookings,
      icon: <Calendar className="w-6 h-6 text-green-600" />,
      color: "bg-green-50 dark:bg-green-900/20",
    },
  ];
  return <DashboardCards stats={stats} />;
}

export function AdminDashboardCards({ users = 0, stations = 0, bookings = 0, contacts = 0 }) {
  const stats: StatCard[] = [
    {
      title: "Total Users",
      value: users,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Stations",
      value: stations,
      icon: <MapPin className="w-6 h-6 text-green-600" />,
      color: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Bookings",
      value: bookings,
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      color: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Contact Requests",
      value: contacts,
      icon: <MessageSquare className="w-6 h-6 text-orange-600" />,
      color: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];
  return <DashboardCards stats={stats} />;
}
