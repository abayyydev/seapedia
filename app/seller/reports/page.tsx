"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Package, ShoppingBag, CheckCircle2 } from "lucide-react";
import { api } from "@/services/api";

type ReportStats = {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  productsSold: number;
};

export default function SellerReportsPage() {
  const reportsQuery = useQuery({
    queryKey: ["seller-reports"],
    queryFn: async () => {
      const response = await api.get<{ data: ReportStats }>("/seller/reports");
      return response.data.data;
    }
  });

  const stats = reportsQuery.data || {
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    productsSold: 0
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Laporan Penjualan</h1>
        <p className="text-sm text-slate-500 mt-1">Pantau performa toko dan pendapatan Anda.</p>
      </div>

      {reportsQuery.isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean"></div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue */}
          <div className="bg-gradient-to-br from-ocean to-blue-700 rounded-2xl p-6 text-white shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-blue-100 font-medium text-sm mb-1">Total Pendapatan (Kotor)</p>
            <h3 className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString("id-ID")}</h3>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <ShoppingBag className="w-6 h-6 text-slate-600" />
              </div>
            </div>
            <p className="text-slate-500 font-medium text-sm mb-1">Total Pesanan</p>
            <h3 className="text-2xl font-bold text-ink">{stats.totalOrders}</h3>
          </div>

          {/* Completed Orders */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-slate-500 font-medium text-sm mb-1">Pesanan Selesai</p>
            <h3 className="text-2xl font-bold text-ink">{stats.completedOrders}</h3>
          </div>

          {/* Products Sold */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                <Package className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-slate-500 font-medium text-sm mb-1">Produk Terjual</p>
            <h3 className="text-2xl font-bold text-ink">{stats.productsSold}</h3>
          </div>
        </div>
      )}

      {/* Chart Placeholder / Info */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <BarChart3 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-ink mb-2">Grafik Penjualan</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Fitur grafik analitik komprehensif sedang dalam pengembangan. Saat ini, Anda dapat memantau akumulasi total penjualan Anda melalui kartu metrik di atas.
        </p>
      </div>
    </>
  );
}
