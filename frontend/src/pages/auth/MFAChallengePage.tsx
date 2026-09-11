import { useState, useEffect } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { authService } from "@/api/services/auth"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import toast from "react-hot-toast"
import { Loader2, AlertCircle, ShieldCheck, CheckCircle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export function MFAChallengePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  // State from location
  const [token] = useState<string | null>(location.state?.token || null)
  const [setupRequired] = useState<boolean>(location.state?.setupRequired || false)

  // Local state
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  
  // Setup state
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isSetupComplete, setIsSetupComplete] = useState(false)

  // Redirect if no token is found in state
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true })
    }
  }, [token, navigate])

  // Fetch QR Code if setup is required
  useEffect(() => {
    async function initSetup() {
      if (setupRequired && token && !otpauthUrl) {
        try {
          setIsLoading(true)
          const response = await authService.setupMfa()
          setOtpauthUrl(response.otpauthUrl)
        } catch (error: any) {
          setApiError(error.response?.data?.message || "Failed to initialize MFA setup.")
        } finally {
          setIsLoading(false)
        }
      }
    }
    initSetup()
  }, [setupRequired, token, otpauthUrl])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !token) return

    try {
      setIsLoading(true)
      setApiError(null)

      if (setupRequired && !isSetupComplete) {
        // Step 1: Verify the setup code
        const response = await authService.verifyMfaSetup(code)
        setBackupCodes(response.backupCodes)
        setIsSetupComplete(true)
        toast.success("MFA Setup Successful!")
      } else {
        // Step 2: Normal Login Verification
        const response = await authService.verifyMfaLogin(token, code)
        setAuth(response.user, response.accessToken)
        toast.success("Welcome back!")
        navigate("/dashboard")
      }
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Invalid code. Please try again.")
    } finally {
      setIsLoading(false)
      setCode("")
    }
  }

  const handleContinueToDashboard = async () => {
    // If setup is complete, we need to call login verification to get the final token
    // But since the setup route requires authentication, it means they are somewhat logged in?
    // Wait, the backend requires calling `verifyMfaLogin` even after setup to issue the session.
    // Wait, verifyMfaSetup does not return a session, it just enables MFA.
    // Let's call verifyMfaLogin with the original token to get the real session.
    
    // Oh wait, I don't have the code anymore. Let me ask the user to login again, 
    // or call it immediately if I have it. Actually, `verifyMfaLogin` requires the `code`.
    // It's safer to just redirect to login so they can use their newly setup authenticator.
    toast.success("Please log in with your new authenticator app.")
    navigate("/login", { replace: true })
  }

  const handleResendCode = async () => {
    if (!token) return
    try {
      setIsResending(true)
      setApiError(null)
      await authService.resendMfaCode(token)
      toast.success("A new code has been sent to your email.")
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Failed to resend code.")
    } finally {
      setIsResending(false)
    }
  }

  if (!token) return null

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          LEFT PANEL (Visual)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-[var(--color-forest)] p-[48px] lg:flex sticky top-0 h-screen">
        <div>
          <Link to="/" className="inline-flex items-center rounded-xl bg-white px-3 py-1.5 shadow-md transition-transform duration-150 hover:scale-[1.02]">
            <img src="/logo.jpeg" alt="CareBis Prime" className="h-[36px] w-auto object-contain" />
          </Link>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center">
          <ShieldCheck className="h-[120px] w-[120px] text-[var(--color-lime)] opacity-90 mb-[32px]" />
          <p className="mb-[64px] max-w-[380px] text-center font-serif text-[36px] italic leading-[1.4] text-white">
            "Security is our top priority."
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

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          RIGHT PANEL (Form)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex w-full flex-col bg-[var(--color-white)] lg:w-[52%] min-h-screen overflow-y-auto px-[24px] py-[32px] md:px-[64px] md:py-[48px]">
        
        <div className="flex justify-end text-[14px] text-[var(--color-text-muted)] mb-auto">
          <Link to="/login" className="font-medium text-[var(--color-lime-dark)] hover:text-[var(--color-forest)] transition-colors">
            Back to login
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[400px] my-auto py-12">
          
          {setupRequired && !isSetupComplete ? (
            <>
              <h1 className="mb-2 font-serif text-[32px] font-semibold text-[var(--color-forest)]">Setup Authenticator</h1>
              <p className="mb-[32px] font-sans text-[15px] text-[var(--color-text-muted)]">
                Scan the QR code below with Google Authenticator or Authy to secure your account.
              </p>

              {otpauthUrl ? (
                <div className="flex justify-center mb-[32px] p-[24px] bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)]">
                  <QRCodeSVG value={otpauthUrl} size={200} />
                </div>
              ) : (
                <div className="flex justify-center mb-[32px] py-[40px]">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
                </div>
              )}
            </>
          ) : setupRequired && isSetupComplete ? (
            <>
              <h1 className="mb-2 font-serif text-[32px] font-semibold text-[var(--color-forest)]">Save Backup Codes</h1>
              <p className="mb-[24px] font-sans text-[15px] text-[var(--color-text-muted)]">
                Store these recovery codes in a secure place. They can be used to access your account if you lose your device.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-[32px] p-[24px] bg-[var(--color-surface-2)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                {backupCodes.map((bc, i) => (
                  <code key={i} className="text-[13px] font-mono text-[var(--color-text-primary)] font-semibold tracking-wider bg-white px-2 py-1 rounded text-center">
                    {bc}
                  </code>
                ))}
              </div>

              <Button onClick={handleContinueToDashboard} className="w-full h-[52px]">
                I have saved my backup codes
              </Button>
            </>
          ) : (
            <>
              <h1 className="mb-2 font-serif text-[32px] font-semibold text-[var(--color-forest)]">Two-Factor Authentication</h1>
              <p className="mb-[32px] font-sans text-[15px] text-[var(--color-text-muted)]">
                Enter the 6-digit code sent to your email, or from your authenticator app.
              </p>
            </>
          )}

          {(!setupRequired || (setupRequired && !isSetupComplete)) && (
            <form onSubmit={handleVerify} className="flex flex-col gap-[20px]">
              <div>
                <Label htmlFor="code">Authentication Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono text-[18px] tracking-[0.2em] h-[56px] text-center mt-2"
                  maxLength={10}
                  autoComplete="one-time-code"
                />
              </div>

              {apiError && (
                <div className="flex items-start gap-[8px] rounded-[var(--radius-md)] border border-[#FECACA] bg-[#FEF2F2] px-[16px] py-[12px]">
                  <AlertCircle className="mt-[2px] h-[16px] w-[16px] shrink-0 text-[var(--color-danger)]" />
                  <span className="font-sans text-[14px] text-[var(--color-danger)]">{apiError}</span>
                </div>
              )}

              <Button type="submit" className="mt-2 h-[52px] w-full" disabled={isLoading || code.length < 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
              <div className="flex justify-center mt-2">
                <Button type="button" variant="ghost" onClick={handleResendCode} disabled={isResending || isLoading} className="text-[var(--color-lime-dark)] hover:text-[var(--color-forest)]">
                  {isResending ? "Sending..." : "Resend Email Code"}
                </Button>
              </div>
            </form>
          )}

        </div>
        
        <div className="mt-auto"></div>
      </div>
    </div>
  )
}
