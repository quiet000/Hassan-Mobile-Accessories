"use client";

import { useState, useMemo } from "react";
import { useDashboardData } from "@/lib/dashboard-context";
import type { Sale } from "@/lib/types";
import { Search, Building2, Package } from "lucide-react";

const PAGE_SIZE = 10;

export default function BranchSalesTable() {
  const { data, loading } = useDashboardData();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const sales = data?.sales || [];
    if (!search) return sales;
    const q = search.toLowerCase();
    return sales.filter(
      (s: Sale) =>
        s.branch.toLowerCase().includes(q) ||
        (s.item?.["Product Name"] || "").toLowerCase().includes(q) ||
        (s.item?.SKU || "").toLowerCase().includes(q) ||
        (s.address || "").toLowerCase().includes(q)
    );
  }, [data?.sales, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">مبيعات الفروع</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">مبيعات الفروع</h3>
            <p className="text-sm text-gray-500 mt-1">{filtered.length} عملية في الفترة المحددة</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالفرع، المنتج..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-72 pr-10 pl-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {paged.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          لا توجد مبيعات فروع في الفترة المحددة
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">الفرع</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">المنتج</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">الكمية</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">السعر</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">الإجمالي</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((sale: Sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                        {sale.branch}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-medium text-gray-900 text-sm">
                          {sale.item?.["Product Name"] || "—"}
                        </span>
                        {sale.item?.SKU && (
                          <span className="text-gray-400 mr-1 text-xs block">{sale.item.SKU}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-gray-700">
                        <Package className="w-3.5 h-3.5 text-amber-500" />
                        {sale.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 text-sm">
                      {sale.sale_price.toLocaleString("ar-EG")} ج.م
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-900 text-sm">
                        {(sale.sale_price * sale.quantity).toLocaleString("ar-EG")} ج.م
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(sale.created_at).toLocaleDateString("ar-EG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                عرض {(page - 1) * PAGE_SIZE + 1}-
                {Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length} عملية
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
