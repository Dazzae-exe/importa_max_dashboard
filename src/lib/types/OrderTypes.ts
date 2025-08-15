export interface Orders {
  id?: number | string;
  created_at?: Date;
  order_ref: string;
  order_products: OrderProduct[];
  order_by: string;
  order_shippingMethod: string;
  order_status: string;
  order_address: string;
  order_for: string;
  order_totalPrice: number;
  order_shippingDate: string;
  order_customerEmail: string;
  order_notes?: string;
}

export interface OrderProduct {
  id?: number | string;
  created_at?: Date;
  isFeatured?: boolean;
  product_name: string;
  product_brand?: string;
  product_image?: string;
  product_price: number;
  product_stock?: number;
  product_isSale?: boolean;
  product_status?: string;
  product_quantity: number;
  product_priceSale?: number;
  product_description?: string;
}
