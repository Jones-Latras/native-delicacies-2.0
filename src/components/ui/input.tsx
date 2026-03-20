import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  UI_FIELD_BASE_CLASS,
  UI_FIELD_ERROR_STATE_CLASS,
} from "@/lib/ui-classes";
import { FieldShell } from "./field-shell";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <FieldShell id={id} label={label} error={error}>
        <input
          ref={ref}
          id={id}
          className={cn(
            "flex h-11",
            UI_FIELD_BASE_CLASS,
            error && UI_FIELD_ERROR_STATE_CLASS,
            className
          )}
          {...props}
        />
      </FieldShell>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
