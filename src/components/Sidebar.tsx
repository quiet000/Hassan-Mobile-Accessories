"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Users,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/", label: "الداشبورد", icon: LayoutDashboard },
  { href: "/products", label: "المنتجات", icon: Package },
  { href: "/sales", label: "المبيعات", icon: ShoppingCart },
  { href: "/branches", label: "الفروع", icon: Building2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isManager, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-l border-gray-200 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      } h-screen fixed right-0 top-0 z-20`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {!collapsed && (
          <span className="text-lg font-bold text-indigo-600">Hassan Mobile</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft
            className={`w-5 h-5 text-gray-400 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {isManager && (
          <Link
            href="/employees"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/employees"
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title={collapsed ? "الموظفين" : undefined}
          >
            <Users className="w-5 h-5 shrink-0" />
            {!collapsed && <span>الموظفين</span>}
          </Link>
        )}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-gray-100 px-2 py-3 space-y-2">
        {user && !collapsed && (
          <div className="px-3 py-1">
            <div className="text-sm font-medium text-gray-800 truncate">{user.name}</div>
            <div className="text-xs text-gray-400">{user.role === "manager" ? "مدير" : "موظف"}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          title={collapsed ? "خروج" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>خروج</span>}
        </button>
      </div>
    </aside>
  );
}
