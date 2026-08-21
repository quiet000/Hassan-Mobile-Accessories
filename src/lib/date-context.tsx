"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { DateFilter, DateRange } from "./types";

function getDefaultRange(): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { from: today, to: now };
}

interface DateContextValue {
  filter: DateFilter;
  setFilter: (f: DateFilter) => void;
  customRange: DateRange;
  setCustomRange: (r: DateRange) => void;
  activeRange: DateRange;
}

const DateContext = createContext<DateContextValue | null>(null);

export function DateProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<DateFilter>("today");
  const [customRange, setCustomRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let activeRange: DateRange;
  switch (filter) {
    case "today":
      activeRange = { from: today, to: now };
      break;
    case "yesterday":
      activeRange = {
        from: yesterday,
        to: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59),
      };
      break;
    case "month":
      activeRange = { from: monthStart, to: now };
      break;
    case "custom":
      activeRange = customRange;
      break;
  }

  return (
    <DateContext.Provider
      value={{ filter, setFilter, customRange, setCustomRange, activeRange }}
    >
      {children}
    </DateContext.Provider>
  );
}

export function useDateFilter() {
  const ctx = useContext(DateContext);
  if (!ctx) throw new Error("useDateFilter must be used within DateProvider");
  return ctx;
}
