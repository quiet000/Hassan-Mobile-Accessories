import { supabase } from "./supabase";
import type {
  Order,
  Sale,
  TopProduct,
  DailySales,
  OrderStatusCount,
} from "./types";

function fmtDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function localToUTC(date: Date): string {
  return date.toISOString();
}

export interface DashboardData {
  orders: Order[];
  sales: Sale[];
  todayCount: number;
  todayTotal: number;
  yesterdayCount: number;
  yesterdayTotal: number;
  topProducts: TopProduct[];
  dailySales: DailySales[];
  statusCounts: OrderStatusCount[];
}

export async function getDashboardData(from: Date, to: Date): Promise<DashboardData> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const yesterdayDate = new Date(todayStart);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayEnd = new Date(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate(), 23, 59, 59, 999);

  const fromStart = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toEnd = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999);

  const [
    ordersResult,
    notificationsResult,
    salesResult,
    todayCountResult,
    todayTotalResult,
    yesterdayCountResult,
    yesterdayTotalResult,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*, customer:customers(*), order_items(*)")
      .gte("created_at", localToUTC(fromStart))
      .lte("created_at", localToUTC(toEnd))
      .order("created_at", { ascending: false }),
    supabase
      .from("notifications")
      .select("order_id, waybill_number"),
    supabase
      .from("sales")
      .select("*, item:item(*)")
      .gte("created_at", localToUTC(fromStart))
      .lte("created_at", localToUTC(toEnd))
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", localToUTC(todayStart))
      .lte("created_at", localToUTC(todayEnd)),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", localToUTC(todayStart))
      .lte("created_at", localToUTC(todayEnd)),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", localToUTC(yesterdayDate))
      .lte("created_at", localToUTC(yesterdayEnd)),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", localToUTC(yesterdayDate))
      .lte("created_at", localToUTC(yesterdayEnd)),
  ]);

  const orders = (ordersResult.data || []) as Order[];
  
  // Merge waybill_number from notifications into orders
  const notifications = (notificationsResult.data || []) as { order_id: string; waybill_number: string }[];
  const waybillMap = new Map(notifications.map(n => [n.order_id, n.waybill_number]));
  for (const order of orders) {
    order.waybill_number = waybillMap.get(order.id) || undefined;
  }
  const todayCount = todayCountResult.count || 0;
  const todayTotal = (todayTotalResult.data as { total: number }[] || []).reduce((s, o) => s + (o.total || 0), 0);
  const yesterdayCount = yesterdayCountResult.count || 0;
  const yesterdayTotal = (yesterdayTotalResult.data as { total: number }[] || []).reduce((s, o) => s + (o.total || 0), 0);

  const sales = (salesResult.data || []) as Sale[];

  // Sales within today / yesterday date windows
  const todaySales = sales.filter((s) => {
    const d = new Date(s.created_at);
    return d >= todayStart && d <= todayEnd;
  });
  const yesterdaySales = sales.filter((s) => {
    const d = new Date(s.created_at);
    return d >= yesterdayDate && d <= yesterdayEnd;
  });
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.sale_price * s.quantity, 0);
  const yesterdaySalesTotal = yesterdaySales.reduce((sum, s) => sum + s.sale_price * s.quantity, 0);

  // Daily sales — merge orders + branch sales
  const dailyMap = new Map<string, { count: number; total: number }>();
  for (const order of orders) {
    const dateStr = order.created_at.split("T")[0];
    const amount = order.subtotal || order.total || 0;
    const existing = dailyMap.get(dateStr);
    if (existing) {
      existing.count += 1;
      existing.total += amount;
    } else {
      dailyMap.set(dateStr, { count: 1, total: amount });
    }
  }
  for (const sale of sales) {
    const dateStr = sale.created_at.split("T")[0];
    const amount = sale.sale_price * sale.quantity;
    const existing = dailyMap.get(dateStr);
    if (existing) {
      existing.count += 1;
      existing.total += amount;
    } else {
      dailyMap.set(dateStr, { count: 1, total: amount });
    }
  }
  const dailySales = Array.from(dailyMap.entries())
    .map(([date, values]) => ({ date, ...values }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top products — from orders that have order_items + branch sales
  const productMap = new Map<string, TopProduct>();
  for (const order of orders) {
    if (!order.order_items || order.order_items.length === 0) continue;
    for (const item of order.order_items) {
      const existing = productMap.get(item.product_name);
      if (existing) {
        existing.total_quantity += item.quantity;
        existing.total_revenue += item.total_price;
      } else {
        productMap.set(item.product_name, {
          product_name: item.product_name,
          product_id: item.product_id,
          total_quantity: item.quantity,
          total_revenue: item.total_price,
        });
      }
    }
  }
  for (const sale of sales) {
    const pname = sale.item?.["Product Name"] || sale.item?.SKU || "مبيعات فرع";
    const existing = productMap.get(pname);
    if (existing) {
      existing.total_quantity += sale.quantity;
      existing.total_revenue += sale.sale_price * sale.quantity;
    } else {
      productMap.set(pname, {
        product_name: pname,
        product_id: sale.item?.SKU || sale.item?.id || "",
        total_quantity: sale.quantity,
        total_revenue: sale.sale_price * sale.quantity,
      });
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 10);

  // Status counts
  const statusMap = new Map<string, number>();
  for (const order of orders) {
    const status = order.status || "غير محدد";
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  }
  const statusCounts = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  return {
    orders,
    sales,
    todayCount: todayCount + todaySales.length,
    todayTotal: todayTotal + todaySalesTotal,
    yesterdayCount: yesterdayCount + yesterdaySales.length,
    yesterdayTotal: yesterdayTotal + yesterdaySalesTotal,
    topProducts,
    dailySales,
    statusCounts,
  };
}
