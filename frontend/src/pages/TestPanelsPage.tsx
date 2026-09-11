import { Link } from "react-router-dom"
import {
  HeartPulse,
  Microscope,
  Shield,
  Activity,
  CheckCircle,
  HelpCircle,
} from "lucide-react"

const panels = [
  {
    id: "panel-1",
    num: "01",
    name: "General Health Panel",
    icon: HeartPulse,
    iconColor: "#DC2626",
    tests: [
      "Full Blood Count (FBC)",
      "Fasting Blood Glucose",
      "Lipid Profile",
      "Kidney Function Test",
      "Liver Function Test",
      "Urinalysis",
      "Blood Pressure Measurement",
      "Blood Group and Rhesus Factor",
    ],
  },
  {
    id: "panel-2",
    num: "02",
    name: "Infectious Disease Panel",
    icon: Microscope,
    iconColor: "#0F76E0",
    tests: [
      "HIV Rapid Test",
      "Hepatitis B Surface Antigen (HBsAg)",
      "Hepatitis C Antibody Test",
      "Syphilis Screening (VDRL or RPR)",
      "Malaria Rapid Diagnostic Test (RDT)",
      "Typhoid Test (Widal)",
    ],
  },
  {
    id: "panel-3",
    num: "03",
    name: "Sexual & Reproductive Health Panel",
    icon: Shield,
    iconColor: "#7C3AED",
    tests: [
      "HIV Test",
      "Syphilis",
      "Hepatitis B and C Screening",
      "Gonorrhoea",
      "Chlamydia",
      "Pregnancy Test",
    ],
  },
  {
    id: "panel-4",
    num: "04",
    name: "Chronic Disease Risk Panel",
    icon: Activity,
    iconColor: "#D97706",
    tests: [
      "HbA1c",
      "Fasting Blood Glucose",
      "Blood Pressure Measurement",
      "Full Lipid Profile",
      "BMI and Waist Circumference Assessment",
      "Kidney Function Test",
    ],
  },
]

export function TestPanelsPage() {
  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAGE HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[var(--color-forest)] px-[24px] py-[80px] md:px-[80px] text-center">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="font-serif text-[40px] md:text-[52px] text-white mb-6">
            Our Test Panels
          </h1>
          <p className="font-sans text-[17px] text-white/75 leading-[1.75] max-w-[640px] mx-auto">
            Every test we offer serves a clear purpose — to screen for a real condition before symptoms appear. Below is a breakdown of the standard tests available across our screening panels.
          </p>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PANEL SECTIONS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-white py-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          {panels.map((panel, index) => (
            <div
              key={panel.id}
              id={panel.id}
              className={`flex flex-col lg:flex-row gap-10 lg:gap-16 py-[48px] ${
                index < panels.length - 1
                  ? "border-b border-[var(--color-border)]"
                  : ""
              }`}
            >
              {/* Left side (45%) — panel info */}
              <div className="w-full lg:w-[45%] relative">
                <div className="absolute -top-2 left-0 font-serif text-[80px] font-bold text-[rgba(4,47,100,0.06)] leading-none select-none pointer-events-none">
                  {panel.num}
                </div>
                <div className="relative pt-8">
                  <div
                    className="flex h-[48px] w-[48px] items-center justify-center rounded-[var(--radius-md)] mb-4"
                    style={{
                      backgroundColor: `${panel.iconColor}15`,
                    }}
                  >
                    <panel.icon
                      className="h-6 w-6"
                      style={{ color: panel.iconColor }}
                    />
                  </div>
                  <h3 className="font-serif text-[28px] md:text-[32px] font-semibold text-[var(--color-forest)] mb-4">
                    {panel.name}
                  </h3>
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-1 font-sans text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-forest)] transition-colors"
                  >
                    &larr; View Service
                  </Link>
                </div>
              </div>

              {/* Right side (55%) — test list */}
              <div className="w-full lg:w-[55%]">
                <div className="flex flex-col">
                  {panel.tests.map((test, testIndex) => (
                    <div
                      key={test}
                      className={`flex items-center gap-3 py-[12px] hover:bg-[var(--color-off-white)] px-2 -mx-2 rounded transition-colors ${
                        testIndex < panel.tests.length - 1
                          ? "border-b border-[var(--color-border)]"
                          : ""
                      }`}
                    >
                      <CheckCircle className="h-[18px] w-[18px] text-[var(--color-lime)] shrink-0" />
                      <span className="font-sans text-[16px] font-medium text-[var(--color-text-primary)]">
                        {test}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BOTTOM NOTE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-white pb-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-forest)] p-[40px] text-center">
            <HelpCircle className="h-10 w-10 text-[var(--color-lime)] mx-auto mb-4" />
            <p className="font-serif text-[20px] md:text-[22px] text-white italic leading-[1.6] max-w-[600px] mx-auto mb-6">
              Not sure which panel is right for you? We will help you figure it out. Reach out to us before booking and we will point you in the right direction.
            </p>
            <Link
              to="/contact"
              className="inline-flex h-[44px] items-center justify-center rounded-full bg-white px-[28px] font-sans text-[15px] font-semibold text-[var(--color-forest)] transition-all duration-150 hover:bg-[var(--color-off-white)]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
