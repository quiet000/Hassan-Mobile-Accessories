"use client";

import { DashboardProvider } from "@/lib/dashboard-context";
import DateFilter from "@/components/DateFilter";
import KPICards from "@/components/KPICards";
import SalesTrendChart from "@/components/SalesTrendChart";
import TopProductsChart from "@/components/TopProductsChart";
import OrderStatusPie from "@/components/OrderStatusPie";
import SalesTable from "@/components/SalesTable";

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <div className="min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  داشبورد المبيعات والشحنات
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  متجر إكسسوارات الهواتف
                </p>
              </div>
              <DateFilter />
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <KPICards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesTrendChart />
            <OrderStatusPie />
          </div>

          <TopProductsChart />

          <SalesTable />
        </main>
      </div>
    </DashboardProvider>
  );
}
