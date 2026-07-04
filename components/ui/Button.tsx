import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  const baseStyles = "font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center justify-center";
  
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-600 border border-transparent",
    outline: "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-indigo-600",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-400 border border-transparent",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 border border-transparent",
  };

  const sizes = {
    default: "min-h-11 rounded-xl px-4 py-2",
    sm: "min-h-9 rounded-lg px-3 py-1.5 text-sm",
    lg: "min-h-12 rounded-xl px-6 py-3 text-lg",
    icon: "min-h-10 min-w-10 rounded-xl p-2",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}