import type { ElementType } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon?: ElementType | any
  description?: string
  isLoading?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-[var(--shadow-card-hover)] border-[var(--color-border)]", className)}>
      <CardContent className="p-[24px]">
        <div className="flex items-start justify-between space-y-0 pb-2">
          <p className="font-sans text-[14px] font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">
            {title}
          </p>
          {Icon && (
            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-2)] text-[var(--color-forest)]">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="mt-[16px] h-[36px] w-[60%] animate-pulse rounded bg-slate-200"></div>
        ) : (
          <div className="mt-[8px] font-serif text-[42px] font-bold tracking-tight text-[var(--color-text-primary)] leading-none">
            {value}
          </div>
        )}
        
        {description && !isLoading && (
          <p className="mt-[12px] font-sans text-[13px] font-medium text-[var(--color-text-muted)]">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
