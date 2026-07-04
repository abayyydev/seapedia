"use client";

import Link from "next/link";
import { useState } from "react";
import { PackageSearch, ShoppingCart, Wallet, ShoppingBag, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/Button";
import { AuthModal } from "@/components/layout/AuthModal";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "login" | "register" }>({
    open: false,
    mode: "login",
  });

  const cartQuery = useQuery({
    queryKey: ["buyer-cart-count"],
    queryFn: async () => {
      if (!user || user.activeRole !== "BUYER") return 0;
      const response = await api.get("/buyer/cart");
      const stores = response.data.data;
      let total = 0;
      stores.forEach((s: any) => { total += s.items.length; });
      return total;
    },
    enabled: !!user && user.activeRole === "BUYER",
  });

  const cartCount = cartQuery.data || 0;

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const openLogin = () => setAuthModal({ open: true, mode: "login" });
  const openRegister = () => setAuthModal({ open: true, mode: "register" });
  const closeModal = () => setAuthModal({ open: false, mode: "login" });

  return (
    <>
      {authModal.open && (
        <AuthModal initialMode={authModal.mode} onClose={closeModal} />
      )}

      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-900 font-extrabold text-2xl tracking-tight hover:opacity-80 transition-opacity">
            <PackageSearch className="w-8 h-8 text-indigo-600" />
            <span className="hidden sm:inline-block">
              SEA<span className="text-indigo-600">PEDIA</span>
            </span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 mx-8 hidden md:block max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari barang atau toko..."
                className="w-full h-10 pl-4 pr-10 rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-4">
            {user ? (
              <>
                {user.activeRole === "BUYER" ? (
                  <div className="flex items-center gap-1 sm:gap-3 mr-2 sm:mr-4 border-r border-slate-200 pr-2 sm:pr-6">
                    <Link href="/buyer/cart" className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors" title="Keranjang">
                      <ShoppingCart className="w-6 h-6" />
                      {cartCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/buyer/orders" className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors" title="Pesanan Saya">
                      <ShoppingBag className="w-6 h-6" />
                    </Link>
                    <Link href="/buyer/wallet" className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors" title="Wallet">
                      <Wallet className="w-6 h-6" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mr-4">
                    {user.activeRole === "SELLER" && (
                      <Link href="/seller" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">Seller Panel</Link>
                    )}
                    {user.activeRole === "DRIVER" && (
                      <Link href="/driver" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">Driver Panel</Link>
                    )}
                    {user.activeRole === "ADMIN" && (
                      <Link href="/admin" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">Admin Panel</Link>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                    <UserIcon className="w-4 h-4 text-indigo-600" />
                    {user.name}
                  </div>
                  <Link
                    href="/dashboard"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Ganti Peran"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={openLogin}>
                  <Button variant="outline" className="border-slate-300 hover:border-indigo-400 hover:text-indigo-600">
                    Masuk
                  </Button>
                </button>
                <button onClick={openRegister}>
                  <Button className="bg-slate-900 hover:bg-indigo-900 text-white">
                    Daftar
                  </Button>
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
