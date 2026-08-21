"use client";

import { useState, useMemo } from "react";
import { useDashboardData } from "@/lib/dashboard-context";
import type { Order, OrderItem } from "@/lib/types";
import { Search, ChevronLeft, ChevronRight, Package } from "lucide-react";

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  Confirmed: "bg-green-100 text-green-800",
};

const STATUS_LABEL: Record<string, string> = {
  Pending: "قيد الانتظار",
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  Confirmed: "مؤكد",
};

export default function SalesTable() {
  const { data, loading } = useDashboardData();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const orders = data?.orders || [];
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o: Order) =>
        o.id.toLowerCase().includes(q) ||
        (o.customer?.name || "").toLowerCase().includes(q) ||
        (o.customer?.phone || "").includes(q) ||
        (o.status || "").toLowerCase().includes(q) ||
        (o.shipping_address || "").toLowerCase().includes(q) ||
        o.order_items?.some(
          (item: OrderItem) =>
            item.product_name.toLowerCase().includes(q) ||
            item.product_id.toLowerCase().includes(q)
        )
    );
  }, [data?.orders, search]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const pagedOrders = filteredOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">الطلبات التفصيلية</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">الطلبات التفصيلية</h3>
          <p className="text-sm text-gray-500 mt-1">{filteredOrders.length} طلب في الفترة المحددة</p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، رقم الطلب، العنوان..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-72 pr-10 pl-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          لا توجد طلبات في الفترة المحددة
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">رقم الطلب</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">العميل</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">المنتجات</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">المبلغ</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">الحالة</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">العنوان</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.map((order: Order) => {
                  const hasItems = order.order_items && order.order_items.length > 0;
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                    <td className="py-3 px-3">
                      <div>
                        {order.waybill_number ? (
                          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                            {order.waybill_number}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-gray-400">
                            {order.id.slice(0, 8)}
                          </span>
                        )}
                      </div>
                    </td>
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-medium text-gray-900 text-sm">
                            {order.customer?.name || "غير محدد"}
                          </span>
                          {order.customer?.phone && (
                            <span className="text-gray-400 mr-1 text-xs block">
                              {order.customer.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {hasItems ? (
                          <div className="flex flex-wrap gap-1">
                            {order.order_items!.slice(0, 3).map((item: OrderItem) => (
                              <span
                                key={item.id}
                                className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                              >
                                {item.product_name} ×{item.quantity}
                              </span>
                            ))}
                            {order.order_items!.length > 3 && (
                              <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                                +{order.order_items!.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                            <Package className="w-3 h-3" />
                            بدون تفاصيل
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-bold text-gray-900 text-sm">
                            {(order.subtotal || order.total || 0).toLocaleString("ar-EG")} ج.م
                          </span>
                          {(order.shipping_cost || 0) > 0 && (
                            <span className="text-xs text-gray-400 block">
                              +{order.shipping_cost} شحن
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-xs max-w-[180px] truncate">
                        {order.shipping_address || "—"}
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                عرض {(page - 1) * PAGE_SIZE + 1}-
                {Math.min(page * PAGE_SIZE, filteredOrders.length)} من{" "}
                {filteredOrders.length} طلب
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
