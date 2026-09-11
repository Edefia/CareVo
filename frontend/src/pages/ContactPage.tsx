import { Mail, Phone, MapPin, Clock, CheckCircle } from "lucide-react"
import { useState } from "react"
import type { FormEvent } from "react"

export function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Full name is required."
    if (!formData.email.trim()) newErrors.email = "Email address is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address."
    if (!formData.subject.trim()) newErrors.subject = "Subject is required."
    if (!formData.message.trim()) newErrors.message = "Message is required."
    return newErrors
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    // TODO: wire to email service (Resend / Nodemailer)
    console.log(formData)
    setIsSubmitted(true)
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    setErrors({})
    setIsSubmitted(false)
  }

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAGE HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[var(--color-forest)] px-[24px] py-[80px] md:px-[80px] text-center">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="font-serif text-[40px] md:text-[52px] text-white mb-6">
            Get in Touch
          </h1>
          <p className="font-sans text-[17px] text-white/75 leading-[1.75] max-w-[600px] mx-auto">
            Have a question about our services? Not sure which screening is right for you? We are here to help. Reach out and a member of our team will get back to you.
          </p>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CONTACT CONTENT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-white py-[80px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px] flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left — Contact Form (60%) */}
          <div className="w-full lg:w-[60%]">
            {!isSubmitted ? (
              <>
                <h2 className="font-serif text-[28px] text-[var(--color-forest)] mb-6">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block font-sans text-[13px] font-medium text-[var(--color-text-secondary)] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full h-[48px] rounded-[var(--radius-md)] border px-4 font-sans text-[15px] text-[var(--color-text-primary)] outline-none transition-colors ${
                        errors.name
                          ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                          : "border-[var(--color-border)] focus:border-[var(--color-forest)]"
                      } focus:ring-2 focus:ring-[var(--color-forest)]/10`}
                    />
                    {errors.name && (
                      <p className="mt-1 font-sans text-[13px] text-[var(--color-danger)]">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-sans text-[13px] font-medium text-[var(--color-text-secondary)] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full h-[48px] rounded-[var(--radius-md)] border px-4 font-sans text-[15px] text-[var(--color-text-primary)] outline-none transition-colors ${
                        errors.email
                          ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                          : "border-[var(--color-border)] focus:border-[var(--color-forest)]"
                      } focus:ring-2 focus:ring-[var(--color-forest)]/10`}
                    />
                    {errors.email && (
                      <p className="mt-1 font-sans text-[13px] text-[var(--color-danger)]">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone (optional) */}
                  <div>
                    <label className="block font-sans text-[13px] font-medium text-[var(--color-text-secondary)] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full h-[48px] rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 font-sans text-[15px] text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/10"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block font-sans text-[13px] font-medium text-[var(--color-text-secondary)] mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className={`w-full h-[48px] rounded-[var(--radius-md)] border px-4 font-sans text-[15px] text-[var(--color-text-primary)] outline-none transition-colors ${
                        errors.subject
                          ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                          : "border-[var(--color-border)] focus:border-[var(--color-forest)]"
                      } focus:ring-2 focus:ring-[var(--color-forest)]/10`}
                    />
                    {errors.subject && (
                      <p className="mt-1 font-sans text-[13px] text-[var(--color-danger)]">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block font-sans text-[13px] font-medium text-[var(--color-text-secondary)] mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={5}
                      className={`w-full min-h-[140px] rounded-[var(--radius-md)] border px-4 py-3 font-sans text-[15px] text-[var(--color-text-primary)] outline-none transition-colors resize-y ${
                        errors.message
                          ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                          : "border-[var(--color-border)] focus:border-[var(--color-forest)]"
                      } focus:ring-2 focus:ring-[var(--color-forest)]/10`}
                    />
                    {errors.message && (
                      <p className="mt-1 font-sans text-[13px] text-[var(--color-danger)]">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="h-[48px] w-full rounded-full bg-[var(--color-lime)] font-sans text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[var(--color-lime-dark)] hover:-translate-y-[1px]"
                  >
                    Send Message
                  </button>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle className="h-16 w-16 text-[var(--color-lime)] mb-6" />
                <h2 className="font-serif text-[28px] text-[var(--color-forest)] mb-3">
                  Message Sent!
                </h2>
                <p className="font-sans text-[16px] text-[var(--color-text-secondary)] mb-6">
                  Thank you. We will get back to you within 24 hours.
                </p>
                <button
                  onClick={resetForm}
                  className="inline-flex h-[44px] items-center justify-center rounded-full border-[1.5px] border-[var(--color-forest)] px-[27px] font-sans text-[15px] font-semibold text-[var(--color-forest)] transition-all duration-150 hover:bg-[var(--color-forest)] hover:text-white"
                >
                  Send Another Message
                </button>
              </div>
            )}
          </div>

          {/* Right — Contact Info (40%) */}
          <div className="w-full lg:w-[40%]">
            <h2 className="font-serif text-[24px] text-[var(--color-forest)] mb-8">
              Other Ways to Reach Us
            </h2>

            <div className="flex flex-col gap-6 mb-8">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "hello@carebisprime.com",
                  // TODO: replace with real email
                  href: "mailto:hello@carebisprime.com",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: "+233 XX XXX XXXX",
                  // TODO: replace with real number
                  href: "tel:+233000000000",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "Accra, Ghana",
                  // TODO: replace with real address
                },
                {
                  icon: Clock,
                  label: "Hours",
                  value: "Monday – Friday, 8:00 AM – 5:00 PM",
                  // TODO: replace with real hours
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-2)]">
                    <item.icon className="h-5 w-5 text-[var(--color-forest)]" />
                  </div>
                  <div>
                    <div className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                      {item.label}
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="font-sans text-[15px] font-medium text-[var(--color-forest)] hover:text-[var(--color-lime-dark)] transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="font-sans text-[15px] font-medium text-[var(--color-forest)]">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom card */}
            <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] p-[24px]">
              <h3 className="font-serif text-[20px] text-[var(--color-forest)] mb-2">
                Not sure which test you need?
              </h3>
              <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mb-4">
                Tell us a bit about your health concerns and we will help you pick the right screening.
              </p>
              <a
                href="#"
                className="inline-flex h-[40px] items-center justify-center rounded-full border-[1.5px] border-[var(--color-forest)] px-[24px] font-sans text-[14px] font-semibold text-[var(--color-forest)] transition-all duration-150 hover:bg-[var(--color-forest)] hover:text-white"
              >
                Book a Consultation
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
