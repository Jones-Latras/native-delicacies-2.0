"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-kape/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "animate-rise relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.4rem] border border-latik/20 bg-asukal/98 shadow-[0_24px_44px_rgba(59,31,14,0.18)]",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-latik/10 px-6 py-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-kape">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full border border-latik/12 bg-asukal p-2 text-latik/55 transition-all duration-300 ease-in-out hover:border-pulot/30 hover:bg-pulot/10 hover:text-pulot"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
