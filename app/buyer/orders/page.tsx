"use client";

import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Store, ChevronRight } from "lucide-react";
import { api } from "@/services/api";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
};

type Order = {
  id: string;
  store_name: string;
  subtotal: string;
  tax_amount: string;
  delivery_fee: string;
  total_amount: string;
  status: string;
  created_at: string;
  items: OrderItem[];
};

export default function BuyerOrdersPage() {
  const ordersQuery = useQuery({
    queryKey: ["buyer-orders"],
    queryFn: async () => {
      const response = await api.get<{ data: Order[] }>("/buyer/orders");
      return response.data.data;
    }
  });

  const orders = ordersQuery.data || [];

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
        <h1 className="text-2xl font-bold text-ink">Pesanan Saya</h1>
        <p className="text-sm text-slate-500 mt-1">Lacak status pesanan Anda dari berbagai toko.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-ink">Riwayat Pesanan ({orders.length})</h2>
        </div>
        
        {ordersQuery.isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-ink mb-1">Belum ada pesanan</h3>
            <p className="text-slate-500">Mulai berbelanja dan pesanan Anda akan muncul di sini.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">ID: {order.id.split("-")[0]}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <h3 className="font-bold text-ink flex items-center mb-1">
                      <Store className="w-4 h-4 mr-2 text-ocean" />
                      {order.store_name}
                    </h3>
                    <p className="text-sm text-slate-500">Tanggal: {new Date(order.created_at).toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex flex-col md:items-end gap-1 min-w-[200px]">
                    <div className="w-full space-y-1 text-sm border-b border-slate-200 pb-2 mb-1">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span>Rp {Number(order.subtotal || 0).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>PPN 12%</span>
                        <span>Rp {Number(order.tax_amount || 0).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Ongkir</span>
                        <span>Rp {Number(order.delivery_fee || 0).toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    <div className="flex justify-between w-full font-bold">
                      <span className="text-slate-600">Total</span>
                      <span className="text-coral">Rp {Number(order.total_amount).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-ink mb-3">Rincian Barang</h4>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">No Image</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-ink text-sm line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.quantity} x Rp {item.price.toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                    ))}
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
