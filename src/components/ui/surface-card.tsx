import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const SURFACE_CARD_BASE_CLASS =
  "rounded-[1.35rem] border border-latik/18 bg-asukal/92 shadow-[0_14px_28px_rgba(59,31,14,0.10)] backdrop-blur-sm transition-all duration-300 ease-in-out";

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
