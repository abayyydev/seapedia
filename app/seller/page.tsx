"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store as StoreIcon, Package, ShoppingBag } from "lucide-react";
import { FormEvent, useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import type { Product, Store } from "@/types/seller";

type ProductResponse = {
  store: Store | null;
  products: Product[];
};

export default function SellerDashboard() {
  const queryClient = useQueryClient();
  const [storeForm, setStoreForm] = useState({ name: "", description: "" });
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const productsQuery = useQuery({
    queryKey: ["seller-products"],
    queryFn: async () => {
      const response = await api.get<{ data: ProductResponse }>("/seller/products");
      return response.data.data;
    }
  });

  const storeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<{ data: Store }>("/seller/store", storeForm);
      return response.data.data;
    },
    onSuccess: () => {
      setStoreForm({ name: "", description: "" });
      setIsStoreModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-store"] });
      Swal.fire("Berhasil", "Toko berhasil dibuat!", "success");
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Toko gagal dibuat.", "error");
    }
  });

  const store = productsQuery.data?.store;
  const products = productsQuery.data?.products || [];

  function submitStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    storeMutation.mutate();
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Dashboard Toko</h1>
        <p className="text-sm text-slate-500 mt-1">Ringkasan bisnis Anda di SEAPEDIA.</p>
      </div>

      {!store ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed text-center">
          <StoreIcon className="w-12 h-12 text-slate-400 mb-4" />
          <h2 className="text-xl font-bold text-ink mb-2">Anda belum memiliki toko</h2>
          <p className="text-slate-500 mb-6 max-w-md">Buat toko Anda sekarang untuk mulai menjual produk dan mengelola pesanan.</p>
          <Button onClick={() => setIsStoreModalOpen(true)}>Create Store</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-ocean/10 flex items-center justify-center text-ocean">
              <StoreIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Nama Toko</p>
              <h3 className="font-bold text-ink text-lg">{store.name}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between group cursor-pointer transition hover:border-ocean">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center text-coral">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Produk</p>
                <h3 className="font-bold text-ink text-2xl">{products.length}</h3>
              </div>
            </div>
            <Link href="/seller/products" className="text-ocean text-sm font-medium opacity-0 group-hover:opacity-100 transition">Kelola &rarr;</Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between group cursor-pointer transition hover:border-ocean">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pesanan Masuk</p>
                <h3 className="font-bold text-ink text-lg">Cek di sini</h3>
              </div>
            </div>
            <Link href="/seller/orders" className="text-ocean text-sm font-medium opacity-0 group-hover:opacity-100 transition">Lihat &rarr;</Link>
          </div>
        </div>
      )}

      {/* Store Modal */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-ink">Create Store</h2>
              <button onClick={() => setIsStoreModalOpen(false)} className="text-slate-400 hover:text-ink">
                <span className="sr-only">Tutup</span>
                &times;
              </button>
            </div>
            <form onSubmit={submitStore} className="p-6">
              <input required minLength={3} placeholder="Store name" className="h-11 w-full rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-ocean mb-4" value={storeForm.name} onChange={(event) => setStoreForm({ ...storeForm, name: event.target.value })} />
              <textarea placeholder="Description" className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean mb-6" value={storeForm.description} onChange={(event) => setStoreForm({ ...storeForm, description: event.target.value })} />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsStoreModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={storeMutation.isPending}>Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}