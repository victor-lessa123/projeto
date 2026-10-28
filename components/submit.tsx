"use client";
import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";
export function Submit({
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      {...props}
      disabled={disabled || pending}
      aria-busy={pending}
    >
      {pending ? "Processando…" : children}
    </button>
  );
}
