"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, PackageCheck, Truck, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";

type Order = {
  id: string;
  total_amount: string;
  status: string;
  created_at: string;
  buyer_id: string;
  buyer_name: string;
};

export default function SellerOrdersPage() {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => {
      const response = await api.get<{ data: Order[] }>("/seller/orders");
      return response.data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => 
      api.patch(`/seller/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      Swal.fire({
        title: "Status Diperbarui",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000
      });
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal mengubah status.", "error");
    }
  });

  const orders = ordersQuery.data || [];

  const handleUpdateStatus = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">Belum Dibayar</span>;
      case "PAID":
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Sedang Dikemas</span>;
      case "PACKED":
      case "WAITING_DRIVER":
        return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">Menunggu Pengirim</span>;
      case "DELIVERING":
        return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">Sedang Dikirim</span>;
      case "COMPLETED":
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Pesanan Selesai</span>;
      case "RETURNED":
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Dikembalikan</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Pesanan Masuk</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola pesanan dari pembeli dan atur pengiriman.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-ink">Daftar Pesanan ({orders.length})</h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-ink mb-1">Belum ada pesanan</h3>
            <p className="text-slate-500">Pesanan dari pembeli akan muncul di sini.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">ID: {order.id.split("-")[0]}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <h3 className="font-bold text-ink mb-1">Pembeli: {order.buyer_name}</h3>
                  <p className="text-sm text-slate-500">Tanggal: {new Date(order.created_at).toLocaleString("id-ID")}</p>
                </div>
                
                <div className="flex flex-col md:items-end gap-3">
                  <p className="font-bold text-coral text-lg">Rp {Number(order.total_amount).toLocaleString("id-ID")}</p>
                  
                  {/* Action Buttons based on status */}
                  <div className="flex gap-2">
                    {order.status === "PAID" && (
                      <Button size="sm" onClick={() => handleUpdateStatus(order.id, "PACKED")}>
                        <PackageCheck className="w-4 h-4 mr-2" />
                        Kemas Pesanan
                      </Button>
                    )}
                    
                    {order.status === "PACKED" && (
                      <Button size="sm" onClick={() => handleUpdateStatus(order.id, "WAITING_DRIVER")}>
                        <Truck className="w-4 h-4 mr-2" />
                        Panggil Driver
                      </Button>
                    )}
                    
                    {(order.status === "WAITING_DRIVER" || order.status === "DELIVERING") && (
                      <Button size="sm" variant="outline" disabled>
                        Menunggu Driver...
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
