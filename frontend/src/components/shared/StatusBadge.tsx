
import { cn } from "@/lib/utils"

type StatusType =
  | "DRAFT" | "PENDING" | "CONFIRMED" | "ATTENDED" | "SUBMITTED"
  | "IN_PROGRESS" | "PUBLISHED" | "FINALIZED" | "RELEASED" | "NORMAL"
  | "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | "ACTIVE" | "INACTIVE"
  | "GENERATED" | "ACCEPTED" | "SCHEDULED" | "VISITED" | "COMPLETED" | "CLOSED"
  | "CANCELLED"

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let bgColor = "bg-[#F1F5F9]"
  let textColor = "text-[#475569]"
  let dotColor = "bg-[#94A3B8]"

  const normalized = status.toUpperCase()

  switch (normalized) {
    case "ACTIVE":
    case "SUCCESS":
    case "CONFIRMED":
    case "LOW":
    case "NORMAL":
    case "PUBLISHED":
    case "COMPLETED":
    case "ATTENDED":
      bgColor = "bg-[#DCFCE7]"
      textColor = "text-[#15803D]"
      dotColor = "bg-[#16A34A]"
      break
    case "WARNING":
    case "PENDING":
    case "MODERATE":
    case "SCHEDULED":
    case "ACCEPTED":
      bgColor = "bg-[#FEF9C3]"
      textColor = "text-[#A16207]"
      dotColor = "bg-[#CA8A04]"
      break
    case "DANGER":
    case "CANCELLED":
    case "CRITICAL":
    case "CLOSED":
      bgColor = "bg-[#FEE2E2]"
      textColor = "text-[#B91C1C]"
      dotColor = "bg-[#DC2626]"
      break
    case "INFO":
    case "DRAFT":
    case "SUBMITTED":
    case "IN_PROGRESS":
    case "GENERATED":
    case "VISITED":
      bgColor = "bg-[#DBEAFE]"
      textColor = "text-[#1D4ED8]"
      dotColor = "bg-[#3B82F6]"
      break
    case "HIGH":
      bgColor = "bg-[#FFEDD5]"
      textColor = "text-[#C2410C]"
      dotColor = "bg-[#EA580C]"
      break
    default:
      // Neutral / Inactive is default
      break
  }

  return (
    <span
      className={cn(
        "inline-flex h-[24px] items-center gap-[5px] rounded-full px-[10px] font-sans text-[12px] font-semibold whitespace-nowrap",
        bgColor,
        textColor,
        className
      )}
    >
      <span className={cn("h-[6px] w-[6px] rounded-full", dotColor)} />
      {status.replace(/_/g, " ")}
    </span>
  )
}
