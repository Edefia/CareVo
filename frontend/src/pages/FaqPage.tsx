import { Link } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

const faqItems = [
  {
    question: "Do I need a doctor's referral to book a screening?",
    answer:
      "No. You can book directly through CareBis Prime without a referral. Screening is preventive — you do not need to be sick to get tested.",
  },
  {
    question: "How do I book a screening?",
    answer:
      "Simply choose your screening category on our website, pick a convenient time, and confirm your booking. We will connect you to a trusted partner lab near you.",
  },
  {
    question: "Where do the tests take place?",
    answer:
      "All tests are carried out at our verified partner laboratories. You will receive the location details after booking.",
  },
  {
    question: "How long does it take to get results?",
    answer:
      "Turnaround time depends on the specific tests, but most results are available within 24 to 72 hours. We will let you know what to expect when you book.",
  },
  {
    question: "Will someone help me understand my results?",
    answer:
      "Yes. One of the most important things we do is help you make sense of your results. We translate medical language into plain English and guide you on what your next steps should be.",
  },
  {
    question: "Are my results and personal information kept confidential?",
    answer:
      "Absolutely. Your health information is private and handled with full discretion at every step.",
  },
  {
    question: "What if my results show something concerning?",
    answer:
      "We will guide you on the appropriate next steps, which may include seeing a doctor or specialist. We will help you understand what the result means and where to go from there — you will not be left to figure it out alone.",
  },
  {
    question:
      "Can I book for someone else — a family member or colleague?",
    answer:
      "Yes. You can book a screening on behalf of a family member or colleague. Just provide their details during the booking process.",
  },
  {
    question: "How often should I get screened?",
    answer:
      "For most healthy adults, a general health check once a year is a good baseline. Some screenings may be recommended more frequently depending on your lifestyle and risk factors. We can advise you on what is right for your situation.",
  },
]

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        className="flex w-full items-center justify-between py-[24px] text-left cursor-pointer group"
        onClick={onToggle}
      >
        <span className="font-sans text-[17px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-forest)] transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-[var(--color-text-muted)] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-[24px]">
          <p className="font-sans text-[16px] leading-[1.8] text-[var(--color-text-secondary)]">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

export function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAGE HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[var(--color-forest)] px-[24px] py-[80px] md:px-[80px] text-center">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="font-serif text-[40px] md:text-[52px] text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="font-sans text-[17px] text-white/70">
            Everything you need to know about screening with CareBis Prime.
          </p>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FAQ ACCORDION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-white py-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[800px]">
          {faqItems.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BOTTOM CTA
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-white pb-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[800px]">
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] p-[40px] text-center">
            <h3 className="font-serif text-[26px] text-[var(--color-forest)] mb-3">
              Still have questions?
            </h3>
            <p className="font-sans text-[15px] text-[var(--color-text-secondary)] mb-6">
              We are happy to help before you book.
            </p>
            <Link
              to="/contact"
              className="inline-flex h-[44px] items-center justify-center rounded-full bg-[var(--color-lime)] px-[28px] font-sans text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[var(--color-lime-dark)]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
