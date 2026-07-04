"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, LogIn, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse, RoleName } from "@/types/auth";

type Mode = "login" | "register";

interface AuthModalProps {
  initialMode?: Mode;
  onClose: () => void;
}

const availableRoles: { value: RoleName; label: string; emoji: string }[] = [
  { value: "BUYER", label: "Pembeli", emoji: "🛒" },
  { value: "SELLER", label: "Penjual", emoji: "🏪" },
  { value: "DRIVER", label: "Kurir", emoji: "🚚" },
];

export function AuthModal({ initialMode = "login", onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const setAuth = useAuthStore((state) => state.setAuth);

  // Login state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Register state
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    roles: ["BUYER"] as RoleName[],
  });
  const [registerError, setRegisterError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<{ data: AuthResponse }>("/auth/login", loginForm);
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data);
      onClose();
      Swal.fire({
        title: `Selamat Datang, ${data.user.name}!`,
        text: "Anda berhasil masuk ke SEAPEDIA.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(() => {
        const role = data.user.activeRole;
        if (role === "BUYER") window.location.href = "/";
        else if (role === "SELLER") window.location.href = "/seller";
        else if (role === "DRIVER") window.location.href = "/driver";
        else if (role === "ADMIN") window.location.href = "/admin";
        else window.location.href = "/dashboard";
      });
    },
    onError: (err: any) => {
      setLoginError(err.response?.data?.message || "Email atau password salah.");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<{ data: AuthResponse }>("/auth/register", registerForm);
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data);
      onClose();
      Swal.fire({
        title: "Akun Berhasil Dibuat! 🎉",
        text: `Selamat datang di SEAPEDIA, ${data.user.name}!`,
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(() => {
        window.location.href = "/dashboard";
      });
    },
    onError: (err: any) => {
      setRegisterError(err.response?.data?.message || "Pendaftaran gagal. Coba lagi.");
    },
  });

  const toggleRole = (role: RoleName) => {
    setRegisterForm((prev) => {
      const isSelected = prev.roles.includes(role);
      if (isSelected && prev.roles.length === 1) return prev;
      const newRoles = isSelected
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles: newRoles };
    });
  };

  function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    loginMutation.mutate();
  }

  function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setRegisterError("");
    registerMutation.mutate();
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-900 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-2xl font-extrabold tracking-tight">
            SEA<span className="text-indigo-400">PEDIA</span>
          </div>
          <p className="text-white/70 text-sm mt-1">
            {mode === "login"
              ? "Masuk untuk mulai berbelanja"
              : "Buat akun dan mulai berjualan"}
          </p>

          {/* Tab Toggle */}
          <div className="flex mt-5 bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Masuk
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Daftar
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh@email.com"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 font-medium">
                  ⚠️ {loginError}
                </p>
              )}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3 bg-slate-900 hover:bg-indigo-900 text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-60 mt-2"
              >
                {loginMutation.isPending ? "Memproses..." : "Masuk Sekarang"}
              </button>
              <p className="text-center text-sm text-slate-500">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Daftar gratis
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  required
                  minLength={2}
                  placeholder="Nama Anda"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh@email.com"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min. 8 karakter"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Daftar Sebagai
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableRoles.map((role) => {
                    const isSelected = registerForm.roles.includes(role.value);
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => toggleRole(role.value)}
                        className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xl">{role.emoji}</span>
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {registerError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 font-medium">
                  ⚠️ {registerError}
                </p>
              )}
              <button
                type="submit"
                disabled={registerMutation.isPending || registerForm.roles.length === 0}
                className="w-full py-3 bg-slate-900 hover:bg-indigo-900 text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-60 mt-2"
              >
                {registerMutation.isPending ? "Memproses..." : "Buat Akun Sekarang"}
              </button>
              <p className="text-center text-sm text-slate-500">
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
