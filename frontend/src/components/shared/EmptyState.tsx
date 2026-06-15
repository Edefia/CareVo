import * as React from "react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-[48px] px-[24px] text-center">
      {icon && (
        <div className="mb-[24px] flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
          {icon}
        </div>
      )}
      <h3 className="mb-[8px] font-sans text-[18px] font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="mb-[24px] max-w-[320px] font-sans text-[14px] leading-[1.6] text-[var(--color-text-muted)]">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
