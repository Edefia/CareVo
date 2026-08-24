import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { authService } from "@/api/services/auth"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import toast from "react-hot-toast"
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true)
      setApiError(null)
      
      const response = await authService.login(data)
      
      if (response.mfaRequired) {
        navigate("/mfa-challenge", { 
          state: { 
            token: response.token, 
            setupRequired: response.setupRequired 
          } 
        })
        return
      }

      setAuth(response.user, response.token)
      toast.success("Welcome back!")
      navigate("/dashboard")
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Failed to sign in. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          LEFT PANEL (Visual)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-[var(--color-forest)] p-[48px] lg:flex sticky top-0 h-screen">
        
        {/* Top: Brand */}
        <div>
          <Link to="/" className="flex items-center gap-1">
            <span className="font-serif text-[26px] font-semibold text-white">CareBis Prime</span>
            <sup className="mt-1 text-[12px] font-bold text-[var(--color-lime)]">®</sup>
          </Link>
        </div>

        {/* Center: Quote & Images */}
        <div className="relative flex flex-1 flex-col items-center justify-center">
          <p className="mb-[64px] max-w-[380px] text-center font-serif text-[36px] italic leading-[1.4] text-white">
            "Your health story starts with understanding it."
          </p>

          <div className="relative h-[240px] w-full max-w-[400px]">
            {/* Top-Left Photo */}
            <div className="absolute left-[10%] top-0 h-[160px] w-[220px] overflow-hidden rounded-[var(--radius-xl)] shadow-xl z-10 border border-white/10">
              <img src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300&h=200&fit=crop" alt="Clinical" className="h-full w-full object-cover" />
            </div>
            
            {/* Middle-Right Photo (rotated) */}
            <div className="absolute right-[5%] top-[40px] h-[140px] w-[180px] rotate-[3deg] overflow-hidden rounded-[var(--radius-lg)] shadow-2xl z-20 border border-white/10">
              <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=200&h=150&fit=crop" alt="Lab" className="h-full w-full object-cover" />
            </div>

            {/* Bottom-Left Photo (rotated) */}
            <div className="absolute bottom-[-20px] left-[20%] h-[120px] w-[160px] -rotate-[2deg] overflow-hidden rounded-[var(--radius-lg)] shadow-lg z-30 border border-white/10">
              <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=150&fit=crop" alt="Checkup" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>

        {/* Bottom: Trust Indicators */}
        <div className="flex items-center gap-[24px]">
          {["256-bit encryption", "HIPAA aligned", "Certified labs"].map((text, i) => (
            <div key={i} className="flex items-center gap-[8px]">
              <CheckCircle className="h-[14px] w-[14px] text-[var(--color-lime)]" />
              <span className="font-sans text-[13px] text-white/75">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          RIGHT PANEL (Form)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex w-full flex-col bg-[var(--color-white)] lg:w-[52%] min-h-screen overflow-y-auto px-[24px] py-[32px] md:px-[64px] md:py-[48px]">
        
        {/* Top Right Header */}
        <div className="flex justify-end text-[14px] text-[var(--color-text-muted)] mb-auto">
          Don't have an account?{" "}
          <Link to="/register" className="ml-1 font-medium text-[var(--color-lime-dark)] hover:text-[var(--color-forest)] transition-colors">
            Register
          </Link>
        </div>

        {/* Form Container */}
        <div className="mx-auto w-full max-w-[400px] my-auto py-12">
          
          <h1 className="mb-2 font-serif text-[32px] font-semibold text-[var(--color-forest)]">Welcome back.</h1>
          <p className="mb-[32px] font-sans text-[15px] text-[var(--color-text-muted)]">Sign in to your CareBis Prime account.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[20px]">
            
            {/* Email Field */}
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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="mb-[6px] font-sans text-[13px] font-medium text-[var(--color-forest)] hover:underline">
                  Forgot password?
                </Link>
              </div>
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
                <div className="mt-[4px] flex items-center gap-1 font-sans text-[12px] text-[var(--color-danger)]">
                  <AlertCircle className="h-[14px] w-[14px]" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* API Error Alert */}
            {apiError && (
              <div className="flex items-start gap-[8px] rounded-[var(--radius-md)] border border-[#FECACA] bg-[#FEF2F2] px-[16px] py-[12px]">
                <AlertCircle className="mt-[2px] h-[16px] w-[16px] shrink-0 text-[var(--color-danger)]" />
                <span className="font-sans text-[14px] text-[var(--color-danger)]">{apiError}</span>
              </div>
            )}

            {/* Submit */}
            <Button type="submit" className="mt-2 h-[52px] w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

        </div>
        
        {/* Empty bottom spacer to balance 'mb-auto' at the top */}
        <div className="mt-auto"></div>
      </div>
    </div>
  )
}
