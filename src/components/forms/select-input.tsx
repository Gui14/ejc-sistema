import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function SelectInput({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-12 w-full rounded-xl border border-white/15 bg-[#321078] px-4 text-white outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-300/30",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}