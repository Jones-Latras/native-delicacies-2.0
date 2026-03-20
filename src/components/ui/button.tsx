import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[var(--radius-btn)] border font-medium uppercase tracking-[0.18em] transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pandan/40 focus-visible:ring-offset-2 focus-visible:ring-offset-gatas disabled:pointer-events-none disabled:opacity-50",
          {
            "border-pulot bg-pulot text-asukal shadow-[0_14px_26px_rgba(59,31,14,0.14)] hover:-translate-y-px hover:brightness-110 hover:shadow-[0_18px_30px_rgba(59,31,14,0.18)] active:translate-y-0":
              variant === "primary",
            "border-latik/20 bg-asukal text-latik shadow-[0_10px_22px_rgba(59,31,14,0.08)] hover:-translate-y-px hover:bg-gatas/95 hover:shadow-[0_16px_28px_rgba(59,31,14,0.12)] active:translate-y-0":
              variant === "secondary",
            "border-latik/40 bg-transparent text-latik shadow-none hover:-translate-y-px hover:bg-latik/8 hover:shadow-[0_12px_20px_rgba(59,31,14,0.08)] active:translate-y-0":
              variant === "outline",
            "border-transparent bg-transparent text-pandan shadow-none hover:bg-pandan/8 hover:text-pandan active:translate-y-0":
              variant === "ghost",
            "border-red-900/20 bg-red-800/82 text-asukal shadow-[0_14px_26px_rgba(59,31,14,0.14)] hover:-translate-y-px hover:bg-red-800 hover:shadow-[0_18px_30px_rgba(59,31,14,0.18)] active:translate-y-0":
              variant === "danger",
          },
          {
            "h-9 px-4 text-[0.68rem]": size === "sm",
            "h-11 px-5 text-[0.72rem]": size === "md",
            "h-[3.25rem] px-8 text-[0.8rem]": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
