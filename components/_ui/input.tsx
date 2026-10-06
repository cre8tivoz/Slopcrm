import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  type = "text",
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-line-strong bg-secondary text-foreground ease-power3-out placeholder:text-subtle focus-visible:border-ring fine:h-9 flex h-11 w-full min-w-0 rounded-lg border px-3 text-[14px] leading-none transition-[border-color] duration-150 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
