import { Outlet, useLocation } from "react-router-dom"
import { MarketingNavbar } from "../components/shared/MarketingNavbar"
import { MarketingFooter } from "../components/shared/MarketingFooter"
import { useEffect } from "react"

export function MarketingLayout() {
  const { pathname } = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-off-white)] font-sans text-[var(--color-text-primary)]">
      <MarketingNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  )
}
