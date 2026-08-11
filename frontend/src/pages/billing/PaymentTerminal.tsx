import { useState } from "react"
import { ArrowLeft, CreditCard, DollarSign, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { LoadingState } from "@/components/shared/LoadingState"
import { useNavigate, useParams } from "react-router-dom"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useInvoice, useInitiatePayment, useRecordManualPayment } from "@/hooks/useBilling"
import { usePaystack } from "@/hooks/usePaystack"
import toast from "react-hot-toast"

export function PaymentTerminal() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [paymentMethod, setPaymentMethod] = useState("PAYSTACK")
  const [email, setEmail] = useState("")
  const [referenceNote, setReferenceNote] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { data: invoiceData, isLoading } = useInvoice(id as string)
  const initiatePayment = useInitiatePayment()
  const manualPayment = useRecordManualPayment()
  const { openPaystack, isReady } = usePaystack()

  const invoice = invoiceData?.data || invoiceData
  
  const handlePayment = async () => {
    if (paymentMethod === "PAYSTACK") {
      if (!isReady) {
        toast.error("Payment system is loading. Please try again.")
        return
      }

      setIsProcessing(true)
      try {
        const patientEmail = email || invoice.patientId?.userId?.email || "patient@example.com"
        
        // 1. Initialize on backend
        const response = await initiatePayment.mutateAsync({ 
          id: id as string, 
          email: patientEmail,
          callbackUrl: window.location.href,
        })
        
        const { reference } = response.data || response

        // 2. Open Paystack popup for the patient to pay at the terminal
        openPaystack({
          publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder",
          email: patientEmail,
          amount: invoice.amount, // Already in pesewas
          reference: reference,
          onSuccess: () => {
            toast.success("Online payment successful!")
            setIsProcessing(false)
            setTimeout(() => navigate('/billing'), 2000)
          },
          onClose: () => {
            toast.error("Payment window closed.")
            setIsProcessing(false)
          }
        })
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Payment initiation failed. Please try again.")
        setIsProcessing(false)
      }
    } else {
      // CASH or CARD manual recording
      setIsProcessing(true)
      try {
        await manualPayment.mutateAsync({
          id: id as string,
          paymentMethod,
          referenceNote
        })
        toast.success(`Manual ${paymentMethod.toLowerCase()} payment recorded successfully.`)
        navigate('/billing')
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to record manual payment.")
        setIsProcessing(false)
      }
    }
  }

  if (isLoading) return <LoadingState message="Loading payment details..." fullScreen />
  if (!invoice) return <div>Invoice not found</div>

  const displayAmount = invoice.amount / 100

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Process Payment</h2>
          <p className="text-muted-foreground">Invoice {invoice._id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Patient</div>
              <div className="font-medium">{invoice.patientId?.userId ? `${invoice.patientId.userId.firstName} ${invoice.patientId.userId.lastName}` : "Unknown"}</div>
              <div className="text-sm text-muted-foreground">{invoice.patientId?.userId?.email || "No email"}</div>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <div className="font-medium">Services</div>
                <div className="text-sm text-muted-foreground">{invoice.description}</div>
                <div className="text-sm text-muted-foreground mt-1">Date: {new Date(invoice.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="font-medium text-lg">GHS {displayAmount.toFixed(2)}</div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div className="font-bold text-lg">Total Due</div>
              <div className="font-bold text-2xl text-primary">GHS {displayAmount.toFixed(2)}</div>
            </div>
            
            <div className="pt-4">
              <div className="text-sm text-muted-foreground mb-2">Current Status</div>
              <StatusBadge status={invoice.status} />
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select how the patient is paying.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-3 gap-3">
              <div 
                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'PAYSTACK' ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-muted'}`}
                onClick={() => setPaymentMethod('PAYSTACK')}
              >
                <ExternalLink className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium text-center">Paystack (Online)</span>
              </div>
              <div 
                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'CASH' ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-muted'}`}
                onClick={() => setPaymentMethod('CASH')}
              >
                <DollarSign className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Cash</span>
              </div>
              <div 
                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'CARD' ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-muted'}`}
                onClick={() => setPaymentMethod('CARD')}
              >
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">POS Card</span>
              </div>
            </div>

            {paymentMethod === 'PAYSTACK' && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                  This will open the Paystack secure checkout popup for the patient to pay via Mobile Money, Card, or Bank Transfer right here on the terminal.
                </div>
                <div className="space-y-2">
                  <Label>Patient Email (For Receipt)</Label>
                  <Input 
                    placeholder="Enter email (optional)" 
                    defaultValue={invoice.patientId?.userId?.email || ""}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(paymentMethod === 'CASH' || paymentMethod === 'CARD') && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="space-y-2">
                  <Label>Amount Tendered (GHS)</Label>
                  <Input type="number" placeholder="0.00" value={displayAmount.toFixed(2)} readOnly className="bg-slate-50" />
                  <p className="text-xs text-muted-foreground mt-1">This amount will be marked as paid offline.</p>
                </div>
                <div className="space-y-2">
                  <Label>Reference Note</Label>
                  <Input 
                    placeholder="Receipt # or transaction note" 
                    value={referenceNote}
                    onChange={(e) => setReferenceNote(e.target.value)}
                  />
                </div>
              </div>
            )}

          </CardContent>
          <CardFooter className="bg-muted/50 border-t p-6">
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handlePayment}
              disabled={isProcessing || invoice.status === 'PAID'}
            >
              {isProcessing ? "Processing..." : paymentMethod === 'PAYSTACK' ? `Open Payment Terminal (GHS ${displayAmount.toFixed(2)})` : `Record Payment of GHS ${displayAmount.toFixed(2)}`}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
