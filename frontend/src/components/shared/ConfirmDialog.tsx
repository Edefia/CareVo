import { useState } from "react"
import type { ReactNode } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  Loader2,
  XCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ConfirmVariant = "danger" | "warning" | "info" | "success" | "default"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  /** @deprecated Prefer `variant="danger"` */
  destructive?: boolean
  variant?: ConfirmVariant
  loading?: boolean
}

const variantConfig: Record<
  ConfirmVariant,
  {
    icon: typeof AlertTriangle
    iconWrap: string
    iconColor: string
    confirmVariant: "danger" | "default"
    confirmClassName?: string
  }
> = {
  danger: {
    icon: XCircle,
    iconWrap: "bg-red-50 border-red-100",
    iconColor: "text-[var(--color-danger)]",
    confirmVariant: "danger",
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: "bg-amber-50 border-amber-100",
    iconColor: "text-[var(--color-warning)]",
    confirmVariant: "default",
    confirmClassName:
      "bg-[var(--color-warning)] hover:bg-[#B45309] text-white",
  },
  info: {
    icon: Info,
    iconWrap: "bg-sky-50 border-sky-100",
    iconColor: "text-[var(--color-info)]",
    confirmVariant: "default",
    confirmClassName:
      "bg-[var(--color-info)] hover:bg-[#0A5BB8] text-white",
  },
  success: {
    icon: CheckCircle2,
    iconWrap: "bg-emerald-50 border-emerald-100",
    iconColor: "text-[var(--color-success)]",
    confirmVariant: "default",
    confirmClassName:
      "bg-[var(--color-success)] hover:bg-[#15803D] text-white",
  },
  default: {
    icon: HelpCircle,
    iconWrap: "bg-[var(--color-surface-2)] border-[var(--color-border)]",
    iconColor: "text-[var(--color-forest)]",
    confirmVariant: "default",
    confirmClassName:
      "bg-[var(--color-forest)] hover:bg-[var(--color-forest-mid)] text-white",
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  destructive = false,
  variant,
  loading: externalLoading,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = externalLoading ?? internalLoading

  const resolvedVariant: ConfirmVariant =
    variant ?? (destructive ? "danger" : "default")
  const config = variantConfig[resolvedVariant]
  const Icon = config.icon

  const handleOpenChange = (next: boolean) => {
    if (isLoading) return
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    try {
      setInternalLoading(true)
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Caller surfaces the error; keep the dialog open for retry
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[420px] gap-0 overflow-hidden rounded-[var(--radius-lg)] border-[var(--color-border)] bg-white p-0 shadow-[var(--shadow-modal)]",
          "[&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:p-1.5",
          "[&>button]:text-[var(--color-text-muted)] [&>button]:hover:bg-[var(--color-surface-2)] [&>button]:hover:text-[var(--color-text-primary)]",
          "[&>button]:opacity-100 [&>button]:ring-offset-0"
        )}
      >
        <div className="px-6 pt-6 pb-2">
          <div
            className={cn(
              "mb-4 flex h-12 w-12 items-center justify-center rounded-full border",
              config.iconWrap
            )}
          >
            <Icon className={cn("h-6 w-6", config.iconColor)} strokeWidth={1.75} />
          </div>

          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="font-serif text-[22px] font-semibold leading-tight text-[var(--color-text-primary)]">
              {title}
            </DialogTitle>
            <DialogDescription className="font-sans text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="mt-5 flex-col-reverse gap-2 border-t border-[var(--color-border)] bg-[var(--color-off-white)] px-6 py-4 sm:flex-row sm:justify-end sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => handleOpenChange(false)}
            className="h-[44px] w-full sm:w-auto px-5"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={config.confirmVariant}
            disabled={isLoading}
            onClick={handleConfirm}
            className={cn(
              "h-[44px] w-full sm:w-auto px-5 gap-2",
              config.confirmClassName
            )}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
