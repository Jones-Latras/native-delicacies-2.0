import type { ReactNode } from "react";
import { UI_FIELD_ERROR_CLASS, UI_FIELD_LABEL_CLASS } from "@/lib/ui-classes";

interface FieldShellProps {
  id?: string;
  label?: string;
  error?: string;
  children: ReactNode;
}

export function FieldShell({ id, label, error, children }: FieldShellProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className={UI_FIELD_LABEL_CLASS}>
          {label}
        </label>
      )}
      {children}
      {error && <p className={UI_FIELD_ERROR_CLASS}>{error}</p>}
    </div>
  );
}
