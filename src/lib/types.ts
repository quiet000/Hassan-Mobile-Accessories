export interface Customer {
  id: string;
  name: string;
  phone: string;
  region: string;
  telegram_user_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  created_at: string;
  customer_id: string;
  status: string;
  subtotal: number;
  shipping_cost: number | null;
  total: number;
  shipping_address: string;
  notes: string;
  updated_at: string | null;
  customer?: Customer;
  order_items?: OrderItem[];
  waybill_number?: string;
}

export interface OrderItem {
  id: string;
  created_at: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  color: string;
  type: string;
  unit_price: number;
  total_price: number;
}

export interface Notification {
  id: string;
  order_id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
  waybill_number: string;
}

export type DateFilter = "today" | "yesterday" | "month" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Item {
  id: string;
  SKU: string;
  "Product Name": string;
  Category: string;
  Price: number;
  Stock: number;
  Color: string;
  Type: string;
  Description: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: "manager" | "employee";
  created_at: string;
}

export interface Sale {
  id: string;
  item_id: string;
  quantity: number;
  sale_price: number;
  branch: string;
  address: string;
  created_at: string;
  item?: Item;
}

export interface Branch {
  id: string;
  name: string;
  created_at: string;
}

export interface TopProduct {
  product_name: string;
  product_id: string;
  total_quantity: number;
  total_revenue: number;
}

export interface DailySales {
  date: string;
  count: number;
  total: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}
