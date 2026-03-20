import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UI_FIELD_BASE_CLASS,
  UI_FIELD_ERROR_STATE_CLASS,
} from "@/lib/ui-classes";
import { FieldShell } from "./field-shell";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
    return (
      <FieldShell id={id} label={label} error={error}>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              "flex h-11 appearance-none pr-11",
              UI_FIELD_BASE_CLASS,
              error && UI_FIELD_ERROR_STATE_CLASS,
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-latik/55">
            <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </div>
      </FieldShell>
    );
  }
);

Select.displayName = "Select";

export { Select, type SelectProps };
