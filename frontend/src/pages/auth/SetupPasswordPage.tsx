import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { authService } from "@/api/services/auth"

const setupPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type SetupPasswordForm = z.infer<typeof setupPasswordSchema>

export function SetupPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupPasswordForm>({
    resolver: zodResolver(setupPasswordSchema),
  })

  async function onSubmit(data: SetupPasswordForm) {
    if (!token) {
      toast.error("Invalid setup token");
      return;
    }
    
    setIsLoading(true)
    try {
      await authService.resetPassword({ token, password: data.password });
      toast.success("Password setup successfully! Please login.")
      navigate("/login")
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to setup password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(126,232,162,0.15)]">
          <Lock className="h-6 w-6 text-[var(--color-forest)]" />
        </div>
        <CardTitle className="font-serif text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Setup Your Password
        </CardTitle>
        <CardDescription className="text-sm font-medium text-[var(--color-text-secondary)]">
          Welcome! Please set a secure password for your new account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="h-11 pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-[var(--color-danger)]">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              className="h-11"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-[var(--color-danger)]">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="h-11 w-full bg-[var(--color-forest)] text-[15px] font-semibold hover:bg-[var(--color-forest)]/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Complete Setup
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
