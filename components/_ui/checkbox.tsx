"use client";

import type { ComponentProps } from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import SquareIcon from "@/public/assets/images/companies/table/square.svg";
import CheckSquareIcon from "@/public/assets/images/companies/table/check-square.svg";
import MinusSquareIcon from "@/public/assets/images/companies/table/minus-square.svg";

function Checkbox({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer tap-target ease-power3-out hover:text-line-strong focus-visible:ring-ring/60 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] text-[#323232] transition-[color] duration-150 outline-none select-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="relative size-4">
        <SquareIcon
          aria-hidden
          className="ease-power3-out absolute inset-0 size-4 transition-[opacity,scale] duration-150 group-data-[state=checked]:scale-75 group-data-[state=checked]:opacity-0 group-data-[state=indeterminate]:opacity-0"
        />
        <CheckSquareIcon
          aria-hidden
          className="ease-power3-out absolute inset-0 size-4 scale-75 opacity-0 transition-[opacity,scale] duration-150 group-data-[state=checked]:scale-100 group-data-[state=checked]:opacity-100"
        />
        <MinusSquareIcon
          aria-hidden
          className="ease-power3-out absolute inset-0 size-4 scale-75 opacity-0 transition-[opacity,scale] duration-150 group-data-[state=indeterminate]:scale-100 group-data-[state=indeterminate]:opacity-100"
        />
      </span>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
