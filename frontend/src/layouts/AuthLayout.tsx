import { Outlet, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"

export function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  // If already authenticated, redirect to their dashboard
  if (isAuthenticated && user) {
    let dashboardPath = "/dashboard"
    switch (user.role) {
      case "SUPER_ADMIN":
        dashboardPath = "/admin/dashboard"
        break
      case "PLATFORM_ADMIN":
        dashboardPath = "/platform/dashboard"
        break
      case "LAB_ADMIN":
        dashboardPath = "/lab/dashboard"
        break
      case "LAB_STAFF":
        dashboardPath = "/lab/staff/dashboard"
        break
      case "INTERPRETER":
        dashboardPath = "/interpreter/dashboard"
        break
      case "HEALTH_ADVOCATE":
        dashboardPath = "/advocate/dashboard"
        break
      case "REFERRAL_PARTNER":
        dashboardPath = "/referral/dashboard"
        break
      case "PATIENT":
        dashboardPath = "/patient/dashboard"
        break
    }
    return <Navigate to={dashboardPath} replace />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          {/* Logo Placeholder */}
          <div className="h-12 w-12 rounded-lg bg-primary mb-4 flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-primary-foreground">CH</span>
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-foreground">
            CareVo Health
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Preventive Healthcare Platform
          </p>
        </div>
        <div className="rounded-xl border bg-card p-8 shadow-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
