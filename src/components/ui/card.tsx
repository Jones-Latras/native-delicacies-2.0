import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.35rem] border border-latik/18 bg-asukal/92 shadow-[0_14px_28px_rgba(59,31,14,0.10)] backdrop-blur-sm transition-all duration-300 ease-in-out",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("border-b border-latik/10 px-6 py-5", className)}>{children}</div>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={cn("border-t border-latik/10 px-6 py-5", className)}>{children}</div>;
}
