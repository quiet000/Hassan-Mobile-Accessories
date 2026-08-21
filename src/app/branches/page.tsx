"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import type { Branch, Sale } from "@/lib/types";
import {
  Building2,
  Plus,
  Trash2,
  X,
  TrendingUp,
  ShoppingCart,
  Package,
} from "lucide-react";

interface BranchStats {
  branchName: string;
  totalSales: number;
  totalRevenue: number;
  totalUnits: number;
}

export default function BranchesPage() {
  const { isManager } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [bRes, sRes] = await Promise.all([
      supabase.from("branches").select("*").order("name"),
      supabase.from("sales").select("*"),
    ]);
    setBranches((bRes.data as Branch[]) || []);
    setSales((sRes.data as Sale[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const statsMap = new Map<string, BranchStats>();
  for (const sale of sales) {
    const existing = statsMap.get(sale.branch);
    if (existing) {
      existing.totalSales += 1;
      existing.totalRevenue += sale.sale_price * sale.quantity;
      existing.totalUnits += sale.quantity;
    } else {
      statsMap.set(sale.branch, {
        branchName: sale.branch,
        totalSales: 1,
        totalRevenue: sale.sale_price * sale.quantity,
        totalUnits: sale.quantity,
      });
    }
  }

  const overallRevenue = sales.reduce((s, sale) => s + sale.sale_price * sale.quantity, 0);
  const overallUnits = sales.reduce((s, sale) => s + sale.quantity, 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newName.trim()) {
      setError("اكتب اسم الفرع");
      return;
    }

    const exists = branches.find((b) => b.name === newName.trim());
    if (exists) {
      setError("الفرع ده موجود بالفعل");
      return;
    }

    setSaving(true);
    const { error: err } = await supabase.from("branches").insert({ name: newName.trim() });
    setSaving(false);

    if (err) {
      setError(err.message);
    } else {
      setShowAdd(false);
      setNewName("");
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("تمسح الفرع ده؟")) return;
    await supabase.from("branches").delete().eq("id", id);
    load();
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-7 h-7 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">الفروع</h1>
                <p className="text-sm text-gray-500 mt-0.5">إدارة فروع المتجر وإحصائيات المبيعات</p>
              </div>
            </div>
            {isManager && (
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة فرع
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Overall stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">إجمالي المبيعات</div>
            <div className="text-2xl font-bold text-indigo-600">{overallRevenue.toLocaleString("ar-EG")} ج.م</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">إجمالي الوحدات</div>
            <div className="text-2xl font-bold text-gray-800">{overallUnits}</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">عدد الفروع</div>
            <div className="text-2xl font-bold text-gray-800">{branches.length}</div>
          </div>
        </div>

        {/* Branches with stats */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : branches.length === 0 ? (
          <div className="text-center py-12 text-gray-400">لا توجد فروع بعد</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => {
              const stats = statsMap.get(b.name);
              return (
                <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="font-medium text-gray-800">{b.name}</div>
                    </div>
                    {isManager && (
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="px-5 py-4 grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        {stats ? stats.totalRevenue.toLocaleString("ar-EG") : "0"}
                      </div>
                      <div className="text-[10px] text-gray-400">ج.م</div>
                    </div>
                    <div className="text-center border-x border-gray-100">
                      <div className="flex items-center justify-center mb-1">
                        <ShoppingCart className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <div className="text-lg font-bold text-gray-800">{stats?.totalSales || 0}</div>
                      <div className="text-[10px] text-gray-400">عملية</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Package className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="text-lg font-bold text-gray-800">{stats?.totalUnits || 0}</div>
                      <div className="text-[10px] text-gray-400">وحدة</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">إضافة فرع جديد</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg text-center">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفرع *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: فرع التجمع"
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
