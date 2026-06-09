import { useState } from "react"
import { ArrowLeft, CreditCard, DollarSign, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate, useParams } from "react-router-dom"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function PaymentTerminal() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [paymentMethod, setPaymentMethod] = useState("MOBILE_MONEY")
  const [isProcessing, setIsProcessing] = useState(false)

  const mockInvoice = {
    id: id || "INV-2023-001",
    patient: "Kwame Mensah",
    package: "Basic Wellness Package",
    date: "2023-10-25",
    amount: "150.00",
    status: "PENDING"
  }

  const handlePayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      navigate('/billing')
    }, 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Process Payment</h2>
          <p className="text-muted-foreground">Invoice {mockInvoice.id}</p>
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
              <div className="font-medium">{mockInvoice.patient}</div>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <div className="font-medium">{mockInvoice.package}</div>
                <div className="text-sm text-muted-foreground">Service Date: {mockInvoice.date}</div>
              </div>
              <div className="font-medium text-lg">GHS {mockInvoice.amount}</div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div className="font-bold text-lg">Total Due</div>
              <div className="font-bold text-2xl text-primary">GHS {mockInvoice.amount}</div>
            </div>
            
            <div className="pt-4">
              <div className="text-sm text-muted-foreground mb-2">Current Status</div>
              <StatusBadge status={mockInvoice.status} />
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
                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'MOBILE_MONEY' ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-muted'}`}
                onClick={() => setPaymentMethod('MOBILE_MONEY')}
              >
                <Smartphone className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium text-center">Mobile Money</span>
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
                <span className="text-sm font-medium">Card</span>
              </div>
            </div>

            {paymentMethod === 'MOBILE_MONEY' && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="space-y-2">
                  <Label>Network Provider</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option>MTN MoMo</option>
                    <option>Telecel Cash</option>
                    <option>AT Money</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="e.g. 024 123 4567" />
                </div>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="space-y-2">
                  <Label>Amount Tendered (GHS)</Label>
                  <Input type="number" placeholder="0.00" defaultValue={mockInvoice.amount} />
                </div>
              </div>
            )}

          </CardContent>
          <CardFooter className="bg-muted/50 border-t p-6">
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Confirm Payment of GHS ${mockInvoice.amount}`}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
