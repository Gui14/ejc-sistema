import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type EjcButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function EjcButton({
  className,
  variant = "primary",
  ...props
}: EjcButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold transition duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 focus:ring-offset-[#090612] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-gradient-to-r from-[#ff008c] to-[#8b21d9] text-white shadow-lg shadow-pink-950/30 hover:-translate-y-0.5 hover:shadow-pink-900/50",
        variant === "secondary" &&
          "border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/15",
        className,
      )}
      {...props}
    />
  );
}