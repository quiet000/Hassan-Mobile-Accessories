"use client";

import { useDashboardData } from "@/lib/dashboard-context";
import { Package } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TopProductsChart() {
  const { data, loading } = useDashboardData();

  if (loading || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">الأكثر مبيعًا</h3>
        <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
          <span className="text-gray-400">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (data.topProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">الأكثر مبيعًا</h3>
        <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Package className="w-12 h-12 text-gray-300" />
          <div className="text-center">
            <p className="font-medium">لا توجد بيانات منتجات</p>
            <p className="text-sm mt-1">
              معظم الطلبات بدون تفاصيل منتجات في قاعدة البيانات
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">الأكثر مبيعًا</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.topProducts} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="product_name"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                direction: "rtl",
              }}
              formatter={(value, name) => [
                String(name) === "total_revenue"
                  ? `${Number(value).toLocaleString("ar-EG")} ج.م`
                  : value,
                String(name) === "total_revenue" ? "الإجمالي" : "الكمية",
              ]}
            />
            <Bar
              dataKey="total_revenue"
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
