import type { Product } from "@/data/products";
import { createProduct, deleteProductById, getProductById, getProductBySlug, listProducts, replaceAllProducts } from "@/lib/db";

export async function getCatalogProducts(): Promise<Product[]> {
  return listProducts() as Product[];
}

export async function saveCatalogProducts(products: Product[]) {
  return replaceAllProducts(products);
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | undefined> {
  return getProductBySlug(slug) as Product | undefined;
}

export async function getCatalogProductById(id: string): Promise<Product | undefined> {
  return getProductById(id) as Product | undefined;
}

export async function addCatalogProduct(input: {
  name: string;
  category: string;
  price: number;
  stock: number;
  fabric: string;
  description?: string;
  badge?: string;
  images?: string[];
  colors?: Array<{ name: string; hex: string }>;
  sizes?: string[];
}) {
  return createProduct(input) as Product;
}

export async function deleteCatalogProduct(id: string) {
  return deleteProductById(id);
}
