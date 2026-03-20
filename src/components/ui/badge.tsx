import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em]",
        {
          "border-latik/25 bg-gatas/90 text-latik": variant === "default",
          "border-pandan/30 bg-pandan/10 text-pandan": variant === "success",
          "border-pulot/30 bg-pulot/10 text-pulot": variant === "warning",
          "border-red-900/20 bg-red-900/8 text-red-800/85": variant === "danger",
          "border-ube/25 bg-ube/10 text-ube": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
