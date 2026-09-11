import {
  Heart,
  Target,
  Globe,
  CheckCircle,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react"

export function AboutPage() {
  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAGE HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative bg-[var(--color-forest)] px-[24px] py-[96px] md:px-[80px] min-h-[420px] overflow-hidden">
        <div className="mx-auto max-w-[1200px] flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Left column (60%) */}
          <div className="w-full lg:w-[60%]">
            <div className="mb-[16px] inline-flex rounded-full bg-white/10 px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-white border border-white/20">
              Our Story
            </div>
            <h1 className="font-serif text-[36px] md:text-[52px] text-white leading-[1.2]">
              We Started With a Simple Question: Why Is Preventive Healthcare So Hard to Access?
            </h1>
          </div>

          {/* Right column (40%) — decorative */}
          <div className="hidden lg:block w-[40%] relative">
            <span className="absolute right-0 top-0 font-serif text-[200px] font-bold text-[rgba(73,136,207,0.18)] leading-none select-none pointer-events-none">
              &ldquo;
            </span>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          WHO WE ARE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-white py-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px] flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Left: Body text */}
          <div className="w-full lg:w-1/2">
            <p className="font-sans text-[17px] leading-[1.85] text-[var(--color-text-secondary)] mb-6">
              Too many people find out about serious health conditions late — not because the signs were not there, but because screening was complicated, expensive, or confusing. CareBis Prime was built to change that.
            </p>
            <p className="font-sans text-[17px] leading-[1.85] text-[var(--color-text-secondary)]">
              We are a preventive healthcare platform that connects individuals to reliable screening services, helps them understand their results, and supports them in taking the right next steps. We believe that access to clear, honest health information is something everyone deserves, not just those who can afford a private doctor.
            </p>
          </div>

          {/* Right: Photo + floating card */}
          <div className="w-full lg:w-1/2 relative">
            <div className="rounded-[var(--radius-xl)] overflow-hidden">
              <img
                src="/images/about-wellness.jpg"
                alt="Confident Black African woman smiling and embracing proactive preventive healthcare"
                className="w-full h-[400px] object-cover"
              />
            </div>
            {/* Floating card */}
            <div className="absolute bottom-6 left-6 rounded-[var(--radius-md)] bg-white px-[20px] py-[16px] shadow-[var(--shadow-card-hover)]">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-5 w-5 text-[var(--color-lime)]" />
                <span className="font-sans text-[14px] font-semibold text-[var(--color-forest)]">
                  Prevention First
                </span>
              </div>
              <div className="font-sans text-[12px] text-[var(--color-text-muted)]">
                Catch it before it catches you.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MISSION & VISION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[var(--color-off-white)] py-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          {/* Mission Card */}
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-forest)] p-[40px]">
            <Target className="h-8 w-8 text-[var(--color-lime)] mb-4" />
            <div className="font-sans text-[12px] font-semibold uppercase tracking-wider text-white/60 mb-2">
              Our Mission
            </div>
            <h3 className="font-serif text-[28px] text-white mb-4">Our Mission</h3>
            <p className="font-sans text-[16px] text-white/80 leading-[1.75]">
              To eliminate diagnostic friction through seamless digital booking, transparent pricing, and actionable, plain-language health insights.
            </p>
          </div>

          {/* Vision Card */}
          <div className="rounded-[var(--radius-lg)] bg-white border-2 border-[var(--color-forest)] p-[40px]">
            <Globe className="h-8 w-8 text-[var(--color-forest)] mb-4" />
            <div className="font-sans text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Our Vision
            </div>
            <h3 className="font-serif text-[28px] text-[var(--color-forest)] mb-4">Our Vision</h3>
            <p className="font-sans text-[16px] text-[var(--color-text-secondary)] leading-[1.75]">
              A world where proactive healthcare is accessible, understandable, and routine for every African youth.
            </p>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          WHAT WE ACTUALLY DO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-white py-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="font-serif text-[36px] md:text-[44px] text-center text-[var(--color-text-primary)] mb-6">
            What We Actually Do
          </h2>
          <p className="font-sans text-[17px] text-center text-[var(--color-text-secondary)] leading-[1.75] max-w-[720px] mx-auto mb-12">
            CareBis Prime is not a hospital or a laboratory. We are the layer between you and the healthcare system that makes everything easier.
          </p>

          {/* Action items */}
          <div className="max-w-[720px] mx-auto">
            {[
              "We help you figure out which tests are right for you.",
              "We connect you to verified partner laboratories.",
              "We help you interpret your results in plain language.",
              "We provide longitudinal information on your health.",
              "We provide health education so you can make informed decisions about your body.",
            ].map((item, index, arr) => (
              <div
                key={index}
                className={`flex items-center gap-4 py-[16px] ${
                  index < arr.length - 1 ? "border-b border-[var(--color-border)]" : ""
                }`}
              >
                <CheckCircle className="h-7 w-7 text-[var(--color-lime)] shrink-0" />
                <span className="font-sans text-[17px] text-[var(--color-text-primary)]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OUR VALUES
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[var(--color-off-white)] py-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-[48px]">
            <div className="mb-[16px] inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-forest)]">
              What We Stand For
            </div>
            <h2 className="font-serif text-[36px] md:text-[44px] text-[var(--color-text-primary)]">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            {[
              {
                icon: MessageSquare,
                title: "Clarity",
                body: "Health information should be easy to understand. We strip away the jargon and speak to you like a knowledgeable friend would.",
                num: "01",
              },
              {
                icon: Globe,
                title: "Accessibility",
                body: "Preventive healthcare should not be a luxury. We work to make screening services reachable for every adult, regardless of where they are.",
                num: "02",
              },
              {
                icon: ShieldCheck,
                title: "Trust",
                body: "We only partner with facilities we would send our own families to. Your health is not something we take lightly.",
                num: "03",
              },
              {
                icon: Zap,
                title: "Empowerment",
                body: "We do not just give you results. We give you the knowledge and guidance to act on them.",
                num: "04",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="relative rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-[28px]"
              >
                <div className="absolute top-4 right-4 font-serif text-[48px] font-bold text-[rgba(4,47,100,0.08)] leading-none select-none pointer-events-none">
                  {value.num}
                </div>
                <value.icon className="h-7 w-7 text-[var(--color-forest)] mb-4" />
                <h3 className="font-sans text-[18px] font-semibold text-[var(--color-forest)] mb-2">
                  {value.title}
                </h3>
                <p className="font-sans text-[15px] text-[var(--color-text-secondary)] leading-[1.7]">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
