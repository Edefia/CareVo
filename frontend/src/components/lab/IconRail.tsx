import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  FileText, 
  Send, 
  CalendarCheck,
  Users,
  Settings
} from "lucide-react"

type NavItem = { href: string; label: string; icon: any; badge?: number }

const labNavItems: NavItem[] = [
  { href: "/lab/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lab/services", label: "Catalog", icon: FileText },
  { href: "/lab/notifications/broadcast", label: "Broadcast", icon: Send },
  { href: "/lab/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/lab/patients", label: "Clients", icon: Users },
  { href: "/lab/settings", label: "Settings", icon: Settings },
]

export function IconRail() {
  return (
    <aside className="w-[64px] h-screen bg-white border-r border-[var(--color-lims-border)] flex flex-col items-center py-4 shrink-0 z-50">
      {/* Logo Mark */}
      <div className="w-10 h-10 mb-8 rounded-lg bg-[var(--color-lims-bg)] flex items-center justify-center border border-[var(--color-lims-border)] shadow-sm">
        <img src="/logo.jpeg" alt="Logo" className="w-6 h-6 object-contain" />
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-4 w-full px-2">
        {labNavItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.href}
            title={item.label}
            className={({ isActive }) => cn(
              "relative flex w-full aspect-square rounded-xl items-center justify-center transition-all duration-200 group",
              isActive 
                ? "bg-[var(--color-lims-active-bg)] text-[var(--color-lims-accent)]" 
                : "text-[var(--color-lims-text-muted)] hover:bg-[var(--color-lims-bg)] hover:text-[var(--color-lims-text)]"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-[-8px] top-1/2 h-1/2 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--color-lims-accent)]" />
                )}
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
