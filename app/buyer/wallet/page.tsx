"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, Plus, X } from "lucide-react";
import { FormEvent, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";

export default function WalletPage() {
  const queryClient = useQueryClient();
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const walletQuery = useQuery({
    queryKey: ["buyer-wallet"],
    queryFn: async () => {
      const response = await api.get<{ data: { balance: number } }>("/buyer/wallet");
      return response.data.data;
    }
  });

  const topupMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/buyer/wallet/topup", { amount: Number(amount) });
      return response.data.data;
    },
    onSuccess: () => {
      setAmount("");
      setIsTopupModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["buyer-wallet"] });
      Swal.fire("Berhasil", "Top Up Saldo berhasil!", "success");
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal top up saldo.", "error");
    }
  });

  function submitTopup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    topupMutation.mutate();
  }

  const balance = walletQuery.data?.balance || 0;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Wallet</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola saldo SEAPEDIA Pay Anda.</p>
        </div>
        <Button onClick={() => setIsTopupModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Top Up Saldo
        </Button>
      </div>

      <div className="bg-gradient-to-r from-ocean to-blue-600 rounded-3xl p-8 text-white shadow-lg max-w-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Wallet className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <p className="text-blue-100 font-medium mb-2">Total Saldo</p>
          <h2 className="text-4xl font-bold">
            Rp {Number(balance).toLocaleString("id-ID")}
          </h2>
          <div className="mt-8">
            <p className="text-sm text-blue-100">Status: <span className="font-semibold text-white">Aktif</span></p>
          </div>
        </div>
      </div>

      {/* Topup Modal */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-ink">Top Up Saldo</h2>
              <button onClick={() => setIsTopupModalOpen(false)} className="text-slate-400 hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitTopup} className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Nominal Top Up (Rp)</label>
              <input 
                required 
                type="number" 
                min="10000" 
                step="1000"
                placeholder="Contoh: 50000" 
                className="h-11 w-full rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-ocean mb-6" 
                value={amount} 
                onChange={(event) => setAmount(event.target.value)} 
              />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsTopupModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={topupMutation.isPending}>Top Up Sekarang</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
