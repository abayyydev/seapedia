"use client";

import { useQuery } from "@tanstack/react-query";
import { History, Truck, Navigation } from "lucide-react";
import Link from "next/link";
import { api } from "@/services/api";

type Job = {
  id: string;
  total_amount: string;
  delivery_fee: string;
  status: string;
  created_at: string;
  store_name: string;
  buyer_name: string;
};

export default function DriverHistoryPage() {
  const myJobsQuery = useQuery({
    queryKey: ["driver-my-jobs"],
    queryFn: async () => {
      const response = await api.get<{ data: Job[] }>("/driver/jobs/my");
      return response.data.data;
    }
  });

  const jobs = myJobsQuery.data?.filter(job => job.status === "COMPLETED" || job.status === "RETURNED") || [];

  const totalPendapatan = jobs.reduce((sum, job) => sum + (job.status === "COMPLETED" ? Number(job.delivery_fee || 0) : 0), 0);

  return (
    <main className="min-h-screen bg-mist p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
          <div>
            <Link href="/driver" className="text-ocean text-sm hover:underline mb-2 inline-block">&larr; Kembali ke Dashboard</Link>
            <h1 className="text-2xl font-bold text-ink">Riwayat Pekerjaan</h1>
            <p className="text-sm text-slate-500 mt-1">Daftar pesanan yang telah Anda selesaikan.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-w-[200px]">
            <p className="text-sm text-slate-500 mb-1">Total Pendapatan Anda</p>
            <p className="text-2xl font-bold text-green-600">Rp {totalPendapatan.toLocaleString("id-ID")}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center">
            <History className="w-5 h-5 mr-2 text-ocean" />
            <h2 className="font-bold text-ink">Semua Riwayat ({jobs.length})</h2>
          </div>

          {myJobsQuery.isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-ink mb-1">Belum ada riwayat</p>
              <p className="text-slate-500">Anda belum menyelesaikan pengiriman apapun.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {job.status === "COMPLETED" ? (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded mb-2 inline-block">SELESAI</span>
                      ) : (
                        <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded mb-2 inline-block">DIKEMBALIKAN</span>
                      )}
                      <h3 className="font-bold text-ink">Order ID: {job.id.split("-")[0]}</h3>
                      <p className="text-xs text-slate-500 mt-1">Selesai pada: {new Date(job.created_at).toLocaleString("id-ID")}</p>
                    </div>
                    <div className="text-right">
                      {job.status === "COMPLETED" ? (
                        <>
                          <p className="font-bold text-green-600">+ Rp {Number(job.delivery_fee).toLocaleString("id-ID")}</p>
                          <p className="text-[10px] text-slate-400">Pendapatan Masuk</p>
                        </>
                      ) : (
                        <p className="font-bold text-slate-400">Rp 0</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-slate-500 mb-1">Diambil dari:</p>
                      <p className="font-semibold text-ink">{job.store_name}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-slate-500 mb-1">Diantar ke:</p>
                      <p className="font-semibold text-ink">{job.buyer_name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
