
import { Badge } from "@/components/ui/badge"

type StatusType =
  | "DRAFT"
  | "PENDING"
  | "CONFIRMED"
  | "ATTENDED"
  | "SUBMITTED"
  | "IN_PROGRESS"
  | "PUBLISHED"
  | "FINALIZED"
  | "RELEASED"
  | "NORMAL"
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "CRITICAL"
  | "ACTIVE"
  | "INACTIVE"
  | "GENERATED"
  | "ACCEPTED"
  | "SCHEDULED"
  | "VISITED"
  | "COMPLETED"
  | "CLOSED"

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default"
  let colorClass = ""

  const normalized = status.toUpperCase()

  switch (normalized) {
    case "NORMAL":
    case "PUBLISHED":
    case "RELEASED":
    case "ACTIVE":
    case "COMPLETED":
    case "ATTENDED":
    case "LOW":
      colorClass = "bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
      variant = "outline"
      break
    case "SUBMITTED":
    case "PENDING":
    case "MODERATE":
    case "GENERATED":
    case "ACCEPTED":
    case "SCHEDULED":
      colorClass = "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
      variant = "outline"
      break
    case "HIGH":
      colorClass = "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
      variant = "outline"
      break
    case "CRITICAL":
    case "INACTIVE":
    case "CLOSED":
      colorClass = "bg-red-100 text-red-800 hover:bg-red-200 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      variant = "outline"
      break
    case "IN_PROGRESS":
    case "CONFIRMED":
    case "VISITED":
      colorClass = "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
      variant = "outline"
      break
    case "DRAFT":
    case "FINALIZED":
    default:
      colorClass = "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      variant = "outline"
      break
  }

  return (
    <Badge 
      variant={variant} 
      className={`${colorClass} ${className || ""}`}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}
