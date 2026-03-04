"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Menu,
  X,
  User,
  LogOut,
  MapPin,
  Calendar,
  Clock,
  Building,
  Users,
  MessageSquare,
  XCircle,
  Loader2,
  Plus,
  Eye,
  Trash2,
} from "lucide-react";
import {
  UserDashboardCards,
  OwnerDashboardCards,
  AdminDashboardCards,
} from "@/components/ev/DashboardCards";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Helper for hydration-safe rendering
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [bookings, setBookings] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const { user, token, logout } = useAuthStore();
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
  const router = useRouter();

  useEffect(() => {
    if (mounted && !token) {
      router.push("/");
      return;
    }
    if (token) {
      fetchDashboardData();
    }
  }, [mounted, token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch stats
      const statsRes = await fetch("/api/dashboard", { headers });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch bookings
      const bookingsRes = await fetch("/api/booking", { headers });
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) {
        setBookings(bookingsData.data);
      }

      // Fetch stations for owner
      if (user?.role === "OWNER" || user?.role === "ADMIN") {
        const stationsRes = await fetch("/api/stations", { headers });
        const stationsData = await stationsRes.json();
        if (stationsData.success) {
          setStations(stationsData.data);
        }
      }

      // Fetch contacts for admin
      if (user?.role === "ADMIN") {
        const contactsRes = await fetch("/api/contact", { headers });
        const contactsData = await contactsRes.json();
        if (contactsData.success) {
          setContacts(contactsData.data);
        }

        const usersRes = await fetch("/api/dashboard?type=users", { headers });
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsers(usersData.data?.userList || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`/api/booking/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "CANCELLED" } : b
          )
        );
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm("Are you sure you want to delete this station? This will also delete all slots.")) return;

    try {
      const res = await fetch(`/api/stations/${stationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setStations((prev) => prev.filter((s) => s.id !== stationId));
      }
    } catch (error) {
      console.error("Failed to delete station:", error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!mounted || !token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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

              {user && (
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
              <Link
                href="/stations"
                className="block py-2 text-gray-600 dark:text-gray-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                Stations
              </Link>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user?.name} ({user?.role})
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
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {user?.role === "ADMIN"
                    ? "Admin Dashboard"
                    : user?.role === "OWNER"
                    ? "Owner Dashboard"
                    : "My Dashboard"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.name}!
                </p>
              </motion.div>

              {/* Dashboard Cards based on role */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                {user?.role === "ADMIN" ? (
                  <AdminDashboardCards
                    users={stats.userStats?.total || 0}
                    stations={stats.stationStats?.totalStations || 0}
                    bookings={stats.bookingStats?.totalBookings || 0}
                    contacts={stats.contactStats?.pending || 0}
                  />
                ) : user?.role === "OWNER" ? (
                  <OwnerDashboardCards
                    stations={stats.stationStats?.totalStations || 0}
                    slots={stats.stationStats?.totalSlots || 0}
                    bookings={stats.bookingStats?.totalBookings || 0}
                  />
                ) : (
                  <UserDashboardCards
                    bookings={stats.bookingStats?.totalBookings || 0}
                    active={stats.bookingStats?.activeBookings || 0}
                  />
                )}
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                  {[
                    { id: "overview", label: "Overview", roles: ["USER", "OWNER", "ADMIN"] },
                    { id: "bookings", label: "My Bookings", roles: ["USER", "OWNER", "ADMIN"] },
                    { id: "stations", label: "My Stations", roles: ["OWNER", "ADMIN"] },
                    { id: "contacts", label: "Contact Requests", roles: ["ADMIN"] },
                    { id: "users", label: "Users", roles: ["ADMIN"] },
                  ]
                    .filter((tab) => tab.roles.includes(user?.role || ""))
                    .map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          activeTab === tab.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                </div>
              </motion.div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Recent Bookings */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Bookings
                      </h3>
                      <button
                        onClick={() => setActiveTab("bookings")}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View All
                      </button>
                    </div>
                    {bookings.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No bookings yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {booking.station?.name || "Unknown Station"}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {booking.slot
                                  ? `${formatDate(booking.slot.startTime)} at ${formatTime(
                                      booking.slot.startTime
                                    )}`
                                  : "N/A"}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                booking.status === "CONFIRMED"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : booking.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Link href="/stations">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center"
                        >
                          <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Find Stations
                          </span>
                        </motion.button>
                      </Link>
                      {user?.role === "OWNER" && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab("stations")}
                          className="w-full p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center"
                        >
                          <Plus className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            Manage Stations
                          </span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "bookings" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      My Bookings
                    </h3>
                  </div>
                  {bookings.length === 0 ? (
                    <div className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No bookings yet.{" "}
                        <Link href="/stations" className="text-blue-600 hover:underline">
                          Find a station
                        </Link>{" "}
                        to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {booking.station?.name || "Unknown Station"}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {booking.station?.address || "N/A"}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {booking.slot
                                    ? `${formatDate(booking.slot.startTime)}, ${formatTime(
                                        booking.slot.startTime
                                      )} - ${formatTime(booking.slot.endTime)}`
                                    : "N/A"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Zap className="w-4 h-4 text-yellow-500" />
                                  {booking.slot?.chargerType || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                booking.status === "CONFIRMED"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : booking.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {booking.status}
                            </span>
                            {booking.status === "CONFIRMED" && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "stations" && (user?.role === "OWNER" || user?.role === "ADMIN") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user?.role === "ADMIN" ? "All Stations" : "My Stations"}
                    </h3>
                    <Link href="/stations">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Station
                      </motion.button>
                    </Link>
                  </div>
                  {stations.length === 0 ? (
                    <div className="p-8 text-center">
                      <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No stations yet. Create your first station to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stations.map((station) => (
                        <div
                          key={station.id}
                          className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <Building className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {station.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {station.address}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Created: {formatDate(station.createdAt || "")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
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
                            <Link href={`/stations/${station.id}`}>
                              <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                <Eye className="w-5 h-5" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDeleteStation(station.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "contacts" && user?.role === "ADMIN" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Contact Requests
                    </h3>
                  </div>
                  {contacts.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No contact requests yet.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {contacts.map((contact) => (
                        <div key={contact.id} className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {contact.subject}
                                </p>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    contact.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : contact.status === "RESOLVED"
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                  }`}
                                >
                                  {contact.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                From: {contact.name} ({contact.email})
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">
                                {contact.message}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  await fetch(`/api/contact/${contact.id}`, {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ status: "RESOLVED" }),
                                  });
                                  fetchDashboardData();
                                }}
                                className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm"
                              >
                                Mark Resolved
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "users" && user?.role === "ADMIN" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Users
                    </h3>
                  </div>
                  {users.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No users found.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((u) => (
                        <div
                          key={u.id}
                          className="p-6 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {u.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {u.email}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              u.role === "ADMIN"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                : u.role === "OWNER"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
