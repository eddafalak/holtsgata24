/* eslint react-refresh/only-export-components: "off" */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/** Figma „Button MS“ — litir, 8px horn, bold. Stærðir (hæð): large 52px → lg, medium 44px → default, small 36px → sm. */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[8px] border bg-clip-padding font-bold whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#18325a] text-white hover:bg-[#2b4c75] active:bg-[#41628d] disabled:bg-[#e8eaee] disabled:text-[#b3b3b3]",
        secondary:
          "border-transparent bg-[#f3f5f7] text-[#323232] hover:bg-[#d1d6de] active:bg-[#e8eaee] disabled:bg-transparent disabled:text-[#b3b3b3]",
        outline:
          "border-[#f3f5f7] bg-background text-[#323232] hover:border-[#d1d6de] hover:bg-[#e8eaee] active:border-[#e8eaee] active:bg-[#f3f5f7] disabled:border-[#e5e5e5] disabled:bg-background disabled:text-[#b3b3b3] aria-expanded:border-[#d1d6de] aria-expanded:bg-[#e8eaee] dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        ghost:
          "border-transparent bg-transparent text-[#323232] hover:bg-[#e8eaee] active:bg-[#f3f5f7] disabled:bg-transparent disabled:text-[#b3b3b3] aria-expanded:bg-[#e8eaee] dark:hover:bg-muted/50",
        destructive:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 disabled:bg-transparent disabled:opacity-50 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "border-transparent bg-transparent font-medium text-[#18325a] underline-offset-4 hover:bg-transparent hover:underline active:bg-transparent disabled:text-[#b3b3b3] disabled:no-underline",
      },
      size: {
        default:
          "h-[44px] px-6 text-base leading-tight has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        xs: "min-h-8 gap-1 rounded-[8px] px-3 py-1.5 text-xs leading-tight in-data-[slot=button-group]:rounded-[8px] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-[36px] px-4 text-sm leading-4 in-data-[slot=button-group]:rounded-[8px] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        lg: "h-[52px] px-8 text-base leading-tight has-data-[icon=inline-end]:pr-7 has-data-[icon=inline-start]:pl-7",
        icon: "size-[44px] gap-0 p-0",
        "icon-xs":
          "size-8 gap-0 rounded-[8px] p-0 in-data-[slot=button-group]:rounded-[8px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-[36px] gap-0 rounded-[8px] p-0 in-data-[slot=button-group]:rounded-[8px]",
        "icon-lg": "size-[52px] gap-0 rounded-[8px] p-0",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        class: "h-auto min-h-0 gap-1 px-0 py-1 text-sm font-medium leading-normal",
      },
    ],
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
