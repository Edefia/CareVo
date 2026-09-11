import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[48px] w-full rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border)] bg-[var(--color-white)] px-[16px] text-[15px] font-sans text-[var(--color-text-primary)] transition-all duration-150 ease-in-out placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:border-[var(--color-forest)] focus-visible:ring-[3px] focus-visible:ring-[rgba(4,47,100,0.12)] disabled:cursor-not-allowed disabled:opacity-50 data-[error=true]:border-[var(--color-danger)] data-[error=true]:focus-visible:ring-[rgba(220,38,38,0.08)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-[13px] font-medium font-sans text-[var(--color-text-secondary)] mb-[6px] peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Input, Label }
