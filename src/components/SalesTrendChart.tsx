"use client";

import { useDashboardData } from "@/lib/dashboard-context";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesTrendChart() {
  const { data, loading } = useDashboardData();

  if (loading || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">اتجاه المبيعات</h3>
        <div className="h-72 bg-gray-100 rounded animate-pulse flex items-center justify-center">
          <span className="text-gray-400">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (data.dailySales.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">اتجاه المبيعات</h3>
        <div className="h-72 flex items-center justify-center text-gray-400">
          لا توجد بيانات في الفترة المحددة
        </div>
      </div>
    );
  }

  const formattedData = data.dailySales.map((d: { date: string; count: number; total: number }) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString("ar-EG", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">اتجاه المبيعات</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                direction: "rtl",
              }}
              formatter={(value, name) => [
                String(name) === "total" ? `${Number(value).toLocaleString("ar-EG")} ج.م` : value,
                String(name) === "total" ? "الإجمالي" : "عدد الطلبات",
              ]}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
