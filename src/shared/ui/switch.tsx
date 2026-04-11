"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/shared/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch aria-invalid:border-destructive aria-invalid:ring-destructive/20 relative inline-flex shrink-0 items-center rounded-full border border-white/80 bg-white/70 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-[color:var(--ring)] focus-visible:ring-3 focus-visible:ring-[color:rgba(158,197,222,0.3)] aria-invalid:ring-3 data-checked:bg-[color:rgba(44,122,102,0.88)] data-disabled:cursor-not-allowed data-disabled:opacity-50 data-unchecked:bg-[color:rgba(49,69,86,0.18)] data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white shadow-[0_1px_4px_rgba(15,23,42,0.16)] ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
