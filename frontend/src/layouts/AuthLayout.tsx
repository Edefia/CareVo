import { Outlet, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { LoadingState } from "@/components/shared/LoadingState"

export function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) {
    return <LoadingState message="Authenticating..." fullScreen />
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
