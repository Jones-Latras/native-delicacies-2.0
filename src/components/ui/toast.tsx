"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

let addToastFn: ((message: string, variant: ToastVariant) => void) | null = null;

export function toast(message: string, variant: ToastVariant = "info") {
  addToastFn?.(message, variant);
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (message, variant) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.variant];
        return (
          <div
            key={t.id}
            className={cn(
              "animate-rise flex items-center gap-3 rounded-[1.2rem] border border-latik/15 border-l-4 bg-asukal/95 px-4 py-3 text-kape shadow-[0_16px_30px_rgba(59,31,14,0.14)] backdrop-blur-sm",
              {
                "border-l-pandan": t.variant === "success",
                "border-l-red-800": t.variant === "error",
                "border-l-ube": t.variant === "info",
              }
            )}
          >
            <Icon
              className={cn("h-5 w-5 shrink-0", {
                "text-pandan": t.variant === "success",
                "text-red-800/85": t.variant === "error",
                "text-ube": t.variant === "info",
              })}
              strokeWidth={1.5}
            />
            <span className="text-sm leading-6">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-2 shrink-0 rounded-full p-1 text-latik/55 transition-all duration-300 ease-in-out hover:bg-kape/5 hover:text-kape"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
