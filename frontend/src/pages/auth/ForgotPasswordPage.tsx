import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Link } from "react-router-dom"
import { authService } from "@/api/services/auth"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import toast from "react-hot-toast"
import { Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      setIsLoading(true)
      setApiError(null)
      
      await authService.requestPasswordReset(data.email)
      
      setSuccess(true)
      toast.success("Reset link sent!")
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Failed to request password reset. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* LEFT PANEL (Visual) */}
      <div className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-[var(--color-forest)] p-[48px] lg:flex sticky top-0 h-screen">
        <div>
          <Link to="/" className="flex items-center gap-1">
            <span className="font-serif text-[26px] font-semibold text-white">CareVo</span>
            <sup className="mt-1 text-[12px] font-bold text-[var(--color-lime)]">®</sup>
          </Link>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center">
          <p className="mb-[64px] max-w-[380px] text-center font-serif text-[36px] italic leading-[1.4] text-white">
            "Secure access to your health journey."
          </p>

          <div className="relative h-[240px] w-full max-w-[400px]">
             {/* Simple visual placeholder, reused layout */}
            <div className="absolute left-[10%] top-0 h-[160px] w-[220px] overflow-hidden rounded-[var(--radius-xl)] shadow-xl z-10 border border-white/10">
              <img src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300&h=200&fit=crop" alt="Clinical" className="h-full w-full object-cover" />
            </div>
            <div className="absolute right-[5%] top-[40px] h-[140px] w-[180px] rotate-[3deg] overflow-hidden rounded-[var(--radius-lg)] shadow-2xl z-20 border border-white/10">
              <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=200&h=150&fit=crop" alt="Lab" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-[-20px] left-[20%] h-[120px] w-[160px] -rotate-[2deg] overflow-hidden rounded-[var(--radius-lg)] shadow-lg z-30 border border-white/10">
              <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=150&fit=crop" alt="Checkup" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[24px]">
          {["256-bit encryption", "HIPAA aligned", "Certified labs"].map((text, i) => (
            <div key={i} className="flex items-center gap-[8px]">
              <CheckCircle className="h-[14px] w-[14px] text-[var(--color-lime)]" />
              <span className="font-sans text-[13px] text-white/75">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL (Form) */}
      <div className="flex w-full flex-col bg-[var(--color-white)] lg:w-[52%] min-h-screen overflow-y-auto px-[24px] py-[32px] md:px-[64px] md:py-[48px]">
        
        <div className="flex justify-start text-[14px] text-[var(--color-text-muted)] mb-auto">
          <Link to="/login" className="flex items-center font-medium text-[var(--color-forest)] hover:text-[var(--color-lime-dark)] transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[400px] my-auto py-12">
          
          <h1 className="mb-2 font-serif text-[32px] font-semibold text-[var(--color-forest)]">Forgot password?</h1>
          <p className="mb-[32px] font-sans text-[15px] text-[var(--color-text-muted)]">No worries, we'll send you reset instructions.</p>

          {success ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-8 text-center">
              <div className="mb-4 rounded-full bg-[#ECFDF5] p-3">
                <CheckCircle className="h-8 w-8 text-[#10B981]" />
              </div>
              <h3 className="mb-2 font-serif text-[24px] font-semibold text-[var(--color-forest)]">Check your email</h3>
              <p className="mb-6 font-sans text-[14px] text-[var(--color-text-muted)]">
                We sent a password reset link to your email address.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Return to login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[20px]">
              
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  data-error={!!errors.email}
                />
                {errors.email && (
                  <div className="mt-[4px] flex items-center gap-1 font-sans text-[12px] text-[var(--color-danger)]">
                    <AlertCircle className="h-[14px] w-[14px]" />
                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>

              {apiError && (
                <div className="flex items-start gap-[8px] rounded-[var(--radius-md)] border border-[#FECACA] bg-[#FEF2F2] px-[16px] py-[12px]">
                  <AlertCircle className="mt-[2px] h-[16px] w-[16px] shrink-0 text-[var(--color-danger)]" />
                  <span className="font-sans text-[14px] text-[var(--color-danger)]">{apiError}</span>
                </div>
              )}

              <Button type="submit" className="mt-2 h-[52px] w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          )}

        </div>
        
        <div className="mt-auto"></div>
      </div>
    </div>
  )
}
