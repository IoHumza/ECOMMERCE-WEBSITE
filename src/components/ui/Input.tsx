import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-800">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${
            error ? "border-red-400" : "border-slate-300"
          } ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-800">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${
            error ? "border-red-400" : "border-slate-300"
          } ${className}`}
          aria-invalid={Boolean(error)}
          {...rest}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = "", children, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-800">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${
            error ? "border-red-400" : "border-slate-300"
          } ${className}`}
          {...rest}
        >
          {children}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
