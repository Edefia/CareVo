import { Users, Copy, CheckCircle2, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth"
import { useState } from "react"

export function ClientReferrals() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  
  // Dummy referral code, in a real app this would come from user profile
  const referralCode = (user as any)?.referralCode || "CAREBIS_PRIME50"

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-forest)]">Refer a Friend</h1>
          <p className="text-muted-foreground mt-1">Share the gift of health and earn rewards.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-[var(--color-lime-dark)]/20 shadow-md">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-[var(--color-lime-dark)]/10 flex items-center justify-center mb-6">
              <Gift className="h-8 w-8 text-[var(--color-forest)]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Give GH₵50, Get GH₵50</h2>
            <p className="text-slate-600 mb-8 max-w-sm">
              Share your unique referral code with friends and family. They get GH₵50 off their first comprehensive screening, and you get a GH₵50 credit!
            </p>
            
            <div className="w-full max-w-xs">
              <p className="text-sm font-medium text-slate-500 mb-2 text-left uppercase tracking-wider">Your Referral Code</p>
              <div className="flex items-center">
                <div className="bg-slate-100 border border-slate-200 rounded-l-md px-4 py-3 font-mono font-bold text-lg text-slate-800 flex-1 text-center">
                  {referralCode}
                </div>
                <Button 
                  onClick={handleCopy}
                  className="rounded-l-none h-auto py-3 px-6 bg-[var(--color-forest)] hover:bg-[var(--color-forest)]/90"
                >
                  {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-400" />
                Your Referrals
              </h3>
              
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-slate-100 rounded-lg">
                <p className="text-slate-500 mb-1">You haven't referred anyone yet.</p>
                <p className="text-sm text-slate-400">Share your code to start earning rewards!</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-[var(--color-forest)] text-white">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">How it works</h3>
              <ul className="space-y-3 mt-4 text-sm text-white/80">
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[var(--color-lime)] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                  <p>Share your code with friends, family, or colleagues.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[var(--color-lime)] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                  <p>They use your code during booking to receive GH₵50 off.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[var(--color-lime)] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                  <p>Once their screening is complete, you receive a GH₵50 credit applied to your next booking.</p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
