import Link from "next/link";
import { ShoppingBag, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

export function PublicNav() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-ink hover:text-ocean transition-colors">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean text-white shadow-sm">
            <ShoppingBag aria-hidden="true" size={20} />
          </span>
          <span className="text-xl tracking-tight">SEAPEDIA</span>
        </Link>
        <div className="flex items-center gap-3">
          {mounted && user ? (
            <Link href="/dashboard" className="flex items-center gap-2 rounded-xl bg-ocean/10 px-4 py-2 text-sm font-bold text-ocean hover:bg-ocean hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2">
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Dashboard / Ganti Peran</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-ocean">
                Login
              </Link>
              <Link href="/register" className="rounded-xl bg-ocean px-5 py-2 text-sm font-bold text-white hover:bg-teal-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}