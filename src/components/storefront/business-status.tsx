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
    <div className="inline-flex items-center gap-2 rounded-full border border-asukal/30 bg-asukal/90 px-4 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-kape shadow-[0_14px_28px_rgba(59,31,14,0.14)] backdrop-blur-xl">
      <span
        className={`h-2.5 w-2.5 rounded-full ${status.isOpen ? "bg-pandan animate-pulse" : "bg-red-800/70"}`}
      />
      <span className={status.isOpen ? "text-pandan" : "text-red-800/85"}>
        {status.isOpen ? "Open Now" : "Closed"}
      </span>
      <span className="text-latik/35">·</span>
      <Clock className="h-3.5 w-3.5 text-latik/45" strokeWidth={1.5} />
      <span className="text-latik/70">{status.nextChange}</span>
    </div>
  );
}
