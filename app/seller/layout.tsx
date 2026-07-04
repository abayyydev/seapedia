"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store as StoreIcon, Package, Settings, LogOut, ShoppingBag, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const navItems = [
    { name: "Informasi Toko", href: "/seller", icon: StoreIcon },
    { name: "Produk", href: "/seller/products", icon: Package },
    { name: "Pesanan", href: "/seller/orders", icon: ShoppingBag },
    { name: "Laporan", href: "/seller/reports", icon: BarChart3 },
    { name: "Pengaturan", href: "/seller/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-ocean">Seller Panel</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-ocean text-white" : "text-slate-600 hover:bg-slate-50 hover:text-ocean"
                  }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Link
            href="/dashboard"
            className="w-full flex items-center px-3 py-2 text-sm font-bold text-ocean rounded-lg hover:bg-ocean/10 transition-colors"
          >
            <Settings className="w-5 h-5 mr-3" />
            Ganti Peran
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-bold text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
