"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { api } from "@/services/api";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/Button";

type Voucher = {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  max_discount: string | null;
  min_purchase: string;
  max_usage: number;
  current_usage: number;
  expiry_date: string;
  is_active: number;
};

export default function AdminVouchersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    max_discount: "",
    min_purchase: "0",
    max_usage: "1",
    expiry_date: ""
  });

  const vouchersQuery = useQuery({
    queryKey: ["admin-vouchers"],
    queryFn: async () => {
      const response = await api.get<{ data: Voucher[] }>("/admin/vouchers");
      return response.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post("/admin/vouchers", {
      ...form,
      discount_value: Number(form.discount_value),
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      min_purchase: Number(form.min_purchase),
      max_usage: Number(form.max_usage)
    }),
    onSuccess: () => {
      Swal.fire("Berhasil", "Voucher dibuat", "success");
      setShowForm(false);
      setForm({
        code: "", discount_type: "percentage", discount_value: "", max_discount: "", min_purchase: "0", max_usage: "1", expiry_date: ""
      });
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
    },
    onError: (err: any) => Swal.fire("Gagal", err.response?.data?.message || "Error", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/vouchers/${id}`),
    onSuccess: () => {
      Swal.fire("Terhapus", "Voucher dihapus", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Hapus Voucher?",
      text: "Tindakan ini tidak bisa dibatalkan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal"
    }).then((res) => {
      if (res.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const vouchers = vouchersQuery.data || [];

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Voucher & Promo</h1>
          <p className="text-slate-400 mt-2">Kelola kode diskon untuk event SEAPEDIA.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-5 h-5 mr-2" />
          {showForm ? "Batal" : "Buat Voucher"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-white mb-4">Buat Voucher Baru</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Kode Voucher</label>
              <input required type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={form.code} onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="PROMO2026" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tipe Diskon</label>
              <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={form.discount_type} onChange={(e) => setForm({...form, discount_type: e.target.value})}>
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nilai Diskon</label>
              <input required type="number" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={form.discount_value} onChange={(e) => setForm({...form, discount_value: e.target.value})} placeholder={form.discount_type === "percentage" ? "10" : "50000"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Max Diskon (Opsional untuk %)</label>
              <input type="number" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={form.max_discount} onChange={(e) => setForm({...form, max_discount: e.target.value})} placeholder="20000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Min Belanja</label>
              <input required type="number" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={form.min_purchase} onChange={(e) => setForm({...form, min_purchase: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Kuota (Max Usage)</label>
              <input required type="number" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={form.max_usage} onChange={(e) => setForm({...form, max_usage: e.target.value})} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1">Tanggal Berakhir</label>
              <input required type="datetime-local" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={form.expiry_date} onChange={(e) => setForm({...form, expiry_date: e.target.value})} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={createMutation.isPending}>Simpan Voucher</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-sm">
                <th className="px-6 py-4 font-medium">Kode</th>
                <th className="px-6 py-4 font-medium">Nilai</th>
                <th className="px-6 py-4 font-medium">S & K</th>
                <th className="px-6 py-4 font-medium">Terpakai</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {vouchersQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Tidak ada voucher.</td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-900/50 transition-colors text-slate-300">
                    <td className="px-6 py-4">
                      <span className="font-bold text-white bg-indigo-500/20 px-2 py-1 rounded border border-indigo-500/30">{v.code}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-400">
                      {v.discount_type === "percentage" ? `${Number(v.discount_value)}%` : `Rp ${Number(v.discount_value).toLocaleString("id-ID")}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      <div>Min: Rp {Number(v.min_purchase).toLocaleString("id-ID")}</div>
                      {v.max_discount && <div>Max: Rp {Number(v.max_discount).toLocaleString("id-ID")}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {v.current_usage} / {v.max_usage}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(v.expiry_date) < new Date() ? (
                         <span className="text-red-400 text-xs font-bold">EXPIRED</span>
                      ) : v.current_usage >= v.max_usage ? (
                         <span className="text-orange-400 text-xs font-bold">HABIS</span>
                      ) : (
                         <span className="text-green-400 text-xs font-bold">AKTIF</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(v.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
