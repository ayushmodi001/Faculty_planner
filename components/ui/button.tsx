import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5",
        destructive: "bg-destructive text-white shadow-lg shadow-destructive/20 hover:bg-destructive/90 hover:-translate-y-0.5",
        outline: "border-2 border-slate-200 dark:border-slate-800 bg-transparent text-[#0A1128] dark:text-slate-100 hover:border-primary hover:text-primary dark:hover:text-primary hover:bg-primary/[0.03]",
        secondary: "bg-slate-100 dark:bg-slate-800 text-[#0A1128] dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-[#0A1128] dark:hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        xs: "h-7 gap-1 rounded-lg px-2 text-[10px]",
        sm: "h-9 rounded-xl gap-1.5 px-4",
        lg: "h-14 rounded-[20px] px-10 text-[12px] tracking-[0.2em]",
        icon: "size-11",
        "icon-xs": "size-7 rounded-lg",
        "icon-sm": "size-9",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
