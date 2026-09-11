import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forest)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-sans",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-lime)] text-white font-semibold rounded-full hover:bg-[var(--color-lime-dark)] hover:-translate-y-[1px] active:translate-y-0",
        secondary:
          "bg-transparent border-[1.5px] border-[var(--color-forest)] text-[var(--color-forest)] font-semibold rounded-full hover:bg-[var(--color-forest)] hover:text-white",
        ghost:
          "bg-transparent text-[var(--color-text-secondary)] rounded-[var(--radius-md)] hover:bg-[var(--color-surface-2)]",
        danger:
          "bg-[var(--color-danger)] text-white font-semibold rounded-full hover:bg-[#B91C1C]",
        dark:
          "bg-white text-[var(--color-forest)] font-semibold rounded-full hover:bg-[var(--color-off-white)]",
        icon:
          "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] rounded-[var(--radius-md)] hover:bg-[var(--color-border)]",
        outline: // keeping outline as fallback mapping to secondary
          "bg-transparent border-[1.5px] border-[var(--color-forest)] text-[var(--color-forest)] font-semibold rounded-full hover:bg-[var(--color-forest)] hover:text-white",
      },
      size: {
        default: "px-[24px] py-[12px] text-[15px]",
        sm: "px-[16px] py-[8px] text-[13px]",
        lg: "px-[32px] py-[16px] text-[16px]",
        icon: "h-[36px] w-[36px]",
        secondary: "px-[23px] py-[11px] text-[15px]", // 1px less padding for border
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
