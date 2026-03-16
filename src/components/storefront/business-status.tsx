"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { isCurrentlyOpen } from "@/lib/business-hours";
import type { OperatingHours } from "@/types";

interface BusinessStatusProps {
  operatingHours: OperatingHours;
  timezone?: string;
}

export function BusinessStatus({ operatingHours, timezone = "Asia/Manila" }: BusinessStatusProps) {
  const [status, setStatus] = useState<ReturnType<typeof isCurrentlyOpen> | null>(() =>
    isCurrentlyOpen(operatingHours, timezone)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(isCurrentlyOpen(operatingHours, timezone));
    }, 60_000);
    return () => clearInterval(interval);
  }, [operatingHours, timezone]);

  if (!status) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm">
      <span
        className={`h-2.5 w-2.5 rounded-full ${status.isOpen ? "bg-green-500 animate-pulse" : "bg-red-400"}`}
      />
      <span className={status.isOpen ? "text-green-700" : "text-red-600"}>
        {status.isOpen ? "Open Now" : "Closed"}
      </span>
      <span className="text-stone-400">·</span>
      <Clock className="h-3.5 w-3.5 text-stone-400" />
      <span className="text-stone-500">{status.nextChange}</span>
    </div>
  );
}
