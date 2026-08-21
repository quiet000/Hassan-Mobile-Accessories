"use client";

import { useDashboardData } from "@/lib/dashboard-context";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

const STATUS_LABELS: Record<string, string> = {
  Pending: "قيد الانتظار",
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  Confirmed: "مؤكد",
};

export default function OrderStatusPie() {
  const { data, loading } = useDashboardData();

  if (loading || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">حالة الطلبات</h3>
        <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
          <span className="text-gray-400">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (data.statusCounts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">حالة الطلبات</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          لا توجد بيانات في الفترة المحددة
        </div>
      </div>
    );
  }

  const chartData = data.statusCounts.map((d: { status: string; count: number }) => ({
    ...d,
    name: STATUS_LABELS[d.status] || d.status,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">حالة الطلبات</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={3}
              dataKey="count"
            >
              {chartData.map((_item: { name: string; count: number }, index: number) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                direction: "rtl",
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
