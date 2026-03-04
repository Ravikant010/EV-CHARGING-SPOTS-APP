"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, User, Mail, Lock, UserPlus, LogIn } from "lucide-react";
import { useState } from "react";
import { login, register as registerUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "OWNER"]),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onSwitchMode: (mode: "login" | "register") => void;
}

export default function AuthModal({ open, onClose, mode, onSwitchMode }: AuthModalProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "USER" },
  });

  const onLogin = async (data: LoginData) => {
    setError(null);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const result = await login(formData);
    if (result.error) {
      setError(result.error);
    } else if (result.user && result.token) {
      // Update Zustand store
      setUser(result.user);
      setToken(result.token);
      loginForm.reset();
      onClose();
      router.refresh();
    }
  };

  const onRegister = async (data: RegisterData) => {
    setError(null);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("role", data.role);

    const result = await registerUser(formData);
    if (result.error) {
      setError(result.error);
    } else if (result.user && result.token) {
      // Update Zustand store
      setUser(result.user);
      setToken(result.token);
      registerForm.reset();
      onClose();
      router.refresh();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-r ${mode === "login" ? "from-blue-600 to-indigo-600" : "from-green-600 to-teal-600"} p-6 text-white`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {mode === "login" ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                  <h2 className="text-xl font-bold">{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm mt-1 opacity-90">
                {mode === "login" ? "Sign in to manage your bookings" : "Join us to start booking EV charging slots"}
              </p>
            </div>

            <div className="p-6">
              {mode === "login" ? (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...loginForm.register("email")}
                        type="email"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                        placeholder="your@email.com"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...loginForm.register("password")}
                        type="password"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={loginForm.formState.isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loginForm.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                  </button>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => { setError(null); onSwitchMode("register"); }} className="text-blue-600 hover:underline">
                      Register
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...registerForm.register("name")}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                        placeholder="Your name"
                      />
                    </div>
                    {registerForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...registerForm.register("email")}
                        type="email"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...registerForm.register("password")}
                        type="password"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Register as</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input {...registerForm.register("role")} type="radio" value="USER" className="w-4 h-4" />
                        <span className="text-sm">EV User</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input {...registerForm.register("role")} type="radio" value="OWNER" className="w-4 h-4" />
                        <span className="text-sm">Station Owner</span>
                      </label>
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={registerForm.formState.isSubmitting}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {registerForm.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                  </button>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <button type="button" onClick={() => { setError(null); onSwitchMode("login"); }} className="text-green-600 hover:underline">
                      Sign In
                    </button>
                  </p>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Demo: admin@evbooking.com, owner@evbooking.com, user@evbooking.com
                  <br />
                  Password: demo123
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
