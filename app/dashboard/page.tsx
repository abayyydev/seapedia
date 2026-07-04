"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse, RoleName } from "@/types/auth";
import Swal from "sweetalert2";
import {
  ShoppingCart,
  Store,
  Truck,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  LogOut,
  ChevronRight,
  Zap,
} from "lucide-react";

const roleConfig: Record<
  RoleName,
  { label: string; desc: string; icon: any; href: string; gradient: string; accent: string }
> = {
  BUYER: {
    label: "Pembeli",
    desc: "Belanja produk, kelola keranjang & riwayat pesanan Anda.",
    icon: ShoppingCart,
    href: "/",
    gradient: "from-blue-600 to-cyan-500",
    accent: "blue",
  },
  SELLER: {
    label: "Penjual",
    desc: "Kelola toko, produk, dan pantau pesanan masuk.",
    icon: Store,
    href: "/seller",
    gradient: "from-emerald-600 to-teal-500",
    accent: "emerald",
  },
  DRIVER: {
    label: "Kurir",
    desc: "Terima pekerjaan pengiriman dan tingkatkan pendapatan.",
    icon: Truck,
    href: "/driver",
    gradient: "from-purple-600 to-violet-500",
    accent: "purple",
  },
  ADMIN: {
    label: "Admin",
    desc: "Monitor platform, kelola voucher dan konfigurasi sistem.",
    icon: ShieldCheck,
    href: "/admin",
    gradient: "from-rose-600 to-orange-500",
    accent: "rose",
  },
};

const standardRoles: RoleName[] = ["BUYER", "SELLER", "DRIVER"];

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [router, user]);

  const selectRoleMutation = useMutation({
    mutationFn: async (role: RoleName) => {
      const response = await api.patch<{ data: AuthResponse }>("/auth/select-role", { role });
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Role tidak dapat dipilih.");
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async (role: RoleName) => {
      const response = await api.post<{ data: AuthResponse }>("/auth/add-role", { role });
      return response.data.data;
    },
    onSuccess: (data, role) => {
      setAuth(data);
      Swal.fire({
        title: "Peran Ditambahkan! 🎉",
        text: `Anda sekarang memiliki peran baru sebagai ${roleConfig[role].label}.`,
        icon: "success",
        confirmButtonColor: "#6366f1",
      });
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menambahkan peran.", "error");
    },
  });

  if (!user) return null;

  const missingRoles = standardRoles.filter((r) => !user.roles.includes(r));

  function handleAddRole(role: RoleName) {
    Swal.fire({
      title: "Tambah Peran Baru?",
      text: `Ingin bergabung juga sebagai ${roleConfig[role].label}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Tambahkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#6366f1",
    }).then((result) => {
      if (result.isConfirmed) addRoleMutation.mutate(role);
    });
  }

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const activeConfig = user.activeRole ? roleConfig[user.activeRole] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background ambient blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 bg-white/[0.02] backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-xl tracking-tight text-white">
            SEA<span className="text-indigo-400">PEDIA</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {user.name}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Greeting */}
        <div className="mb-12">
          <p className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            Panel Kendali Akun
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            Halo, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-400 text-lg">
            Pilih peran yang ingin Anda gunakan sekarang.
          </p>
        </div>

        {/* Active role banner */}
        {activeConfig && (
          <div className={`mb-8 p-5 rounded-2xl bg-gradient-to-r ${activeConfig.gradient} bg-opacity-10 border border-white/10 flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <activeConfig.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-0.5">Peran Aktif Sekarang</p>
                <p className="text-white font-bold text-lg">{activeConfig.label}</p>
              </div>
            </div>
            <Link
              href={activeConfig.href}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
            >
              Buka Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Role cards */}
        <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-5">
          Peran yang Anda Miliki
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {user.roles.map((role) => {
            const cfg = roleConfig[role];
            const Icon = cfg.icon;
            const isActive = user.activeRole === role;

            return (
              <button
                key={role}
                onClick={() => selectRoleMutation.mutate(role)}
                className={`group relative rounded-2xl border p-6 text-left transition-all duration-300 overflow-hidden ${
                  isActive
                    ? "border-indigo-500/50 bg-gradient-to-br from-indigo-600/20 to-indigo-900/20 shadow-lg shadow-indigo-900/30"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${cfg.gradient}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-white">{cfg.label}</span>
                    {isActive && (
                      <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{cfg.desc}</p>
                  <div className={`flex items-center text-sm font-semibold transition-colors ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                    {isActive ? "Pilih lagi" : "Aktifkan"} <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Add new roles */}
        {missingRoles.length > 0 && user.activeRole !== "ADMIN" && (
          <div className="border border-white/5 rounded-2xl p-6 bg-white/[0.02]">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">
              Tambah Peran Baru
            </h3>
            <div className="flex flex-wrap gap-3">
              {missingRoles.map((role) => {
                const cfg = roleConfig[role];
                const Icon = cfg.icon;
                return (
                  <button
                    key={role}
                    onClick={() => handleAddRole(role)}
                    className="inline-flex items-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <Icon className="w-4 h-4" />
                    Tambah sebagai {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-xl p-3">{error}</p>}
      </main>
    </div>
  );
}