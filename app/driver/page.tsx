"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Truck, CheckCircle2, Navigation, PackageSearch } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/Button";
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

export default function DriverDashboard() {
  const queryClient = useQueryClient();

  const availableJobsQuery = useQuery({
    queryKey: ["driver-available-jobs"],
    queryFn: async () => {
      const response = await api.get<{ data: Job[] }>("/driver/jobs/available");
      return response.data.data;
    },
    refetchInterval: 10000 // Poll every 10 seconds for new jobs
  });

  const myJobsQuery = useQuery({
    queryKey: ["driver-my-jobs"],
    queryFn: async () => {
      const response = await api.get<{ data: Job[] }>("/driver/jobs/my");
      return response.data.data;
    }
  });

  const acceptJobMutation = useMutation({
    mutationFn: async (orderId: string) => api.post(`/driver/jobs/${orderId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-available-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["driver-my-jobs"] });
      Swal.fire({
        title: "Pekerjaan Diterima",
        text: "Silakan ambil barang di toko dan antar ke pembeli.",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000
      });
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menerima pekerjaan.", "error");
    }
  });

  const completeJobMutation = useMutation({
    mutationFn: async (orderId: string) => api.post(`/driver/jobs/${orderId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-my-jobs"] });
      Swal.fire("Selesai", "Pesanan berhasil diantar!", "success");
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menyelesaikan pesanan.", "error");
    }
  });

  const availableJobs = availableJobsQuery.data || [];
  const myJobs = myJobsQuery.data?.filter(job => job.status === "DELIVERING") || [];

  return (
    <>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard Driver</h1>
          <p className="text-sm text-slate-500 mt-1">Terima pekerjaan dan antar pesanan pelanggan.</p>
        </div>
        <Link href="/driver/history" className="text-sm font-bold text-ocean hover:underline flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Riwayat Pekerjaan
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pekerjaan Aktif */}
        <section>
          <div className="bg-ocean/10 border border-ocean/20 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-ocean flex items-center mb-4">
              <Navigation className="w-5 h-5 mr-2" />
              Tugas Aktif ({myJobs.length})
            </h2>
            
            {myJobs.length === 0 ? (
              <p className="text-slate-600">Belum ada tugas pengiriman yang aktif.</p>
            ) : (
              <div className="space-y-4">
                {myJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded mb-2 inline-block">SEDANG DIANTAR</span>
                        <h3 className="font-bold text-ink">Order ID: {job.id.split("-")[0]}</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-slate-500 mb-1">Ambil di:</p>
                        <p className="font-semibold text-ink">{job.store_name}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-slate-500 mb-1">Antar ke:</p>
                        <p className="font-semibold text-ink">{job.buyer_name}</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => completeJobMutation.mutate(job.id)}
                      disabled={completeJobMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Selesaikan Pengiriman
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Pekerjaan Tersedia */}
        <section>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-ink flex items-center">
                <PackageSearch className="w-5 h-5 mr-2 text-ocean" />
                Pekerjaan Tersedia
              </h2>
              <span className="bg-ocean text-white text-xs font-bold px-2 py-1 rounded-full">{availableJobs.length}</span>
            </div>

            {availableJobs.length === 0 ? (
              <div className="p-8 text-center">
                <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Tidak ada pekerjaan baru saat ini.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {availableJobs.map((job) => (
                  <div key={job.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-ink">Order ID: {job.id.split("-")[0]}</h3>
                        <p className="text-xs text-slate-500 mt-1">{new Date(job.created_at).toLocaleString("id-ID")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+ Rp {Number(job.delivery_fee).toLocaleString("id-ID")}</p>
                        <p className="text-[10px] text-slate-400">Pendapatan Anda</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 mb-4 gap-2">
                      <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">{job.store_name}</span>
                      <span>&rarr;</span>
                      <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">{job.buyer_name}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => acceptJobMutation.mutate(job.id)}
                      disabled={acceptJobMutation.isPending || myJobs.length > 0} // Optional: limit 1 job at a time
                    >
                      Terima Pekerjaan
                    </Button>
                    {myJobs.length > 0 && <p className="text-xs text-red-500 mt-2 text-center">Selesaikan pekerjaan aktif Anda terlebih dahulu.</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
