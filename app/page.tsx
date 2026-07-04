"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { ShoppingCart, PackageSearch, Store, Star, ShieldCheck, Zap, Users, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/layout/AuthModal";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

type PublicProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  store: { id: string; name: string };
};

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
};

function PublicReviews() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });

  const reviewsQuery = useQuery({
    queryKey: ["public-reviews"],
    queryFn: async () => {
      const response = await api.get<{ data: Review[] }>("/public/reviews");
      return response.data.data;
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => api.post("/public/reviews", form),
    onSuccess: () => {
      setForm({ name: "", rating: 5, comment: "" });
      queryClient.invalidateQueries({ queryKey: ["public-reviews"] });
      Swal.fire("Terima Kasih", "Ulasan Anda telah dikirim!", "success");
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal mengirim ulasan", "error");
    }
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitMutation.mutate();
  }

  const reviews = reviewsQuery.data || [];

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      {/* Review Form */}
      <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-ocean/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <h3 className="font-extrabold text-2xl text-ink mb-6 relative z-10">Tulis Ulasan</h3>
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Anda</label>
            <input 
              required 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ocean/50 focus:border-ocean transition-all" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="Jhon Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ocean/50 focus:border-ocean transition-all appearance-none"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            >
              <option value={5}>⭐⭐⭐⭐⭐ Luar Biasa</option>
              <option value={4}>⭐⭐⭐⭐ Sangat Bagus</option>
              <option value={3}>⭐⭐⭐ Cukup Bagus</option>
              <option value={2}>⭐⭐ Kurang Memuaskan</option>
              <option value={1}>⭐ Mengecewakan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ceritakan Pengalaman Anda</label>
            <textarea 
              required 
              rows={4} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ocean/50 focus:border-ocean resize-none transition-all" 
              value={form.comment} 
              onChange={(e) => setForm({ ...form, comment: e.target.value })} 
              placeholder="Bagaimana pelayanan kami?"
            ></textarea>
          </div>
          <Button type="submit" disabled={submitMutation.isPending} className="w-full py-4 text-base rounded-xl shadow-lg shadow-ocean/30">
            Kirim Ulasan Sekarang
          </Button>
        </form>
      </div>

      {/* Review List */}
      <div className="lg:col-span-2">
        {reviewsQuery.isLoading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center p-16 bg-white rounded-3xl border border-slate-200 shadow-sm border-dashed">
            <Star className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-ink mb-2">Belum ada jejak</h3>
            <p className="text-slate-500">Jadilah pionir! Bagikan pengalaman pertama Anda berbelanja di SEAPEDIA.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">"{review.comment}"</p>
                <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-4 mt-auto">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-ink">{review.name}</span>
                  </div>
                  <span className="text-slate-400">{new Date(review.created_at).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "login" | "register" }>({
    open: false,
    mode: "register",
  });

  const productsQuery = useQuery({
    queryKey: ["public-products"],
    queryFn: async () => {
      const response = await api.get<{ data: PublicProduct[] }>("/public/products");
      return response.data.data;
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => api.post("/buyer/cart", { productId, quantity: 1 }),
    onSuccess: () => {
      Swal.fire({
        title: "Dimasukkan ke Keranjang!",
        icon: "success",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      queryClient.invalidateQueries({ queryKey: ["buyer-cart"] });
    },
    onError: (err: any) => {
      Swal.fire("Ups!", err.response?.data?.message || "Gagal menambah ke keranjang", "warning");
    }
  });

  const handleAddToCart = (productId: string) => {
    if (!user || user.activeRole !== "BUYER") {
      Swal.fire({
        title: "Akses Terbatas",
        text: "Silakan login sebagai Pembeli (Buyer) untuk mulai berbelanja.",
        icon: "info",
        confirmButtonColor: "#3b82f6"
      });
      return;
    }
    addToCartMutation.mutate(productId);
  };

  const products = productsQuery.data || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-ocean/30 selection:text-ocean-dark flex flex-col">
      <Navbar />
      {authModal.open && (
        <AuthModal initialMode={authModal.mode} onClose={() => setAuthModal({ open: false, mode: "register" })} />
      )}

      {/* Modern Hero Section - Dark gradient for contrast */}
      <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden bg-slate-950">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold text-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
            Revolusi E-Commerce Era Baru
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white leading-[1.1]">
            Jelajahi, Beli, & Jual <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400">
              Tanpa Batasan
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Satu platform, ragam peran. Jadilah Pembeli cerdas, Penjual sukses, atau Kurir andal hanya dengan satu akun di SEAPEDIA.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a href="#katalog" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-900/40 transition-all hover:-translate-y-1 flex items-center group w-full sm:w-auto justify-center">
              Mulai Belanja
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
            {!user && (
              <button onClick={() => setAuthModal({ open: true, mode: "register" })} className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold text-lg transition-all w-full sm:w-auto text-center backdrop-blur-sm">
                Daftar Sekarang
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Mengapa SEAPEDIA?</h2>
            <p className="text-slate-400">Inovasi yang membuat kami berbeda dari yang lain.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Peran Fleksibel</h3>
              <p className="text-slate-400 leading-relaxed">Satu akun untuk semua. Bertransisi mulus antara mode Pembeli, Penjual, dan Kurir dalam sekejap mata.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Single-Store Checkout</h3>
              <p className="text-slate-400 leading-relaxed">Sistem cerdas kami memastikan barang yang dibeli berasal dari toko yang sama demi ongkir yang presisi dan efisien.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Split Payout Otomatis</h3>
              <p className="text-slate-400 leading-relaxed">Saat kurir menyelesaikan tugas, sistem otomatis membagi pendapatan dengan adil untuk penjual dan kurir.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <section id="katalog" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Katalog Pilihan</h2>
              <p className="text-slate-500">Temukan barang impianmu hari ini.</p>
            </div>
            <div className="mt-4 md:mt-0 px-4 py-2 bg-white rounded-full border border-slate-200 text-sm font-medium text-slate-600 shadow-sm inline-flex items-center">
              <PackageSearch className="w-4 h-4 mr-2" />
              Tersedia {products.length} Produk
            </div>
          </div>

          {productsQuery.isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm border-dashed">
              <Store className="w-20 h-20 text-slate-200 mx-auto mb-5" />
              <h3 className="text-2xl font-bold text-ink mb-2">Toko Masih Sepi</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Belum ada penjual yang memamerkan produknya. Datang lagi nanti ya!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col hover:-translate-y-2">
                  <div className="aspect-square bg-slate-50 relative overflow-hidden p-4">
                    {product.imageUrl ? (
                      <div className="w-full h-full rounded-2xl overflow-hidden relative">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">Belum ada Foto</div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-sm tracking-widest shadow-xl rotate-12">HABIS</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center text-xs font-semibold text-ocean bg-ocean/10 px-3 py-1.5 rounded-lg mb-4 w-fit">
                      <Store className="w-3.5 h-3.5 mr-1.5" />
                      <span className="truncate max-w-[120px]">{product.store.name}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-snug mb-3 group-hover:text-ocean transition-colors">{product.name}</h3>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-0.5">Harga</p>
                        <p className="text-xl font-extrabold text-slate-900">Rp {product.price.toLocaleString("id-ID")}</p>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.stock === 0 || addToCartMutation.isPending}
                        className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-ocean hover:shadow-lg hover:shadow-ocean/30 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 group/btn"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Public Reviews Section */}
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-ocean/20 rounded-full blur-[100px] -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Suara Komunitas</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Mereka yang telah merasakan pengalaman revolusioner berbelanja dan berjualan di SEAPEDIA.</p>
          </div>
          
          <PublicReviews />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="font-extrabold text-2xl text-white tracking-tight mb-4">
            SEA<span className="text-ocean">PEDIA</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} SEAPEDIA Enterprise Edition. Seluruh Hak Cipta Dilindungi.<br/>
            Dibangun dengan standar keamanan tertinggi dan arsitektur kelas dunia.
          </p>
        </div>
      </footer>
    </div>
  );
}