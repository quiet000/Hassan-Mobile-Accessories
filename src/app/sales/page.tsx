"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import type { Item, Sale, Branch } from "@/lib/types";
import {
  ShoppingCart,
  Plus,
  Trash2,
  MapPin,
  Building2,
  AlertCircle,
} from "lucide-react";

export default function SalesPage() {
  const { isManager } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // form state
  const [selectedItem, setSelectedItem] = useState("");
  const [qty, setQty] = useState("");
  const [branch, setBranch] = useState("");
  const [address, setAddress] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [itemsRes, salesRes, branchesRes] = await Promise.all([
      supabase.from("item").select("*").order("Product Name"),
      supabase.from("sales").select("*, item:item(*)").order("created_at", { ascending: false }),
      supabase.from("branches").select("*").order("name"),
    ]);
    setItems((itemsRes.data as Item[]) || []);
    setSales((salesRes.data as Sale[]) || []);
    setBranches((branchesRes.data as Branch[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedItemObj = items.find((i) => i.id === selectedItem);
  const totalSale = selectedItemObj ? selectedItemObj.Price * Number(qty || 0) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!selectedItem) {
      setFormError("اختار المنتج");
      return;
    }
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) {
      setFormError("الكمية لازم تكون أكبر من صفر");
      return;
    }
    if (!branch) {
      setFormError("اختار الفرع");
      return;
    }

    const item = items.find((i) => i.id === selectedItem);
    if (!item) return;

    if (quantity > item.Stock) {
      setFormError(`المخزون غير كافي — المتاح: ${item.Stock}`);
      return;
    }

    setSaving(true);

    // Insert sale
    const { error: saleErr } = await supabase.from("sales").insert({
      item_id: selectedItem,
      quantity,
      sale_price: item.Price,
      branch,
      address: address.trim(),
    });

    if (saleErr) {
      setFormError(saleErr.message);
      setSaving(false);
      return;
    }

    // Decrement stock
    const { error: stockErr } = await supabase
      .from("item")
      .update({ Stock: item.Stock - quantity })
      .eq("id", item.id);

    if (stockErr) {
      setFormError("تم البيع لكن حدث خطأ في تحديث المخزون: " + stockErr.message);
      setSaving(false);
      load();
      return;
    }

    setSaving(false);
    setShowAdd(false);
    setSelectedItem("");
    setQty("");
    setAddress("");
    load();
  }

  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((s) => s.created_at.startsWith(today));
  const todayTotal = todaySales.reduce((s, sale) => s + sale.sale_price * sale.quantity, 0);
  const todayCount = todaySales.reduce((s, sale) => s + sale.quantity, 0);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">المبيعات</h1>
                <p className="text-sm text-gray-500 mt-0.5">تسجيل عمليات البيع وخصم المخزون</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              بيع جديد
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">مبيعات اليوم</div>
            <div className="text-2xl font-bold text-indigo-600">{todayTotal.toLocaleString("ar-EG")} ج.م</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">عدد الوحدات المباعة اليوم</div>
            <div className="text-2xl font-bold text-gray-800">{todayCount}</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">إجمالي المبيعات</div>
            <div className="text-2xl font-bold text-gray-800">{sales.length} عملية</div>
          </div>
        </div>

        {/* Sales table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 text-gray-400">لا توجد عمليات بيع بعد</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">المنتج</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">الكمية</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">السعر</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">الإجمالي</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">
                    <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3" /> الفرع</span>
                  </th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> العنوان</span>
                  </th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs">التاريخ</th>
                  {isManager && <th className="py-3 px-3"></th>}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-800">
                      {sale.item?.["Product Name"] || "—"}
                    </td>
                    <td className="py-3 px-3 text-gray-700">{sale.quantity}</td>
                    <td className="py-3 px-3 text-gray-600">{sale.sale_price.toLocaleString("ar-EG")} ج.م</td>
                    <td className="py-3 px-3 font-medium text-indigo-600">
                      {(sale.sale_price * sale.quantity).toLocaleString("ar-EG")} ج.م
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        <Building2 className="w-3 h-3" /> {sale.branch}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs">{sale.address || "—"}</td>
                    <td className="py-3 px-3 text-gray-500 text-xs">
                      {new Date(sale.created_at).toLocaleDateString("ar-EG")}{" "}
                      {new Date(sale.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    {isManager && (
                      <td className="py-3 px-3">
                        <button
                          onClick={async () => {
                            if (!confirm("تمسح عملية البيع ده؟")) return;
                            // Restore stock
                            const saleItem = items.find((i) => i.id === sale.item_id);
                            if (saleItem) {
                              await supabase
                                .from("item")
                                .update({ Stock: saleItem.Stock + sale.quantity })
                                .eq("id", sale.item_id);
                            }
                            await supabase.from("sales").delete().eq("id", sale.id);
                            load();
                          }}
                          className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
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

      {/* Add sale modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">بيع جديد</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <span className="text-gray-400 text-xl">×</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}

              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المنتج *</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">— اختار منتج —</option>
                  {items.filter((i) => i.Stock > 0).map((i) => (
                    <option key={i.id} value={i.id}>
                      {i["Product Name"]} — {i.Color} — السعر: {i.Price} ج.م — المتاح: {i.Stock}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الكمية *</label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  min="1"
                  max={selectedItemObj?.Stock || 1}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {selectedItemObj && (
                  <p className="text-xs text-gray-400 mt-1">المتاح: {selectedItemObj.Stock} وحدة</p>
                )}
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الفرع *</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">— اختار فرع —</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
                {branches.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    مفيش فروع — <a href="/branches" className="underline">أضف فرع جديد</a>
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="العنوان التفصيلي (اختياري)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Total */}
              {selectedItemObj && qty && (
                <div className="bg-indigo-50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">الإجمالي</span>
                  <span className="text-xl font-bold text-indigo-700">{totalSale.toLocaleString("ar-EG")} ج.م</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "جاري الحفظ..." : "تأكيد البيع"}
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
