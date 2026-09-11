import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

export function MarketingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Services", to: "/services" },
    { label: "Test Panels", to: "/test-panels" },
    { label: "About", to: "/about" },
    { label: "Blog", to: "/blog" },
    { label: "FAQ", to: "/faq" },
  ]

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/"
    return location.pathname === to
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-[var(--color-white)] transition-all duration-200 ${
        hasScrolled ? "border-b border-[var(--color-border)] shadow-sm" : ""
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-[24px] md:px-[48px]">
        {/* Left: Brand logo */}
        <Link to="/" className="flex items-center group">
          <img
            src="/logo.jpeg"
            alt="CareBis Prime"
            className="h-[46px] w-auto object-contain mix-blend-multiply transition-transform duration-150 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Center: Nav links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-[32px]">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[14px] font-medium transition-colors ${
                isActive(link.to)
                  ? "text-[var(--color-forest)] font-semibold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-forest)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-[16px]">
          <Link
            to="/contact"
            className="text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-forest)] transition-colors"
          >
            Contact
          </Link>
          <Link
            to="/login"
            className="inline-flex h-[40px] items-center justify-center rounded-full bg-[var(--color-lime)] px-[28px] text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[var(--color-lime-dark)] hover:-translate-y-[1px]"
          >
            Book a Screening
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-[var(--color-text-secondary)]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--color-border)] bg-white px-[24px] py-[24px] shadow-lg">
          <nav className="flex flex-col gap-[20px] mb-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[17px] font-medium transition-colors ${
                  isActive(link.to)
                    ? "text-[var(--color-forest)] font-semibold"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-forest)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className="text-[17px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-forest)]"
            >
              Contact
            </Link>
          </nav>
          <div className="pt-4 border-t border-[var(--color-border)]">
            <Link
              to="/login"
              className="flex h-[48px] w-full items-center justify-center rounded-full bg-[var(--color-lime)] text-[16px] font-semibold text-white transition-all duration-150 hover:bg-[var(--color-lime-dark)]"
            >
              Book a Screening
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
