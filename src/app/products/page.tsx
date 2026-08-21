"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import type { Item } from "@/lib/types";
import {
  Search,
  Package,
  ArrowUpDown,
  Filter,
  Plus,
  Trash2,
} from "lucide-react";
import AddProductModal from "@/components/AddProductModal";

export default function ProductsPage() {
  const { isManager } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [sortField, setSortField] = useState<"Product Name" | "Price" | "Stock">("Product Name");
  const [sortAsc, setSortAsc] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("item")
      .select("*")
      .order("Product Name", { ascending: true });
    setItems((data as Item[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = ["الكل", ...Array.from(new Set(items.map((i) => i.Category).filter(Boolean)))];

  async function handleDelete(id: string) {
    if (!confirm("تمسح المنتج ده؟")) return;
    await supabase.from("item").delete().eq("id", id);
    load();
  }

  const filtered = items
    .filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item["Product Name"].toLowerCase().includes(q) ||
        item.SKU.toLowerCase().includes(q) ||
        item.Color.toLowerCase().includes(q) ||
        item.Type.toLowerCase().includes(q);
      const matchCat = category === "الكل" || item.Category === category;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const totalStock = items.reduce((s, i) => s + i.Stock, 0);
  const totalValue = items.reduce((s, i) => s + i.Price * i.Stock, 0);
  const lowStock = items.filter((i) => i.Stock < 10).length;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-7 h-7 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
                <p className="text-sm text-gray-500 mt-0.5">إدارة المنتجات والمخزون</p>
              </div>
            </div>
            {isManager && (
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة منتج
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">إجمالي المنتجات</div>
            <div className="text-2xl font-bold text-gray-800">{items.length}</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">إجمالي المخزون</div>
            <div className="text-2xl font-bold text-gray-800">{totalStock.toLocaleString("ar-EG")}</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">قيمة المخزون</div>
            <div className="text-2xl font-bold text-indigo-600">{totalValue.toLocaleString("ar-EG")} ج.م</div>
          </div>
        </div>

        {lowStock > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-2">
            <span className="text-amber-600 text-sm font-medium">
              ⚠ {lowStock} منتج{lowStock > 1 ? "ات" : ""} مخزونه أقل من 10 وحدات
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث بالاسم، SKU، اللون، النوع..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">لا توجد منتجات</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">SKU</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">المنتج</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">الفئة</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">النوع</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">اللون</th>
                  <th
                    className="text-right py-3 px-3 font-semibold text-gray-600 text-xs cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => { if (sortField === "Price") setSortAsc(!sortAsc); else { setSortField("Price"); setSortAsc(true); } }}
                  >
                    <span className="inline-flex items-center gap-1">
                      السعر <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-right py-3 px-3 font-semibold text-gray-600 text-xs cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => { if (sortField === "Stock") setSortAsc(!sortAsc); else { setSortField("Stock"); setSortAsc(true); } }}
                  >
                    <span className="inline-flex items-center gap-1">
                      المخزون <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">القيمة</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">الوصف</th>
                  {isManager && <th className="py-3 px-3 font-semibold text-gray-600 text-xs"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-indigo-600">{item.SKU}</td>
                    <td className="py-3 px-3 font-medium text-gray-800">{item["Product Name"]}</td>
                    <td className="py-3 px-3">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{item.Category}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 text-xs">{item.Type}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded-full border border-gray-200"
                          style={{ backgroundColor: item.Color.toLowerCase() === "black" ? "#000" : item.Color.toLowerCase() === "white" ? "#fff" : item.Color.toLowerCase() }}
                        />
                        <span className="text-xs text-gray-600">{item.Color}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-800">{item.Price.toLocaleString("ar-EG")} ج.م</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                        item.Stock < 10 ? "bg-red-50 text-red-600" :
                        item.Stock < 20 ? "bg-amber-50 text-amber-600" :
                        "bg-green-50 text-green-600"
                      }`}>
                        {item.Stock}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 text-xs">{(item.Price * item.Stock).toLocaleString("ar-EG")} ج.م</td>
                    <td className="py-3 px-3 text-gray-500 text-xs max-w-[200px] truncate">{item.Description}</td>
                    {isManager && (
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showAdd && (
        <AddProductModal
          categories={categories.filter((c) => c !== "الكل")}
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); load(); }}
        />
      )}
    </div>
  );
}
