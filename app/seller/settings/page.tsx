"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store as StoreIcon } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";

export default function SellerSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", description: "" });

  const storeQuery = useQuery({
    queryKey: ["seller-store"],
    queryFn: async () => {
      const response = await api.get("/seller/store");
      return response.data.data;
    }
  });

  useEffect(() => {
    if (storeQuery.data) {
      setForm({
        name: storeQuery.data.name || "",
        description: storeQuery.data.description || ""
      });
    }
  }, [storeQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch("/seller/store", form);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-store"] });
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      Swal.fire("Berhasil", "Pengaturan toko diperbarui!", "success");
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal memperbarui pengaturan.", "error");
    }
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateMutation.mutate();
  }

  const store = storeQuery.data;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Pengaturan Toko</h1>
        <p className="text-sm text-slate-500 mt-1">Ubah profil dan informasi toko Anda.</p>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-ink flex items-center">
            <StoreIcon className="w-5 h-5 mr-2 text-ocean" />
            Profil Toko
          </h2>
        </div>

        {storeQuery.isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean"></div>
          </div>
        ) : !store ? (
          <div className="p-12 text-center text-slate-500">
            Anda belum membuat toko. Silakan buat toko terlebih dahulu di halaman Dashboard.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Toko</label>
                <input
                  required
                  minLength={3}
                  type="text"
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-ocean"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Toko</label>
                <textarea
                  className="min-h-32 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
