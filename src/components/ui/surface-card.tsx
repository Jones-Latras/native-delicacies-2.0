import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const SURFACE_CARD_BASE_CLASS =
  "rounded-2xl border border-stone-200 bg-white shadow-sm";

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function SurfaceCard({ children, className, ...props }: SurfaceCardProps) {
  return (
    <div className={cn(SURFACE_CARD_BASE_CLASS, className)} {...props}>
      {children}
    </div>
  );
}