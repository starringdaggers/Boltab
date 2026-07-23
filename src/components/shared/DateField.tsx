"use client";

import { formatOrdinalDate } from "@/lib/formatDate";

/**
 * A date picker built on the native <input type="date">. This is the most
 * reliable "calendar" experience across different phones (iOS Safari,
 * Android Chrome, etc. all render their own native, touch-friendly date
 * picker for this input type — a custom-built calendar widget would need
 * per-device testing we can't do here). Stores/returns an ISO date string
 * ("2026-09-14"); shows a friendly ordinal preview underneath.
 */
export default function DateField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="text-xs text-vandyke block">
      {label}
      <div className="relative mt-1">
        <input
          type="date"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-taupe/50 rounded px-3 py-2.5 bg-white/60 disabled:opacity-50 text-bistre text-sm appearance-none"
        />
      </div>
      {value && (
        <p className="text-[11px] text-vandyke mt-1">{formatOrdinalDate(value)}</p>
      )}
    </label>
  );
}
