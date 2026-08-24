import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Link, useNavigate } from "react-router-dom"
import { authService } from "@/api/services/auth"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import toast from "react-hot-toast"
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(12, "Password must be at least 12 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const passwordValue = watch("password") || ""

  // Password Strength Logic
  const strength = useMemo(() => {
    let score = 0
    if (!passwordValue) return { score: 0, label: "", color: "bg-slate-200" }
    
    if (passwordValue.length >= 8) score += 1
    if (passwordValue.length >= 12) score += 1
    if (/[A-Z]/.test(passwordValue)) score += 1
    if (/[0-9]/.test(passwordValue) && /[^A-Za-z0-9]/.test(passwordValue)) score += 1

    switch(score) {
      case 0: return { score: 0, label: "", color: "bg-slate-200" }
      case 1: return { score: 1, label: "Weak", color: "bg-red-500" }
      case 2: return { score: 2, label: "Fair", color: "bg-orange-500" }
      case 3: return { score: 3, label: "Good", color: "bg-amber-500" }
      case 4: return { score: 4, label: "Strong", color: "bg-emerald-500" }
      default: return { score: 0, label: "", color: "bg-slate-200" }
    }
  }, [passwordValue])

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true)
      setApiError(null)
      await authService.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      
      toast.success("Registration successful! You can now log in.")
      navigate("/login")
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Failed to register. Please try again.")
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
          <p className="mb-[64px] max-w-[440px] text-center font-serif text-[36px] italic leading-[1.4] text-white">
            "Start your preventive health journey today."
          </p>

          <div className="relative h-[240px] w-full max-w-[400px]">
            {/* Top-Left Photo */}
            <div className="absolute left-[5%] top-[20px] h-[180px] w-[200px] -rotate-[4deg] overflow-hidden rounded-[var(--radius-xl)] shadow-xl z-10 border border-white/10">
              <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=300&h=200&fit=crop" alt="Lab" className="h-full w-full object-cover" />
            </div>
            
            {/* Middle-Right Photo */}
            <div className="absolute right-[10%] top-[-20px] h-[160px] w-[220px] rotate-[2deg] overflow-hidden rounded-[var(--radius-lg)] shadow-2xl z-20 border border-white/10">
              <img src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300&h=200&fit=crop" alt="Clinical" className="h-full w-full object-cover" />
            </div>

            {/* Bottom-Left Photo */}
            <div className="absolute bottom-[-30px] right-[25%] h-[120px] w-[160px] rotate-[6deg] overflow-hidden rounded-[var(--radius-lg)] shadow-lg z-30 border border-white/10">
              <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop" alt="Equipment" className="h-full w-full object-cover" />
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
        <div className="flex justify-end text-[14px] text-[var(--color-text-muted)] mb-[32px] md:mb-auto">
          Already have an account?{" "}
          <Link to="/login" className="ml-1 font-medium text-[var(--color-lime-dark)] hover:text-[var(--color-forest)] transition-colors">
            Sign in
          </Link>
        </div>

        {/* Form Container */}
        <div className="mx-auto w-full max-w-[420px] my-auto py-8">
          
          <h1 className="mb-2 font-serif text-[32px] font-semibold text-[var(--color-forest)]">Create your account.</h1>
          <p className="mb-[32px] font-sans text-[15px] text-[var(--color-text-muted)]">Join thousands already taking control of their health.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[20px]">
            
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" placeholder="John" {...register("firstName")} data-error={!!errors.firstName} />
                {errors.firstName && (
                  <div className="mt-[4px] flex items-center gap-1 font-sans text-[12px] text-[var(--color-danger)]">
                    <AlertCircle className="h-[14px] w-[14px]" /> <span>{errors.firstName.message}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Doe" {...register("lastName")} data-error={!!errors.lastName} />
                {errors.lastName && (
                  <div className="mt-[4px] flex items-center gap-1 font-sans text-[12px] text-[var(--color-danger)]">
                    <AlertCircle className="h-[14px] w-[14px]" /> <span>{errors.lastName.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="name@example.com" {...register("email")} data-error={!!errors.email} />
              {errors.email && (
                <div className="mt-[4px] flex items-center gap-1 font-sans text-[12px] text-[var(--color-danger)]">
                  <AlertCircle className="h-[14px] w-[14px]" /> <span>{errors.email.message}</span>
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" placeholder="+233 556893894" {...register("phone")} data-error={!!errors.phone} />
              {errors.phone && (
                <div className="mt-[4px] flex items-center gap-1 font-sans text-[12px] text-[var(--color-danger)]">
                  <AlertCircle className="h-[14px] w-[14px]" /> <span>{errors.phone.message}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password">Password</Label>
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
              
              {/* Strength Indicator */}
              {passwordValue.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4].map(level => (
                      <div 
                        key={level} 
                        className={cn(
                          "h-full flex-1 rounded-full transition-colors duration-300",
                          strength.score >= level ? strength.color : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                  <div className="mt-1 flex justify-end">
                    <span className={cn("font-sans text-[11px] font-semibold", strength.color.replace('bg-', 'text-'))}>
                      {strength.label}
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <div className="mt-[4px] flex items-center gap-1 font-sans text-[12px] text-[var(--color-danger)]">
                  <AlertCircle className="h-[14px] w-[14px]" /> <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  data-error={!!errors.confirmPassword}
                  className="pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="mt-[4px] flex items-center gap-1 font-sans text-[12px] text-[var(--color-danger)]">
                  <AlertCircle className="h-[14px] w-[14px]" /> <span>{errors.confirmPassword.message}</span>
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 mt-2">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1 h-[18px] w-[18px] rounded-[4px] border-[1.5px] border-[var(--color-border)] accent-[var(--color-forest)] focus:ring-[3px] focus:ring-[rgba(26,58,42,0.08)]"
                required
              />
              <Label htmlFor="terms" className="mb-0 font-sans text-[13px] font-normal leading-[1.5] text-[var(--color-text-secondary)]">
                I agree to the <a href="#" className="font-medium text-[var(--color-forest)] hover:underline">Terms of Service</a> and <a href="#" className="font-medium text-[var(--color-forest)] hover:underline">Privacy Policy</a>
              </Label>
            </div>

            {/* API Error Alert */}
            {apiError && (
              <div className="mt-2 flex items-start gap-[8px] rounded-[var(--radius-md)] border border-[#FECACA] bg-[#FEF2F2] px-[16px] py-[12px]">
                <AlertCircle className="mt-[2px] h-[16px] w-[16px] shrink-0 text-[var(--color-danger)]" />
                <span className="font-sans text-[14px] text-[var(--color-danger)]">{apiError}</span>
              </div>
            )}

            {/* Submit */}
            <Button type="submit" className="mt-4 h-[52px] w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

        </div>
        
        {/* Empty bottom spacer */}
        <div className="mt-auto"></div>
      </div>
    </div>
  )
}
