"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useDateFilter } from "./date-context";
import { getDashboardData } from "./data";
import type { DashboardData } from "./data";

export function useDashboard() {
  const { activeRange, filter } = useDateFilter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fromStr = activeRange.from.toISOString();
  const toStr = activeRange.to.toISOString();

  const fetchData = useCallback(async (from: Date, to: Date) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboardData(from, to);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeRange.from, activeRange.to);
  }, [fetchData, fromStr, toStr, filter]);

  return { data, loading, error, refetch: () => fetchData(activeRange.from, activeRange.to) };
}
