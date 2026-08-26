import type { Product } from "@/data/products";
import { createProduct, deleteProductById, getProductById, getProductBySlug, listProducts, replaceAllProducts } from "@/lib/db";

export async function getCatalogProducts(): Promise<Product[]> {
  return (await listProducts()) as Product[];
}

export async function saveCatalogProducts(products: Product[]) {
  return await replaceAllProducts(products);
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | undefined> {
  return await getProductBySlug(slug);
}

export async function getCatalogProductById(id: string): Promise<Product | undefined> {
  return await getProductById(id);
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
  return await createProduct(input) as Product;
}

export async function deleteCatalogProduct(id: string) {
  return await deleteProductById(id);
}
