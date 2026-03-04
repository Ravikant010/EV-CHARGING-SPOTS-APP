"use client";

import { motion } from "framer-motion";
import { MapPin, Zap, Clock } from "lucide-react";
import Link from "next/link";
import type { Station } from "@/lib/store";

interface StationCardProps {
  station: Station;
  slotsCount?: number;
  availableSlots?: number;
  index?: number;
}

export default function StationCard({ station, slotsCount = 0, availableSlots = 0, index = 0 }: StationCardProps) {
  const statusColors = {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    INACTIVE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    MAINTENANCE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
    >
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2" />

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {station.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[station.status]}`}>
            {station.status}
          </span>
        </div>

        <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{station.address}</span>
        </div>

        {station.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
            {station.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Zap className="w-4 h-4" />
              <span>{availableSlots} available</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{slotsCount} slots</span>
            </div>
          </div>

          <Link href={`/stations/${station.id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              View Slots
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
