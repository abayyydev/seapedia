"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Percent, Truck } from "lucide-react";
import Swal from "sweetalert2";
import { api } from "@/services/api";

type DeliveryOption = {
  value: string;
  label: string;
  price: number;
  slaHours: number;
};

type AppConfig = {
  taxRate: number;
  deliveryOptions: DeliveryOption[];
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [taxRate, setTaxRate] = useState<number>(12);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);

  const configQuery = useQuery({
    queryKey: ["admin-config"],
    queryFn: async () => {
      const response = await api.get<{ data: AppConfig }>("/public/config");
      return response.data.data;
    }
  });

  useEffect(() => {
    if (configQuery.data) {
      setTaxRate(configQuery.data.taxRate * 100);
      setDeliveryOptions(configQuery.data.deliveryOptions);
    }
  }, [configQuery.data]);

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: AppConfig) => api.put("/admin/config", newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-config"] });
      Swal.fire("Tersimpan", "Konfigurasi sistem berhasil diperbarui secara dinamis!", "success");
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menyimpan pengaturan.", "error");
    }
  });

  const handleSave = () => {
    updateConfigMutation.mutate({
      taxRate: taxRate / 100,
      deliveryOptions
    });
  };

  const handleDeliveryPriceChange = (index: number, newPrice: string) => {
    const newOptions = [...deliveryOptions];
    newOptions[index].price = Number(newPrice);
    setDeliveryOptions(newOptions);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-slate-400 mt-2">Konfigurasi nilai PPN dan tarif pengiriman secara *real-time*.</p>
      </div>

      {configQuery.isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          {/* Tax Setting */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white flex items-center mb-4">
              <Percent className="w-5 h-5 mr-2 text-indigo-400" />
              Biaya Administrasi (PPN)
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Persentase (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Nilai ini akan otomatis digunakan pada setiap transaksi *checkout*.</p>
          </div>

          {/* Delivery Settings */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white flex items-center mb-4">
              <Truck className="w-5 h-5 mr-2 text-indigo-400" />
              Tarif Ongkos Kirim (Driver)
            </h2>
            <div className="space-y-4">
              {deliveryOptions.map((opt, idx) => (
                <div key={opt.value} className="grid grid-cols-2 gap-4 items-center p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-sm font-bold text-white">{opt.label}</p>
                    <p className="text-xs text-slate-500">SLA: {opt.slaHours} Jam</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={opt.price}
                      onChange={(e) => handleDeliveryPriceChange(idx, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={updateConfigMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center shadow-lg shadow-indigo-900/20 disabled:opacity-50 transition-colors"
            >
              <Save className="w-5 h-5 mr-2" />
              Simpan Pengaturan
            </button>
          </div>
        </div>
      )}
    </>
  );
}
