"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useDashboard } from "./use-dashboard";
import type { DashboardData } from "./data";

interface DashboardContextValue {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { data, loading, error } = useDashboard();

  return (
    <DashboardContext.Provider value={{ data, loading, error }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardData must be used within DashboardProvider");
  return ctx;
}
