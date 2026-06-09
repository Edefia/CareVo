import * as React from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  Receipt, 
  LogOut, 
  Menu,
  X,
  Activity,
  CalendarCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  // This would typically come from a route config based on user.role
  const navItems = getNavItemsForRole(user?.role || "PATIENT")

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-sm transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 items-center px-6 border-b">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center mr-3">
             <span className="text-primary-foreground font-bold text-sm">CH</span>
          </div>
          <span className="text-lg font-bold tracking-tight">CareVo Health</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto lg:hidden" 
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
              onClick={() => setIsMobileOpen(false)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center px-3 py-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role.replace("_", " ")}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-card border-b z-10 shadow-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center space-x-4">
            {/* Additional topbar items like notifications can go here */}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in-50 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

function getNavItemsForRole(role: string) {
  const common = [
    { href: "/patients", label: "Patients", icon: Users },
  ]
  
  switch (role) {
    case "SUPER_ADMIN":
      return [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ...common,
        { href: "/laboratories", label: "Laboratories", icon: Building2 },
        { href: "/bookings", label: "Bookings", icon: CalendarCheck },
        { href: "/billing", label: "Billing", icon: Receipt },
        { href: "/audit", label: "Audit Logs", icon: Activity },
      ]
    case "PLATFORM_ADMIN":
      return [
        { href: "/platform/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ...common,
        { href: "/laboratories", label: "Laboratories", icon: Building2 },
        { href: "/bookings", label: "Bookings", icon: CalendarCheck },
        { href: "/billing", label: "Billing", icon: Receipt },
      ]
    case "LAB_ADMIN":
      return [
        { href: "/lab/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/bookings", label: "Bookings", icon: CalendarCheck },
        ...common,
      ]
    case "LAB_STAFF":
      return [
        { href: "/lab/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/bookings", label: "Bookings", icon: CalendarCheck },
        ...common,
      ]
    case "INTERPRETER":
      return [
        { href: "/interpreter/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/interpretations/queue", label: "Interpretations", icon: FileText },
        ...common,
      ]
    case "HEALTH_ADVOCATE":
      return [
        { href: "/advocate/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/advocacy", label: "Task Board", icon: Activity },
        ...common,
      ]
    case "REFERRAL_PARTNER":
      return [
        { href: "/referral/dashboard", label: "Dashboard", icon: LayoutDashboard },
      ]
    case "PATIENT":
      return [
        { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/patient/results", label: "My Results", icon: FileText },
        { href: "/patient/bookings", label: "My Bookings", icon: CalendarCheck },
        { href: "/patient/billing", label: "Billing", icon: Receipt },
      ]
    default:
      return []
  }
}
