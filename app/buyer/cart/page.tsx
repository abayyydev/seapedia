"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Trash2, Store, Ticket } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { useState } from "react";

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

type StoreCart = {
  storeId: string;
  storeName: string;
  items: CartItem[];
};

type ConfigData = {
  taxRate: number;
  deliveryOptions: { value: string; label: string; price: number; slaHours: number }[];
};

export default function CartPage() {
  const queryClient = useQueryClient();
  const [voucherInputs, setVoucherInputs] = useState<Record<string, string>>({});
  const [appliedVouchers, setAppliedVouchers] = useState<Record<string, { code: string, discountAmount: number }>>({});
  const [deliveryTypes, setDeliveryTypes] = useState<Record<string, string>>({});

  const configQuery = useQuery({
    queryKey: ["app-config"],
    queryFn: async () => {
      const response = await api.get<{ data: ConfigData }>("/public/config");
      return response.data.data;
    }
  });

  const config = configQuery.data || {
    taxRate: 0.12,
    deliveryOptions: [
      { value: "REGULAR", label: "Regular (Maks 72 Jam)", price: 10000, slaHours: 72 }
    ]
  };

  const cartQuery = useQuery({
    queryKey: ["buyer-cart"],
    queryFn: async () => {
      const response = await api.get<{ data: StoreCart[] }>("/buyer/cart");
      return response.data.data;
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => api.delete(`/buyer/cart/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menghapus produk dari keranjang.", "error");
    }
  });

  const applyVoucherMutation = useMutation({
    mutationFn: async (data: { storeId: string, voucherCode: string }) => 
      api.post<{ data: { code: string, discountAmount: number } }>("/buyer/cart/apply-voucher", data),
    onSuccess: (res, variables) => {
      setAppliedVouchers(prev => ({
        ...prev,
        [variables.storeId]: res.data.data
      }));
      Swal.fire("Berhasil", "Voucher berhasil digunakan!", "success");
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Voucher tidak valid", "error");
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: { storeId: string, voucherCode?: string, deliveryType: string }) => api.post("/buyer/checkout", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
      queryClient.invalidateQueries({ queryKey: ["buyer-wallet"] });
      Swal.fire("Berhasil", "Checkout berhasil! Pesanan Anda sedang diproses.", "success");
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal melakukan checkout.", "error");
    }
  });

  const cartStores = cartQuery.data || [];

  function handleApplyVoucher(storeId: string) {
    const code = voucherInputs[storeId];
    if (!code) return;
    applyVoucherMutation.mutate({ storeId, voucherCode: code });
  }

  function handleCheckout(storeId: string) {
    Swal.fire({
      title: "Konfirmasi Checkout",
      text: "Total belanja akan dipotong dari saldo SEAPEDIA Pay Anda.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Bayar Sekarang",
      cancelButtonText: "Batal",
      confirmButtonColor: "#0ea5e9"
    }).then((result) => {
      if (result.isConfirmed) {
        checkoutMutation.mutate({ 
          storeId, 
          voucherCode: appliedVouchers[storeId]?.code,
          deliveryType: deliveryTypes[storeId] || "REGULAR"
        });
      }
    });
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Keranjang Belanja</h1>
        <p className="text-sm text-slate-500 mt-1">Periksa kembali barang belanjaan Anda sebelum checkout.</p>
      </div>

      {cartStores.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed text-center">
          <ShoppingCart className="w-12 h-12 text-slate-400 mb-4" />
          <h2 className="text-xl font-bold text-ink mb-2">Keranjang belanja Anda kosong</h2>
          <p className="text-slate-500 max-w-md">Silakan cari produk yang Anda inginkan dan tambahkan ke keranjang.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {cartStores.map((store) => {
            const storeTotal = store.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const appliedVoucher = appliedVouchers[store.storeId];
            const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
            const discountedSubtotal = storeTotal - discountAmount;
            const taxAmount = Math.round(discountedSubtotal * config.taxRate);
            const selectedDelivery = deliveryTypes[store.storeId] || "REGULAR";
            const deliveryFee = config.deliveryOptions.find(d => d.value === selectedDelivery)?.price || 10000;
            const finalTotal = discountedSubtotal + taxAmount + deliveryFee;

            return (
              <div key={store.storeId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center font-bold text-ink">
                    <Store className="w-5 h-5 mr-2 text-ocean" />
                    {store.storeName}
                  </div>
                </div>
                
                <div className="p-6 space-y-4 border-b border-slate-200">
                  {store.items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-ink line-clamp-1">{item.name}</h3>
                        <p className="text-sm text-coral font-medium mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                        <p className="text-xs text-slate-500 mt-1">Jumlah: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-ink mb-2">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                        <button 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => removeMutation.mutate(item.id)}
                          title="Hapus item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-slate-50">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center">
                        <Ticket className="w-4 h-4 mr-2" /> Kode Promo / Voucher
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Masukkan kode voucher" 
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-ocean focus:ring-1 focus:ring-ocean outline-none"
                          value={voucherInputs[store.storeId] || ""}
                          onChange={(e) => setVoucherInputs({...voucherInputs, [store.storeId]: e.target.value.toUpperCase()})}
                          disabled={!!appliedVoucher}
                        />
                        {!appliedVoucher ? (
                          <Button variant="outline" onClick={() => handleApplyVoucher(store.storeId)} disabled={!voucherInputs[store.storeId] || applyVoucherMutation.isPending}>
                            Terapkan
                          </Button>
                        ) : (
                          <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-50" onClick={() => {
                            const newVouchers = {...appliedVouchers};
                            delete newVouchers[store.storeId];
                            setAppliedVouchers(newVouchers);
                            const newInputs = {...voucherInputs};
                            newInputs[store.storeId] = "";
                            setVoucherInputs(newInputs);
                          }}>
                            Batal
                          </Button>
                        )}
                      </div>
                      {appliedVoucher && (
                        <p className="text-xs text-emerald-600 font-bold">✓ Voucher {appliedVoucher.code} berhasil digunakan!</p>
                      )}
                    </div>
                    
                    <div className="flex-[1.5] space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Subtotal:</span>
                        <span className="font-medium text-ink">Rp {storeTotal.toLocaleString("id-ID")}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>Diskon Voucher ({appliedVoucher?.code}):</span>
                          <span className="font-medium">- Rp {discountAmount.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>PPN {config.taxRate * 100}%:</span>
                        <span className="font-medium text-ink">Rp {taxAmount.toLocaleString("id-ID")}</span>
                      </div>
                      
                      <div className="pt-2 pb-2">
                        <label className="text-sm font-bold text-slate-700 block mb-2">Metode Pengiriman:</label>
                        <select 
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-ocean focus:ring-1 focus:ring-ocean outline-none"
                          value={selectedDelivery}
                          onChange={(e) => setDeliveryTypes({...deliveryTypes, [store.storeId]: e.target.value})}
                        >
                          {config.deliveryOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label} - Rp {opt.price.toLocaleString("id-ID")}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Ongkos Kirim:</span>
                        <span className="font-medium text-ink">Rp {deliveryFee.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-ink pt-3 border-t border-slate-200">
                        <span>Total Tagihan:</span>
                        <span className="text-coral">Rp {finalTotal.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-end mt-4 pt-2">
                        <Button onClick={() => handleCheckout(store.storeId)} disabled={checkoutMutation.isPending} className="w-full md:w-auto">
                          Checkout Sekarang
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
