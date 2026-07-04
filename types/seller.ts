export type Store = {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Product = {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
};