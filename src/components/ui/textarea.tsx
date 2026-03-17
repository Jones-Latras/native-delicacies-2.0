import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  UI_FIELD_BASE_CLASS,
  UI_FIELD_ERROR_STATE_CLASS,
} from "@/lib/ui-classes";
import { FieldShell } from "./field-shell";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <FieldShell id={id} label={label} error={error}>
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "flex min-h-[80px]",
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

Textarea.displayName = "Textarea";

export { Textarea, type TextareaProps };
