import { Link } from "react-router-dom"
import {
  HeartPulse,
  Microscope,
  Shield,
  Activity,
  ArrowRight,
} from "lucide-react"

const services = [
  {
    num: "01",
    icon: HeartPulse,
    iconBg: "rgba(220,38,38,0.08)",
    iconColor: "#DC2626",
    title: "General Health Check",
    description:
      "Think of this as your annual baseline — a chance to know your numbers before your body gives you a reason to worry. Most health problems build quietly in your blood pressure, glucose, and cholesterol, until something goes wrong. A general health check gives you a clear picture of where you stand right now.",
    recommendedFor: "Anyone 18 and older, at least once a year.",
    panelId: "panel-1",
  },
  {
    num: "02",
    icon: Microscope,
    iconBg: "rgba(15,118,224,0.08)",
    iconColor: "#0F76E0",
    title: "Infectious Disease Screening",
    description:
      "Many serious infections carry no obvious symptoms for years. These tests catch them early — before they spread or cause lasting damage. Hepatitis B, HIV, malaria, syphilis. They move through communities quietly, and early detection is what separates a manageable condition from a serious one.",
    recommendedFor:
      "Anyone sexually active, planning a pregnancy, or living in a high-risk environment.",
    panelId: "panel-2",
  },
  {
    num: "03",
    icon: Shield,
    iconBg: "rgba(126,58,124,0.08)",
    iconColor: "#7C3AED",
    title: "Sexual & Reproductive Health Screening",
    description:
      "Confidential. No judgment. Just the information you need to take care of yourself. STIs are extremely common and extremely treatable — but only when you know they are there. This screening is for anyone who is sexually active, regardless of age or relationship status.",
    recommendedFor:
      "Sexually active adults. Particularly important before starting a new relationship or after unprotected sex.",
    panelId: "panel-3",
  },
  {
    num: "04",
    icon: Activity,
    iconBg: "rgba(217,119,6,0.08)",
    iconColor: "#D97706",
    title: "Chronic Disease Risk Assessment",
    description:
      "Diabetes, hypertension, and heart disease develop slowly and quietly — and you can get ahead of all three. An HbA1c tells you what a single glucose reading cannot: your average blood sugar over three months. Together with a lipid profile and blood pressure reading, you get a real picture of where your long-term health is heading.",
    recommendedFor:
      "Adults, Youth, or anyone with a family history of diabetes, heart disease, or hypertension.",
    panelId: "panel-4",
  },
]

export function ServicesPage() {
  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAGE HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[var(--color-forest)] px-[24px] py-[80px] md:px-[80px] text-center">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-[16px] inline-flex rounded-full bg-white/10 px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-white border border-white/20">
            What We Offer
          </div>
          <h1 className="font-serif text-[40px] md:text-[56px] text-white mb-6">
            Our Screening Services
          </h1>
          <p className="font-sans text-[17px] text-white/75 leading-[1.75] max-w-[640px] mx-auto">
            We offer four core screening categories designed around the health concerns that matter most. Each one is built around real, clinically relevant tests — not unnecessary extras. Pick what fits your needs, or speak to us if you are not sure where to start.
          </p>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SERVICE CARDS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-white py-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[28px]">
            {services.map((service) => (
              <div
                key={service.num}
                className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-[40px] min-h-[360px] transition-all duration-250 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 hover:border-[var(--color-forest)]"
              >
                {/* Top */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="flex h-[56px] w-[56px] items-center justify-center rounded-[var(--radius-md)]"
                    style={{ backgroundColor: service.iconBg }}
                  >
                    <service.icon
                      className="h-7 w-7"
                      style={{ color: service.iconColor }}
                    />
                  </div>
                  <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                    {service.num}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-sans text-[22px] font-semibold text-[var(--color-forest)] mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="font-sans text-[16px] leading-[1.75] text-[var(--color-text-secondary)] mb-6">
                  {service.description}
                </p>

                {/* Recommended For — pushed to bottom */}
                <div className="mt-auto">
                  <div className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                    Recommended For
                  </div>
                  <span className="inline-block rounded-full border border-[var(--color-border)] px-[12px] py-[4px] font-sans text-[13px] text-[var(--color-text-secondary)]">
                    {service.recommendedFor}
                  </span>
                </div>

                {/* View Test Panel link */}
                <Link
                  to={`/test-panels#${service.panelId}`}
                  className="mt-4 inline-flex items-center gap-1 font-sans text-[14px] font-semibold text-[var(--color-forest)] hover:text-[var(--color-lime-dark)] transition-colors"
                >
                  View Test Panel <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BOTTOM CTA
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-white pb-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] p-[48px] text-center">
            <h3 className="font-serif text-[28px] text-[var(--color-forest)] mb-3">
              Not sure which screening is right for you?
            </h3>
            <p className="font-sans text-[16px] text-[var(--color-text-secondary)] mb-6">
              Reach out before booking — we will point you in the right direction.
            </p>
            <div className="flex flex-col sm:flex-row gap-[16px] justify-center">
              <Link
                to="/contact"
                className="inline-flex h-[44px] items-center justify-center rounded-full bg-[var(--color-lime)] px-[28px] font-sans text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[var(--color-lime-dark)]"
              >
                Contact Us
              </Link>
              <Link
                to="/test-panels"
                className="inline-flex h-[44px] items-center justify-center rounded-full border-[1.5px] border-[var(--color-forest)] px-[27px] font-sans text-[15px] font-semibold text-[var(--color-forest)] transition-all duration-150 hover:bg-[var(--color-forest)] hover:text-white"
              >
                View Test Panels
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
