import * as React from "react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  Receipt, 
  LogOut, 
  Menu,
  Activity,
  CalendarCheck,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronUp,
  Search,
  Bell,
  ChevronRight,
  Settings,
  User as UserIcon
} from "lucide-react"

type NavItem = { href: string; label: string; icon: any; badge?: number }
type NavGroup = { title: string; items: NavItem[] }

export function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)

  const navGroups = getNavGroupsForRole(user?.role || "CLIENT")

  // Generate simple breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = ["Home", ...pathSegments.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '))]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Close user menu on outside click
  React.useEffect(() => {
    const handleClick = () => setIsUserMenuOpen(false)
    if (isUserMenuOpen) {
      window.addEventListener('click', handleClick)
    }
    return () => window.removeEventListener('click', handleClick)
  }, [isUserMenuOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-off-white)] font-sans">
      
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[var(--color-forest)]/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SIDEBAR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-[var(--color-forest)] shadow-[var(--shadow-sidebar)] transition-all duration-250 ease-in-out lg:static",
          isMobileOpen ? "translate-x-0 w-[256px]" : "-translate-x-full lg:translate-x-0",
          !isMobileOpen && isSidebarExpanded ? "lg:w-[256px]" : "",
          !isMobileOpen && !isSidebarExpanded ? "lg:w-[72px]" : ""
        )}
      >
        {/* Sidebar Top */}
        <div className="flex shrink-0 items-center justify-between px-[20px] py-[24px]">
          {isSidebarExpanded || isMobileOpen ? (
            <div className="flex items-center gap-1">
              <span className="font-serif text-[20px] font-semibold text-white">CareVo</span>
              <sup className="mt-1 text-[10px] font-bold text-[var(--color-lime)]">®</sup>
            </div>
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded bg-white/10">
              <span className="font-serif text-[16px] font-bold text-white">C</span>
            </div>
          )}
          
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="hidden lg:flex text-white/60 hover:text-white transition-colors"
          >
            {isSidebarExpanded ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto px-[12px] py-[8px] space-y-[24px] scrollbar-hide">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-[2px]">
              {(isSidebarExpanded || isMobileOpen) && (
                <div className="px-[8px] pb-[6px] pt-[16px] font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
                  {group.title}
                </div>
              )}
              
              {group.items.map((item, itemIdx) => (
                <NavLink
                  key={itemIdx}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  title={!isSidebarExpanded && !isMobileOpen ? item.label : undefined}
                  className={({ isActive }) => cn(
                    "relative flex h-[42px] cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] px-[12px] transition-colors duration-150 group",
                    isActive 
                      ? "bg-[rgba(126,232,162,0.15)] text-white font-semibold" 
                      : "text-white/75 font-medium hover:bg-white/5"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--color-lime)]" />
                      )}
                      
                      <div className={cn(
                        "flex items-center justify-center",
                        !isSidebarExpanded && !isMobileOpen && "mx-auto"
                      )}>
                        <item.icon className={cn(
                          "h-[18px] w-[18px] transition-colors",
                          isActive ? "text-[var(--color-lime)]" : "text-white/55 group-hover:text-white/80"
                        )} />
                      </div>

                      {(isSidebarExpanded || isMobileOpen) && (
                        <>
                          <span className={cn("text-[14px]", isActive ? "text-white" : "text-white/75 group-hover:text-white/95")}>
                            {item.label}
                          </span>
                          
                          {item.badge && (
                            <div className="ml-auto flex min-w-[20px] items-center justify-center rounded-full bg-[var(--color-lime)] px-[7px] py-[1px] font-sans text-[11px] font-bold text-[var(--color-forest)]">
                              {item.badge}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar Bottom (User Profile) */}
        <div className="relative mt-auto border-t border-white/10 p-[16px] px-[12px]">
          {/* Popover Menu */}
          {isUserMenuOpen && (
            <div 
              className="absolute bottom-[calc(100%+8px)] left-[12px] right-[12px] rounded-[var(--radius-md)] bg-white p-[8px] shadow-[var(--shadow-modal)] z-50 animate-in slide-in-from-bottom-2 fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-[12px] py-[8px] text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]">
                <Settings className="h-4 w-4 text-[var(--color-text-secondary)]" /> Settings
              </div>
              <div className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-[12px] py-[8px] text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]">
                <UserIcon className="h-4 w-4 text-[var(--color-text-secondary)]" /> My Profile
              </div>
              <div className="my-[4px] h-[1px] w-full bg-[var(--color-border)]"></div>
              <div 
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-[12px] py-[8px] text-[13px] font-medium text-[var(--color-danger)] hover:bg-[#FEF2F2]"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </div>
            </div>
          )}

          <div 
            className="flex cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] p-[8px] transition-colors hover:bg-white/5"
            onClick={(e) => {
              e.stopPropagation()
              setIsUserMenuOpen(!isUserMenuOpen)
            }}
          >
            <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[rgba(126,232,162,0.2)]">
              <span className="font-sans text-[14px] font-semibold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            
            {(isSidebarExpanded || isMobileOpen) && (
              <>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-sans text-[13px] font-semibold text-white">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="truncate font-sans text-[11px] font-medium text-white/50 capitalize">
                    {user?.role.toLowerCase().replace("_", " ")}
                  </span>
                </div>
                <ChevronUp className="ml-auto h-4 w-4 text-white/50" />
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAIN CONTENT AREA
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="flex min-w-0 flex-1 flex-col">
        
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-[64px] shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-white px-[24px] md:px-[32px]">
          
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-[var(--color-text-secondary)]" 
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-[8px] font-sans text-[14px]">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="h-[14px] w-[14px] text-[var(--color-text-muted)]" />}
                  <span className={cn(
                    "capitalize",
                    i === breadcrumbs.length - 1 
                      ? "font-medium text-[var(--color-text-primary)]" 
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                  )}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-[16px]">
            {/* Search */}
            <button className="flex h-[36px] w-[36px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)]">
              <Search className="h-[18px] w-[18px]" />
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button className="flex h-[36px] w-[36px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)]">
                <Bell className="h-[18px] w-[18px]" />
              </button>
              <div className="absolute right-0 top-0 h-[8px] w-[8px] rounded-full border-2 border-white bg-[var(--color-danger)]"></div>
            </div>

            <div className="h-[24px] w-[1px] bg-[var(--color-border)] mx-1"></div>

            {/* Mobile User Avatar (duplicates sidebar bottom functionality for mobile convenience) */}
            <div className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full bg-[rgba(26,58,42,0.1)] lg:hidden">
              <span className="font-sans text-[14px] font-semibold text-[var(--color-forest)]">
                {user?.firstName?.[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-[24px] md:p-[32px]">
          <div className="mx-auto w-full max-w-[1280px]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

function getNavGroupsForRole(role: string): NavGroup[] {
  switch (role) {
    case "ADMIN":
      return [
        {
          title: "SYSTEM",
          items: [
            { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/audit", label: "Audit Logs", icon: Activity },
          ]
        },
        {
          title: "CLINICAL",
          items: [
            { href: "/patients", label: "Clients", icon: Users },
            { href: "/bookings", label: "Bookings", icon: CalendarCheck, badge: 12 },
            { href: "/laboratories", label: "Laboratories", icon: Building2 },
          ]
        },
        {
          title: "FINANCE",
          items: [
            { href: "/billing", label: "Billing", icon: Receipt },
          ]
        }
      ]
    case "LABORATORY":
      return [
        {
          title: "MAIN",
          items: [
            { href: "/lab/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/bookings", label: "Bookings", icon: CalendarCheck, badge: 5 },
            { href: "/patients", label: "Clients", icon: Users },
          ]
        }
      ]
    case "INTERPRETER":
      return [
        {
          title: "MAIN",
          items: [
            { href: "/interpreter/dashboard", label: "Dashboard", icon: LayoutDashboard },
          ]
        },
        {
          title: "CLINICAL",
          items: [
            { href: "/interpretations/queue", label: "Interpretations", icon: FileText, badge: 3 },
            { href: "/patients", label: "Clients", icon: Users },
          ]
        }
      ]
    case "CLIENT":
      return [
        {
          title: "MAIN",
          items: [
            { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/client/bookings", label: "Book Screening", icon: CalendarCheck },
            { href: "/client/results", label: "My Results", icon: FileText },
            { href: "/client/referrals", label: "Referrals", icon: Users },
            { href: "/client/billing", label: "Payments", icon: Receipt },
            { href: "/settings", label: "Profile", icon: UserIcon },
          ]
        }
      ]
    default:
      return []
  }
}
