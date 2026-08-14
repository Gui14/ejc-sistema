import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-xl border border-white/15 bg-white/10 px-4 text-white outline-none placeholder:text-white/40 transition focus:border-pink-300 focus:ring-2 focus:ring-pink-300/30",
        className,
      )}
      {...props}
    />
  );
}