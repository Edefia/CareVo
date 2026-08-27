import { useState } from "react"
import { Receipt, CreditCard, Clock, FileText, ArrowUpRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useInvoices, useInitiatePayment } from "@/hooks/useBilling"
import { usePaystack } from "@/hooks/usePaystack"
import { useAuthStore } from "@/store/auth"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { LoadingState } from "@/components/shared/LoadingState"
import toast from "react-hot-toast"

export function ClientBilling() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: billingData, isLoading } = useInvoices()
  const { mutateAsync: initiatePayment } = useInitiatePayment()
  const { openPaystack, isReady } = usePaystack()
  
  const [processingId, setProcessingId] = useState<string | null>(null)

  const invoices = billingData?.items || billingData || []

  // Sort invoices by date, newest first, but put PENDING first
  const sortedInvoices = Array.isArray(invoices) ? [...invoices].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) : []

  const handlePayNow = async (invoice: any) => {
    if (!isReady) {
      toast.error("Payment system is loading. Please try again in a moment.")
      return
    }

    setProcessingId(invoice._id || invoice.id)
    try {
      // 1. Initialize payment on backend
      const response = await initiatePayment({
        id: invoice._id || invoice.id,
        email: user?.email || "patient@example.com",
        callbackUrl: window.location.href, // If redirect is needed
      })

      const { reference } = response.data || response

      // 2. Open Paystack popup
      openPaystack({
        // For production, this should come from your environment config
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder",
        email: user?.email || "patient@example.com",
        amount: invoice.amount, // Already in pesewas
        reference: reference,
        onSuccess: () => {
          toast.success("Payment successful! Your invoice is being updated.")
          setProcessingId(null)
          // The webhook will handle the actual status update, but we can optimistically invalidate
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        },
        onClose: () => {
          toast.error("Payment window closed.")
          setProcessingId(null)
        }
      })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to initialize payment")
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return <LoadingState message="Fetching your invoices..." />
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-forest)]">Billing & Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage your payments and view transaction history.</p>
        </div>
      </div>

      {sortedInvoices.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No invoices found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You don't have any billing history yet. When you book a screening, your invoices will appear here.
            </p>
            <Button onClick={() => navigate('/client/bookings/new')} size="lg">
              Book a Screening
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedInvoices.map((invoice: any) => {
            const isPending = invoice.status === "PENDING"
            const isProcessing = processingId === (invoice._id || invoice.id)
            
            return (
              <Card key={invoice._id || invoice.id} className={`overflow-hidden transition-all ${isPending ? 'border-[var(--color-lime-dark)] ring-1 ring-[var(--color-lime-dark)]/20 shadow-md' : 'hover:shadow-md'}`}>
                <CardContent className="p-0 sm:flex items-center">
                  
                  {/* Left Section - Icon & Basic Details */}
                  <div className="p-6 flex-1 flex items-start gap-4">
                    <div className={`shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${isPending ? 'bg-[var(--color-lime-dark)]/10 text-[var(--color-lime-dark)]' : 'bg-slate-100 text-slate-500'}`}>
                      {isPending ? <CreditCard className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg text-slate-900">Invoice #{invoice._id?.substring(0, 8).toUpperCase()}</h3>
                        <StatusBadge status={invoice.status} />
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Issued on {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                      
                      {invoice.items && invoice.items.length > 0 && (
                        <div className="mt-3 text-sm text-slate-600 bg-slate-50 p-2 rounded border inline-block">
                          {invoice.items[0].description} {invoice.items.length > 1 ? `+ ${invoice.items.length - 1} more items` : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Amount & Action */}
                  <div className={`p-6 sm:w-64 flex flex-col justify-center sm:items-end border-t sm:border-t-0 sm:border-l ${isPending ? 'bg-[var(--color-surface-2)]/50' : ''}`}>
                    <div className="text-left sm:text-right mb-4">
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                      <div className="font-serif text-xl font-bold text-[var(--color-forest)]">GH₵{(invoice.amount / 100).toFixed(2)}</div>
                    </div>
                    
                    {isPending ? (
                      <Button 
                        onClick={() => handlePayNow(invoice)}
                        disabled={isProcessing || !isReady}
                        className="w-full shadow-md gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>Pay Now <ArrowUpRight className="h-4 w-4" /></>
                        )}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full gap-2 text-green-700 border-green-200 bg-green-50 hover:bg-green-100">
                        <CheckCircle2 className="h-4 w-4" /> Paid
                      </Button>
                    )}
                  </div>

                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
