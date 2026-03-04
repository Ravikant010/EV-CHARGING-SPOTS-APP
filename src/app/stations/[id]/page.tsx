"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Zap,
  Clock,
  ArrowLeft,
  Loader2,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Building,
  CheckCircle,
} from "lucide-react";
import SlotGrid from "@/components/ev/SlotGrid";
import AuthModal from "@/components/ev/AuthModal";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Slot } from "@/lib/store";

// Helper for hydration-safe rendering
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function StationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const stationId = params.id as string;

  const [station, setStation] = useState<any>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, token, logout } = useAuthStore();
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    fetchStation();
  }, [stationId]);

  const fetchStation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stations/${stationId}`);
      const data = await res.json();
      if (data.success) {
        setStation(data.data);
        setSlots(data.data.slots || []);
      }
    } catch (error) {
      console.error("Failed to fetch station:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId: string) => {
    if (!token) return;

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slotId,
          stationId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setBookingSuccess(true);
        // Update slots
        setSlots((prev) =>
          prev.map((s) =>
            s.id === slotId ? { ...s, isAvailable: false } : s
          )
        );
        setTimeout(() => {
          setBookingSuccess(false);
          // Redirect to dashboard
          router.push("/dashboard");
        }, 2000);
      } else {
        alert(data.error || "Booking failed");
        // Refresh slots
        fetchStation();
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed. Please try again.");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Station Not Found
          </h2>
          <Link href="/stations" className="text-blue-600 hover:underline">
            Back to Stations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                EV Charge
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/stations"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Stations
              </Link>

              {token && user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.name}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAuthMode("login");
                      setAuthOpen(true);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAuthMode("register");
                      setAuthOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </motion.button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4"
          >
            <div className="px-4 space-y-3">
              {token && user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-gray-600 dark:text-gray-400"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {user.name} ({user.role})
                    </span>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-red-500"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setAuthOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode("register");
                      setAuthOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Success Modal */}
      {bookingSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to your dashboard...
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link
            href="/stations"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stations
          </Link>

          {/* Station Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2" />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {station.name}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{station.address}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    station.status === "ACTIVE"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : station.status === "MAINTENANCE"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {station.status}
                </span>
              </div>

              {station.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {station.description}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <Zap className="w-5 h-5 text-yellow-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {slots.filter((s) => s.isAvailable).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <Clock className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {slots.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Slots</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <MapPin className="w-5 h-5 text-green-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {slots.length > 0 ? "$" + slots[0].price : "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Base Price</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <Building className="w-5 h-5 text-purple-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {slots.length > 0 ? slots[0].powerOutput : "N/A"} kW
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Max Power</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Slots Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Available Charging Slots
            </h2>
            <SlotGrid
              slots={slots}
              station={station}
              isLoggedIn={!!token}
              onBook={handleBookSlot}
            />
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </div>
  );
}
