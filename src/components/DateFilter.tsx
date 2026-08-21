"use client";

import { useDateFilter } from "@/lib/date-context";

const FILTERS = [
  { key: "today" as const, label: "اليوم" },
  { key: "yesterday" as const, label: "أمس" },
  { key: "month" as const, label: "هذا الشهر" },
  { key: "custom" as const, label: "مخصص" },
];

export default function DateFilter() {
  const { filter, setFilter, customRange, setCustomRange } = useDateFilter();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              filter === f.key
                ? "bg-blue-600 text-white shadow-inner"
                : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filter === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customRange.from.toISOString().split("T")[0]}
            onChange={(e) =>
              setCustomRange({ ...customRange, from: new Date(e.target.value) })
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <span className="text-gray-400">إلى</span>
          <input
            type="date"
            value={customRange.to.toISOString().split("T")[0]}
            onChange={(e) =>
              setCustomRange({ ...customRange, to: new Date(e.target.value) })
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      )}
    </div>
  );
}
