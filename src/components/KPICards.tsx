"use client";

import { useDashboardData } from "@/lib/dashboard-context";
import {
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function KPICards() {
  const { data, loading } = useDashboardData();

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  const { todayCount, todayTotal, yesterdayCount, yesterdayTotal, orders } = data;

  const countDiff = yesterdayCount > 0
    ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
    : todayCount > 0 ? 100 : 0;
  const totalDiff = yesterdayTotal > 0
    ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
    : todayTotal > 0 ? 100 : 0;

  const periodTotal = orders.reduce((sum, o) => sum + (o.subtotal || o.total || 0), 0);
  const ordersWithItems = orders.filter((o) => o.order_items && o.order_items.length > 0).length;
  const ordersWithoutItems = orders.length - ordersWithItems;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* عدد طلبات اليوم */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">طلبات اليوم</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{todayCount}</p>
            <div className="flex items-center mt-2 gap-1">
              {countDiff >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-xs font-semibold ${countDiff >= 0 ? "text-green-600" : "text-red-600"}`}>
                {countDiff >= 0 ? "+" : ""}{countDiff.toFixed(0)}% عن أمس
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* إجمالي مبيعات اليوم */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">مبيعات اليوم</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {todayTotal.toLocaleString("ar-EG")} ج.م
            </p>
            <div className="flex items-center mt-2 gap-1">
              {totalDiff >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-xs font-semibold ${totalDiff >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalDiff >= 0 ? "+" : ""}{totalDiff.toFixed(0)}% عن أمس
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* إجمالي الفترة */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">إجمالي الفترة</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {periodTotal.toLocaleString("ar-EG")} ج.م
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {orders.length} طلب
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* تفاصيل الطلبات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">تفاصيل الطلبات</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                <span className="text-green-600 font-bold">{ordersWithItems}</span>
                <span className="text-gray-500 mr-1">طلب له تفاصيل</span>
              </p>
              <p className="text-sm">
                <span className="text-orange-500 font-bold">{ordersWithoutItems}</span>
                <span className="text-gray-500 mr-1">طلب بدون تفاصيل</span>
              </p>
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
