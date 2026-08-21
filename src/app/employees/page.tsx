"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@/lib/types";
import {
  Users,
  Plus,
  Trash2,
  Shield,
  UserCheck,
  X,
} from "lucide-react";

export default function EmployeesPage() {
  const { user, isManager } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"manager" | "employee">("employee");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: true });
    setUsers((data as User[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isManager) {
      router.push("/");
      return;
    }
    load();
  }, [isManager, router, load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");

    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) {
      setAddError("جميع الحقول مطلوبة");
      return;
    }

    const exists = users.find((u) => u.username === newUsername.trim());
    if (exists) {
      setAddError("اسم المستخدم موجود بالفعل");
      return;
    }

    setAddLoading(true);
    const { error } = await supabase.from("users").insert({
      name: newName.trim(),
      username: newUsername.trim(),
      password: newPassword.trim(),
      role: newRole,
    });
    setAddLoading(false);

    if (error) {
      setAddError(error.message);
    } else {
      setShowAdd(false);
      setNewName("");
      setNewUsername("");
      setNewPassword("");
      setNewRole("employee");
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("تمسح الموظف ده؟")) return;
    await supabase.from("users").delete().eq("id", id);
    load();
  }

  async function handleRoleToggle(id: string, currentRole: string) {
    const newRole = currentRole === "manager" ? "employee" : "manager";
    await supabase.from("users").update({ role: newRole }).eq("id", id);
    load();
  }

  if (!isManager) return null;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-7 h-7 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">الموظفين</h1>
                <p className="text-sm text-gray-500 mt-0.5">إدارة حسابات الموظفين والصلاحيات</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              إضافة موظف
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs">الاسم</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs">اسم المستخدم</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs">الصلاحية</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs">تاريخ الإنشاء</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{u.name}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{u.username}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
                          u.role === "manager"
                            ? "bg-purple-50 text-purple-700 hover:bg-purple-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title="اضغط للتبديل"
                      >
                        {u.role === "manager" ? (
                          <><Shield className="w-3 h-3" /> مدير</>
                        ) : (
                          <><UserCheck className="w-3 h-3" /> موظف</>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="py-3 px-4">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Permissions info */}
        <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-3">الصلاحيات</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-gray-700">مدير</span>
                <p className="text-gray-500 text-xs mt-0.5">عرض + تعديل + حذف شحنات + إدارة الموظفين</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-gray-700">موظف</span>
                <p className="text-gray-500 text-xs mt-0.5">عرض فقط — لا يقدر يحذف أو يعدل</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">إضافة موظف جديد</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
              {addError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg text-center">{addError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="اسم الموظف"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم *</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="username"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصلاحية</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "manager" | "employee")}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="employee">موظف</option>
                  <option value="manager">مدير</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {addLoading ? "جاري الحفظ..." : "حفظ"}
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
