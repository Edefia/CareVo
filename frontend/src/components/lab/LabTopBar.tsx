import * as React from "react"
import { useLocation, NavLink, Link } from "react-router-dom"
import { ChevronRight, Search, Settings, LogOut as LogOutIcon, User as UserIcon } from "lucide-react"
import { NotificationPopover } from "@/components/shared/NotificationPopover"
import { useAuthStore } from "@/store/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LabTopBar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  // Smart Breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs = [];
    
    crumbs.push({ label: 'CareBis Prime', href: '/lab/dashboard', isLast: paths.length === 0 });

    let currentPath = '';
    
    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      const isLast = i === paths.length - 1;
      
      let label = paths[i].replace(/-/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
      let href = currentPath;

      if (paths[i] === 'lab') {
        if (i === 0 && paths.length > 1 && paths[1] === 'dashboard') {
          continue; 
        }
        label = 'Dashboard';
        href = `/lab/dashboard`;
      }
      
      if (paths[i] === 'results' && paths[0] === 'lab') {
        href = '/lab/dashboard';
      }

      // Format MongoDB IDs
      if (/^[a-fA-F0-9]{24}$/.test(paths[i])) {
        label = `ID: ${paths[i].slice(-6).toUpperCase()}`;
      }
      // Format Referral Codes
      if (/^CRV-/.test(paths[i])) {
        label = paths[i];
      }
      
      crumbs.push({ label, href, isLast });
    }
    
    return crumbs;
  }
  
  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-[56px] shrink-0 border-b border-[var(--color-lims-border)] bg-white flex items-center justify-between px-6 z-40">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-4 h-4 text-[var(--color-lims-text-muted)]" />}
            {crumb.isLast ? (
              <span className="font-semibold text-[var(--color-lims-text)]">
                {crumb.label}
              </span>
            ) : (
              <NavLink 
                to={crumb.href} 
                className="text-[var(--color-lims-text-muted)] hover:text-[var(--color-lims-text)] transition-colors"
              >
                {crumb.label}
              </NavLink>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Global Search (Placeholder) */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-lims-text-muted)]" />
          <input 
            type="text" 
            placeholder="Search patients, orders..." 
            className="h-9 w-64 rounded-md border border-[var(--color-lims-border)] bg-[var(--color-lims-bg)] pl-9 pr-4 text-sm outline-none focus:border-[var(--color-lims-accent)] focus:ring-1 focus:ring-[var(--color-lims-accent)] transition-all"
          />
        </div>

        <div className="h-5 w-[1px] bg-[var(--color-lims-border)]" />

        <NotificationPopover />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-lims-bg)] border border-[var(--color-lims-border)] hover:bg-[var(--color-lims-border)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-lims-accent)]">
              <span className="text-sm font-semibold text-[var(--color-lims-text)]">
                {user?.firstName?.[0] || 'U'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="w-full flex items-center cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="w-full flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                logout()
                window.location.href = "/login"
              }}
              className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </header>
  )
}
