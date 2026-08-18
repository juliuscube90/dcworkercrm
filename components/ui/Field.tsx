"use client";

import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const base =
  "w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15";

export const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-ink-700">
    {children}
  </label>
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${base} ${className}`} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea ref={ref} className={`${base} resize-none ${className}`} {...props} />
  )
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => (
    <select ref={ref} className={`${base} ${className}`} {...props}>
      {children}
    </select>
  )
);
Select.displayName = "Select";

export const FieldError = ({ children }: { children?: string | null }) =>
  children ? <p className="mt-1 text-xs text-danger">{children}</p> : null;
