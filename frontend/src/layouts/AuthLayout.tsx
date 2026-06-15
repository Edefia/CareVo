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
      case "ADMIN":
        dashboardPath = "/admin/dashboard"
        break
      case "LABORATORY":
        dashboardPath = "/lab/dashboard"
        break
      case "INTERPRETER":
        dashboardPath = "/interpreter/dashboard"
        break
      case "CLIENT":
        dashboardPath = "/client/dashboard"
        break
    }
    return <Navigate to={dashboardPath} replace />
  }

  return (
    <div className="min-h-screen w-full bg-[var(--color-off-white)]">
      <Outlet />
    </div>
  )
}
