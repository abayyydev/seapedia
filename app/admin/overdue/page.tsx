"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PackageSearch, AlertTriangle, CheckCircle, RefreshCcw, Clock } from "lucide-react";
import Swal from "sweetalert2";
import { api } from "@/services/api";
import { Button } from "@/components/ui/Button";

type OverdueOrder = {
  id: string;
  store_id: string;
  user_id: string;
  total_amount: string;
  status: string;
  delivery_type: string;
  sla_deadline: string;
  created_at: string;
  store_name: string;
  buyer_name: string;
  buyer_email: string;
};

export default function AdminOverduePage() {
  const queryClient = useQueryClient();

  const overdueQuery = useQuery({
    queryKey: ["admin-overdue-orders"],
    queryFn: async () => {
      const response = await api.get<{ data: OverdueOrder[] }>("/admin/orders/overdue");
      return response.data.data;
    }
  });

  const processMutation = useMutation({
    mutationFn: async () => api.post<{ data: { processedCount: number, message: string } }>("/admin/orders/overdue/process"),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-overdue-orders"] });
      Swal.fire({
        title: "Auto-Refund Berhasil",
        text: res.data.data.message,
        icon: "success"
      });
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal memproses pesanan overdue.", "error");
    }
  });

  const orders = overdueQuery.data || [];

  function handleProcessOverdue() {
    if (orders.length === 0) return;
    
    Swal.fire({
      title: "Proses Overdue Massal?",
      html: `Anda akan melakukan Auto-Refund untuk <b>${orders.length}</b> pesanan yang gagal memenuhi SLA pengiriman.<br><br>Dana akan dikembalikan ke wallet pembeli dan stok produk akan dikembalikan ke penjual.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Eksekusi Sekarang",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444"
    }).then((result) => {
      if (result.isConfirmed) {
        processMutation.mutate();
      }
    });
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overdue Orders (SLA)</h1>
          <p className="text-slate-400 mt-2">Daftar pesanan yang telah melewati batas waktu pengiriman.</p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-900/50 flex items-center gap-2"
          onClick={handleProcessOverdue}
          disabled={orders.length === 0 || processMutation.isPending}
        >
          {processMutation.isPending ? (
            <RefreshCcw className="w-5 h-5 animate-spin" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {processMutation.isPending ? "Memproses..." : "Proses Semua Auto-Refund"}
        </Button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-sm">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Store & Buyer</th>
                <th className="px-6 py-4 font-medium">Tipe Pengiriman</th>
                <th className="px-6 py-4 font-medium">Status Terakhir</th>
                <th className="px-6 py-4 font-medium">SLA Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {overdueQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-3"></div>
                    Memuat data...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-300">Semua Terkendali</h3>
                    <p className="text-slate-500 mt-1">Tidak ada pesanan yang melanggar batas SLA saat ini.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const deadline = new Date(order.sla_deadline);
                  const now = new Date();
                  const overdueHours = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60));
                  
                  return (
                    <tr key={order.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-500">{order.id.split("-")[0]}</span><br/>
                        <span className="font-bold text-coral text-sm">Rp {Number(order.total_amount).toLocaleString("id-ID")}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{order.store_name}</div>
                        <div className="text-sm text-slate-400">➡️ {order.buyer_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                          {order.delivery_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-red-400 font-medium">
                          <Clock className="w-4 h-4 mr-2" />
                          {deadline.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                        </div>
                        <div className="text-xs text-red-500 mt-1">
                          (Lewat {overdueHours} jam)
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
