"use client";

import { motion } from "framer-motion";
import { Clock, Zap, Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import type { Slot, Station } from "@/lib/store";

interface SlotGridProps {
  slots: Slot[];
  station: Station;
  isLoggedIn: boolean;
  onBook: (slotId: string) => Promise<void>;
}

export default function SlotGrid({ slots, station, isLoggedIn, onBook }: SlotGridProps) {
  const [bookingId, setBookingId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const chargerTypeLabels: Record<string, { label: string; color: string }> = {
    LEVEL1: { label: "Level 1", color: "text-gray-600 bg-gray-100" },
    LEVEL2: { label: "Level 2", color: "text-blue-600 bg-blue-100" },
    DC_FAST: { label: "DC Fast", color: "text-purple-600 bg-purple-100" },
  };

  const handleBook = async (slotId: string) => {
    if (!isLoggedIn) return;
    setBookingId(slotId);
    try {
      await onBook(slotId);
    } finally {
      setBookingId(null);
    }
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = formatDate(slot.startTime);
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No charging slots available</p>
        <p className="text-sm">Check back later for available slots</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedSlots).map(([date, dateSlots]) => (
        <div key={date}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {date}
          </h3>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {dateSlots.map((slot) => {
              const chargerInfo = chargerTypeLabels[slot.chargerType] || chargerTypeLabels.LEVEL2;
              const isBooking = bookingId === slot.id;

              return (
                <motion.div
                  key={slot.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: slot.isAvailable ? 1.02 : 1 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    slot.isAvailable
                      ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:border-green-300"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${chargerInfo.color}`}>
                      {chargerInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>{slot.powerOutput} kW</span>
                    <span className="mx-2">•</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${slot.price}
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBook(slot.id)}
                    disabled={!slot.isAvailable || !isLoggedIn || isBooking}
                    className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                      slot.isAvailable
                        ? isLoggedIn
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Booking...
                      </>
                    ) : slot.isAvailable ? (
                      isLoggedIn ? (
                        "Book Now"
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          Login to Book
                        </>
                      )
                    ) : (
                      "Unavailable"
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
