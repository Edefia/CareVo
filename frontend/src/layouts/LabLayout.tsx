import { Outlet, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { IconRail } from "@/components/lab/IconRail"
import { LabTopBar } from "@/components/lab/LabTopBar"

export function LabLayout() {
  const { user, isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Security fallback: if somehow a non-lab user gets here, kick them out
  // (Though ProtectedRoute in App.tsx might also handle this)
  if (user?.role !== "LABORATORY") {
    // We shouldn't kick ADMINs if they are masquerading, but for now we enforce LABORATORY
    // To be safe, allow ADMIN as well if they are viewing lab routes
    if (user?.role !== "ADMIN") {
      return <Navigate to="/" replace />
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-lims-bg)] font-sans">
      <IconRail />
      
      <div className="flex flex-1 flex-col min-w-0">
        <LabTopBar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
