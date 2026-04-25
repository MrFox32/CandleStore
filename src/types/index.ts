export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number;
  image: string;
  image_url?: string; // Standardized in Supabase schema
  images?: string[];
  stock_quantity?: number;
  category?: string;
  weight_grams?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  is_active?: boolean;
  rating?: number;
  created_at?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface ContactRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  telegram_username?: string;
  contact_method: string;
  message?: string;
  status: 'Новий' | 'В обробці' | 'Опрацьовано' | 'Створено замовлення' | 'Скасовано';
  order_id?: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_city: string;
  shipping_address: string;
  total_price: number;
  order_status: 'Нове' | 'Підтверджено' | 'Відправлено' | 'Скасовано';
  payment_status: 'Очікує' | 'Оплачено' | 'Повернення';
  created_at: string;
  np_city_ref?: string;
  np_warehouse_ref?: string;
  np_tracking_number?: string;
  np_document_ref?: string;
  shipping_estimate?: number;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  products?: {
    name: string;
  };
}
