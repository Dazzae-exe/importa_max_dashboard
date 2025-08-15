import type { Product } from '@/pages/Products';
import { createClient } from '@supabase/supabase-js';
import type { Orders } from '../types/OrderTypes';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const getProducts = async () => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data;
};

export const addProduct = async (product: Product) => {
  const { data, error } = await supabase.from("products").insert(product);
  if (error) {
    console.error("Error adding product:", error);
    return null;
  }
  return data;
};

export const updateProduct = async (id: number, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id);
  if (error) {
    console.error("Error updating product:", error);
    return null;
  }
  return data;
};

export const deleteProduct = async (id: number) => {
  const { data, error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Error deleting product:", error);
    return null;
  }
  return data;
};

export const getOrders = async () => {
  const { data, error } = await supabase.from("orders").select("*");
  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  return data;
};

export const addOrders = async (order: Orders) => {
  const { data, error } = await supabase.from("orders").insert(order);
  if (error) {
    console.error("Error adding order:", error);
    return null;
  }
  return data;
};

export const updateOrder = async (id: number, updates: Partial<Orders>) => {
  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id);
  if (error) {
    console.error("Error updating order:", error);
    return null;
  }
  return data;
};

export const deleteOrder = async (id: number) => {
  const { data, error } = await supabase.from("orders").delete().eq("id", id);
  if (error) {
    console.error("Error deleting order:", error);
    return null;
  }
  return data;
};

export { supabase };