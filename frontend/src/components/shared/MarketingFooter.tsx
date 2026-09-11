import { Link } from "react-router-dom"

export function MarketingFooter() {
  return (
    <footer className="bg-[var(--color-text-primary)] pt-[64px] pb-[32px] px-[24px] md:px-[80px]">
      <div className="mx-auto max-w-[1200px]">
        {/* Top section — 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[48px] mb-[48px]">
          {/* Column 1: Brand */}
          <div>
            <Link
              to="/"
              className="mb-4 inline-flex items-center rounded-xl bg-white px-3 py-1.5 shadow-sm transition-transform duration-150 hover:scale-[1.02]"
            >
              <img
                src="/logo.jpeg"
                alt="CareBis Prime"
                className="h-[36px] w-auto object-contain"
              />
            </Link>
            <p className="font-serif text-[14px] italic text-white/50">
              Care Before Illness Starts.
            </p>
          </div>

          {/* Column 2: Services */}
          <div>
            <h4 className="mb-[20px] font-sans text-[11px] font-semibold uppercase tracking-wider text-white">
              Services
            </h4>
            <ul className="flex flex-col gap-[12px] font-sans text-[14px] text-white/60">
              <li>
                <Link
                  to="/services"
                  className="hover:text-white transition-colors"
                >
                  General Health Check
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-white transition-colors"
                >
                  Infectious Disease Screening
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-white transition-colors"
                >
                  Sexual &amp; Reproductive Health
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-white transition-colors"
                >
                  Chronic Disease Risk Assessment
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="mb-[20px] font-sans text-[11px] font-semibold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="flex flex-col gap-[12px] font-sans text-[14px] text-white/60">
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Get Started */}
          <div>
            <h4 className="mb-[20px] font-sans text-[11px] font-semibold uppercase tracking-wider text-white">
              Get Started
            </h4>
            <Link
              to="/login"
              className="mb-4 flex h-[44px] w-full items-center justify-center rounded-full bg-[var(--color-lime)] text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[var(--color-lime-dark)]"
            >
              Book a Screening
            </Link>
            <p className="font-sans text-[13px] text-white/50">
              Not sure where to start? We will help you.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-[24px] mt-[48px] font-sans text-[13px] text-white/60 gap-4">
          <div>&copy; {new Date().getFullYear()} CareBis Prime. All rights reserved.</div>
          <div>Made with care in Ghana 🇬🇭</div>
        </div>
      </div>
    </footer>
  )
}
