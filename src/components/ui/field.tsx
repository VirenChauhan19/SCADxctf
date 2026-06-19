import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  htmlFor,
  required,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </label>
      )}
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      className={cn(
        "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
      )}
    >
      {message}
    </div>
  );
}
