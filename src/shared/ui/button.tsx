"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-all outline-none select-none active:scale-[0.97] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-slate-950 text-white hover:bg-slate-900",
        outline: "border-slate-200 bg-white/82 text-slate-700 hover:bg-white hover:text-slate-950",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-900/5 hover:text-slate-950",
        destructive: "bg-[#B5454F] text-white hover:bg-[#A03A45]",
        link: "text-[#314556] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[52px] gap-1.5 px-6 text-[15px]",
        xs: "h-8 gap-1 rounded-lg px-3 text-xs",
        sm: "h-10 gap-1 px-4 text-sm",
        lg: "h-14 gap-1.5 px-8 text-base",
        icon: "size-10 rounded-xl",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-lg",
        "icon-lg": "size-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
