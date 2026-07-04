"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Shield, User, Store, Truck } from "lucide-react";
import { api } from "@/services/api";

type UserData = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  activeRole: string | null;
  created_at: string;
};

export default function AdminUsersPage() {
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await api.get<{ data: UserData[] }>("/admin/users");
      return response.data.data;
    }
  });

  const users = usersQuery.data || [];

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "ADMIN": return <span key={role} className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">ADMIN</span>;
      case "BUYER": return <span key={role} className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold">BUYER</span>;
      case "SELLER": return <span key={role} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">SELLER</span>;
      case "DRIVER": return <span key={role} className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded text-[10px] font-bold">DRIVER</span>;
      default: return null;
    }
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-slate-400 mt-2">Daftar seluruh pengguna yang terdaftar di SEAPEDIA.</p>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-sm">
                <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Registered Roles</th>
                <th className="px-6 py-4 font-medium">Joined At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {usersQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-3"></div>
                    Memuat data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-500">{user.id.split("-")[0]}</span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {user.roles.map(getRoleBadge)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(user.created_at).toLocaleDateString("id-ID")}
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
