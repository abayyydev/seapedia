"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Store as StoreIcon, ShoppingBag, Banknote } from "lucide-react";
import { api } from "@/services/api";

type AdminStats = {
  totalUsers: number;
  totalStores: number;
  totalOrders: number;
  totalGMV: number;
};

export default function AdminDashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await api.get<{ data: AdminStats }>("/admin/stats");
      return response.data.data;
    }
  });

  const stats = statsQuery.data || {
    totalUsers: 0,
    totalStores: 0,
    totalOrders: 0,
    totalGMV: 0
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Platform Overview</h1>
        <p className="text-slate-400 mt-2">Monitor SEAPEDIA's global metrics and ecosystem growth.</p>
      </div>

      {statsQuery.isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* GMV */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Banknote className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-400 font-medium text-sm mb-1">Gross Merchandise Value (GMV)</p>
            <h3 className="text-3xl font-bold text-white">Rp {stats.totalGMV.toLocaleString("id-ID")}</h3>
          </div>

          {/* Users */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-400 font-medium text-sm mb-1">Total Users</p>
            <h3 className="text-3xl font-bold text-white">{stats.totalUsers}</h3>
          </div>

          {/* Stores */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <StoreIcon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-400 font-medium text-sm mb-1">Active Stores</p>
            <h3 className="text-3xl font-bold text-white">{stats.totalStores}</h3>
          </div>

          {/* Orders */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-400 font-medium text-sm mb-1">Total Orders</p>
            <h3 className="text-3xl font-bold text-white">{stats.totalOrders}</h3>
          </div>
        </div>
      )}
    </>
  );
}
