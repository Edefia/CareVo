import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { authService } from "@/api/services/auth"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import toast from "react-hot-toast"
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react"

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(passwordRegex, "Must contain uppercase, lowercase, number, and special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      setApiError("Invalid or missing reset token.")
      return
    }

    try {
      setIsLoading(true)
      setApiError(null)
      
      await authService.resetPassword({ token, newPassword: data.password })
      
      toast.success("Password reset successfully! You can now log in.")
      navigate("/login")
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Failed to reset password. The link might have expired.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[var(--color-bg-subtle)] p-4">
        <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[var(--color-danger)]" />
          <h2 className="mb-2 font-serif text-2xl font-semibold text-[var(--color-forest)]">Invalid Link</h2>
          <p className="mb-6 font-sans text-[var(--color-text-muted)]">
            This password reset link is invalid or missing the required token.
          </p>
          <Button asChild className="w-full">
            <Link to="/forgot-password">Request new link</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* LEFT PANEL (Visual) */}
      <div className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-[var(--color-forest)] p-[48px] lg:flex sticky top-0 h-screen">
        <div>
          <Link to="/" className="inline-flex items-center rounded-xl bg-white px-3 py-1.5 shadow-md transition-transform duration-150 hover:scale-[1.02]">
            <img src="/logo.jpeg" alt="CareBis Prime" className="h-[36px] w-auto object-contain" />
          </Link>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center">
          <p className="mb-[64px] max-w-[380px] text-center font-serif text-[36px] italic leading-[1.4] text-white">
            "Secure access to your health journey."
          </p>
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
        
        <div className="mx-auto w-full max-w-[400px] my-auto py-12">
          
          {/* Mobile brand logo */}
          <div className="lg:hidden mb-6">
            <Link to="/" className="inline-block">
              <img src="/logo.jpeg" alt="CareBis Prime" className="h-[44px] w-auto object-contain mix-blend-multiply" />
            </Link>
          </div>

          <h1 className="mb-2 font-serif text-[32px] font-semibold text-[var(--color-forest)]">Set new password</h1>
          <p className="mb-[32px] font-sans text-[15px] text-[var(--color-text-muted)]">Please enter your new secure password.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[20px]">
            
            <div>
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  data-error={!!errors.password}
                  className="pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="mt-[4px] flex items-start gap-1 font-sans text-[12px] text-[var(--color-danger)]">
                  <AlertCircle className="mt-0.5 h-[14px] w-[14px] shrink-0" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  data-error={!!errors.confirmPassword}
                  className="pr-10"
                />
              </div>
              {errors.confirmPassword && (
                <div className="mt-[4px] flex items-center gap-1 font-sans text-[12px] text-[var(--color-danger)]">
                  <AlertCircle className="h-[14px] w-[14px]" />
                  <span>{errors.confirmPassword.message}</span>
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
                  Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>

        </div>
        
      </div>
    </div>
  )
}
