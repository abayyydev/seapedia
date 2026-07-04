"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Store as StoreIcon, Trash2, X, Pencil } from "lucide-react";
import { FormEvent, useState, useRef } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import type { Product, Store } from "@/types/seller";
import Link from "next/link";

type ProductResponse = {
  store: Store | null;
  products: Product[];
};

export default function SellerProductsPage() {
  const queryClient = useQueryClient();
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", stock: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductForm, setEditProductForm] = useState({ id: "", name: "", description: "", price: "", stock: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const productsQuery = useQuery({
    queryKey: ["seller-products"],
    queryFn: async () => {
      const response = await api.get<{ data: ProductResponse }>("/seller/products");
      return response.data.data;
    }
  });

  const productMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", productForm.price);
      formData.append("stock", productForm.stock);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.post<{ data: Product }>("/seller/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data.data;
    },
    onSuccess: () => {
      setProductForm({ name: "", description: "", price: "", stock: "" });
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsProductModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      Swal.fire("Berhasil", "Produk berhasil ditambahkan!", "success");
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Produk gagal ditambahkan.", "error");
    }
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (editProductForm.name) formData.append("name", editProductForm.name);
      if (editProductForm.description) formData.append("description", editProductForm.description);
      if (editProductForm.price) formData.append("price", editProductForm.price);
      if (editProductForm.stock) formData.append("stock", editProductForm.stock);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.patch<{ data: Product }>(`/seller/products/${editProductForm.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data.data;
    },
    onSuccess: () => {
      setEditProductForm({ id: "", name: "", description: "", price: "", stock: "" });
      setImageFile(null);
      if (editFileInputRef.current) editFileInputRef.current.value = "";
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      Swal.fire("Berhasil", "Produk berhasil diperbarui!", "success");
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Produk gagal diperbarui.", "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => api.delete(`/seller/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      Swal.fire("Terhapus", "Produk berhasil dihapus.", "success");
    },
    onError: (err: any) => {
      Swal.fire("Gagal", err.response?.data?.message || "Produk gagal dihapus.", "error");
    }
  });

  const store = productsQuery.data?.store;
  const products = productsQuery.data?.products || [];

  function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    productMutation.mutate();
  }

  function submitEditProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    editMutation.mutate();
  }

  function openEditModal(product: Product) {
    setEditProductForm({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setImageFile(null);
    setIsEditModalOpen(true);
  }

  function confirmDelete(productId: string) {
    Swal.fire({
      title: "Hapus produk ini?",
      text: "Anda tidak dapat mengembalikannya!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(productId);
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Products Management</h1>
          <p className="text-sm text-slate-500 mt-1">Tambah, ubah, dan hapus produk yang Anda jual.</p>
        </div>
        {store ? (
          <Button onClick={() => setIsProductModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        ) : null}
      </div>

      {!store ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed text-center">
          <StoreIcon className="w-12 h-12 text-slate-400 mb-4" />
          <h2 className="text-xl font-bold text-ink mb-2">Anda belum memiliki toko</h2>
          <p className="text-slate-500 mb-6 max-w-md">Silakan buat toko Anda terlebih dahulu di halaman Dashboard.</p>
          <Link href="/seller">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-ink">Daftar Produk ({products.length})</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <div key={product.id} className="rounded-2xl border border-slate-200 overflow-hidden group shadow-sm hover:shadow-md transition">
                  <div className="aspect-square bg-slate-100 relative">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-ink line-clamp-1">{product.name}</h3>
                    <p className="mt-1 text-sm font-medium text-coral">Rp {product.price.toLocaleString("id-ID")}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Stock: {product.stock}</span>
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-1.5 text-slate-400 hover:text-ocean hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => openEditModal(product)}
                          title="Edit product"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => confirmDelete(product.id)}
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  Belum ada produk. Tambahkan produk pertama Anda!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-ink">Add Product</h2>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitProduct} className="p-6">
              <input required minLength={3} placeholder="Product name" className="h-11 w-full rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-ocean mb-4" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} />
              <textarea placeholder="Description" className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean mb-4" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} />
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Price (Rp)</label>
                  <input required type="number" min="1" step="0.01" placeholder="Price" className="h-11 w-full rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-ocean" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Stock</label>
                  <input required type="number" min="0" step="1" placeholder="Stock" className="h-11 w-full rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-ocean" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-500 mb-1">Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-ocean file:text-white hover:file:bg-ocean/90" 
                  onChange={(event) => setImageFile(event.target.files ? event.target.files[0] : null)} 
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={productMutation.isPending}>Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-ink">Edit Product</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitEditProduct} className="p-6">
              <input required minLength={3} placeholder="Product name" className="h-11 w-full rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-ocean mb-4" value={editProductForm.name} onChange={(event) => setEditProductForm({ ...editProductForm, name: event.target.value })} />
              <textarea placeholder="Description" className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean mb-4" value={editProductForm.description} onChange={(event) => setEditProductForm({ ...editProductForm, description: event.target.value })} />
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Price (Rp)</label>
                  <input required type="number" min="1" step="0.01" placeholder="Price" className="h-11 w-full rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-ocean" value={editProductForm.price} onChange={(event) => setEditProductForm({ ...editProductForm, price: event.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Stock</label>
                  <input required type="number" min="0" step="1" placeholder="Stock" className="h-11 w-full rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-ocean" value={editProductForm.stock} onChange={(event) => setEditProductForm({ ...editProductForm, stock: event.target.value })} />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-500 mb-1">Product Image (Biarkan kosong jika tidak ingin mengubah)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={editFileInputRef}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-ocean file:text-white hover:file:bg-ocean/90" 
                  onChange={(event) => setImageFile(event.target.files ? event.target.files[0] : null)} 
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={editMutation.isPending}>Update</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}