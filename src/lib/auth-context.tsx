"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("dashboard_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
  }, []);

  function login(u: User) {
    setUser(u);
    localStorage.setItem("dashboard_user", JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("dashboard_user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isManager: user?.role === "manager" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
