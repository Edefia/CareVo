import { useState } from "react"
import { Search, Download, ArrowUpRight, DollarSign, AlertCircle, CheckCircle2, Loader2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatCard } from "@/components/shared/StatCard"
import { useBillingStats, useInvoices, useVerifyPayment, useRecordManualPayment } from "@/hooks/useBilling"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function AdminPayments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [page, setPage] = useState(1)
  
  // Manual Payment State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [referenceNote, setReferenceNote] = useState("")

  const { data: statsResponse, isLoading: statsLoading } = useBillingStats()
  const { data: invoicesResponse, isLoading: invoicesLoading, refetch: refetchInvoices } = useInvoices({
    page,
    limit: 20,
    status: filterStatus !== "ALL" ? filterStatus : undefined,
  })

  const verifyMutation = useVerifyPayment()
  const manualPaymentMutation = useRecordManualPayment()

  const stats = statsResponse?.data || statsResponse
  const invoicesData = invoicesResponse?.data || invoicesResponse
  const invoices = invoicesData?.items || invoicesData?.data || (Array.isArray(invoicesData) ? invoicesData : [])

  const handleVerify = async (id: string) => {
    try {
      await verifyMutation.mutateAsync(id)
      toast.success("Payment status verified")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to verify payment")
    }
  }

  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoiceId) return
    try {
      await manualPaymentMutation.mutateAsync({
        id: selectedInvoiceId,
        paymentMethod,
        referenceNote
      })
      toast.success("Manual payment recorded")
      setSelectedInvoiceId(null)
      setReferenceNote("")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record manual payment")
    }
  }

  // Client-side filtering for search term
  const filteredInvoices = invoices.filter((inv: any) => 
    searchTerm === "" || 
    (inv.patientId?.userId?.firstName && inv.patientId.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.patientId?.userId?.lastName && inv.patientId.userId.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv._id && inv._id.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch(status) {
      case "PAID": return "text-emerald-600 bg-emerald-50 border-emerald-200"
      case "PENDING": return "text-amber-600 bg-amber-50 border-amber-200"
      case "CANCELLED": return "text-red-600 bg-red-50 border-red-200"
      case "REFUNDED": return "text-blue-600 bg-blue-50 border-blue-200"
      default: return "text-slate-600 bg-slate-50 border-slate-200"
    }
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1400px] mx-auto pb-[96px] animate-in fade-in duration-500">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAGE HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[24px]">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Payment Management
          </h1>
          <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">
            Recover, record, and monitor all financial transactions across CareVo.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-[44px] flex items-center gap-2">
            <Download className="h-4 w-4" /> Export Ledger
          </Button>
          <Button onClick={() => refetchInvoices()} variant="outline" className="h-[44px] flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OVERVIEW CARDS (KPIs)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[24px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[140px] rounded-xl" />)
        ) : (
          <>
            <StatCard
              title="Total Revenue (All Time)"
              value={`GHS ${stats?.totalRevenue?.toLocaleString() || '0'}`}
              icon={DollarSign}
              description={`Across ${stats?.totalInvoices || 0} invoices`}
              className="border-t-4 border-t-emerald-500"
            />
            <StatCard
              title="Monthly Revenue"
              value={`GHS ${stats?.monthlyRevenue?.toLocaleString() || '0'}`}
              icon={ArrowUpRight}
              description="Current month"
              className="border-t-4 border-t-blue-500"
            />
            <StatCard
              title="Pending Payments"
              value={`GHS ${stats?.pendingAmount?.toLocaleString() || '0'}`}
              icon={AlertCircle}
              description={`Across ${stats?.pendingCount || 0} invoices`}
              className="border-t-4 border-t-amber-500"
            />
            <StatCard
              title="Overdue Invoices"
              value={stats?.overdueCount?.toString() || '0'}
              icon={CheckCircle2}
              description="Older than 30 days"
              className="border-t-4 border-t-red-500"
            />
          </>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAYMENT LEDGER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Card className="shadow-[var(--shadow-card)] border-[var(--color-border)]">
        <CardHeader className="pb-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="font-serif text-xl text-[var(--color-forest)]">Transaction Ledger</CardTitle>
            <div className="flex items-center gap-2">
              <form 
                className="relative w-full md:w-80"
                onSubmit={(e) => {
                  e.preventDefault()
                  setPage(1)
                }}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by Client Name or ID..." 
                  className="pl-9 h-10 border-slate-200 focus-visible:ring-[var(--color-forest)]/20" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
              <div className="flex gap-1 border border-slate-200 rounded-md p-1 bg-slate-50/50 overflow-x-auto max-w-[calc(100vw-32px)]">
                {["ALL", "PAID", "PENDING", "CANCELLED", "REFUNDED"].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => { setFilterStatus(status); setPage(1); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                      filterStatus === status 
                        ? 'bg-white shadow-sm text-slate-900 border border-slate-200/50' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {invoicesLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
          ) : (
            <>
              <DataTable 
                columns={[
                  { 
                    header: "Transaction ID", 
                    cell: (row: any) => <span className="font-mono text-xs text-slate-500">{row._id?.substring(0, 8)}</span> 
                  },
                  { 
                    header: "Client", 
                    cell: (row: any) => (
                      <div>
                        <div className="font-semibold text-[14px] text-slate-900">{row.patientId?.userId?.firstName} {row.patientId?.userId?.lastName}</div>
                        <div className="text-[12px] text-slate-500">{row.patientId?.userId?.email}</div>
                      </div>
                    ) 
                  },
                  { header: "Description", cell: (row: any) => <span className="text-[13px]">{row.description}</span> },
                  { 
                    header: "Amount", 
                    cell: (row: any) => <span className="font-semibold text-slate-900">GHS {(row.amount / 100).toLocaleString()}</span>
                  },
                  { header: "Gateway", cell: (row: any) => <span className="text-[13px]">{row.paymentGateway || 'N/A'}</span> },
                  { header: "Date Issued", cell: (row: any) => new Date(row.createdAt).toLocaleDateString() },
                  { 
                    header: "Status", 
                    cell: (row: any) => (
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    )
                  },
                  { 
                    header: "Actions", 
                    cell: (row: any) => (
                      <div className="flex gap-2">
                        {row.status === 'PENDING' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleVerify(row._id)}
                              disabled={verifyMutation.isPending}
                            >
                              Verify Moolre
                            </Button>
                            
                            <Dialog open={selectedInvoiceId === row._id} onOpenChange={(open) => !open && setSelectedInvoiceId(null)}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                  onClick={() => setSelectedInvoiceId(row._id)}
                                >
                                  Record Offline
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Record Offline Payment</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleManualPayment} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <select 
                                      className="w-full h-10 border border-slate-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/20"
                                      value={paymentMethod}
                                      onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                      <option value="CASH">Cash</option>
                                      <option value="BANK_TRANSFER">Bank Transfer</option>
                                      <option value="POS">Point of Sale (POS)</option>
                                    </select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Reference Note</Label>
                                    <Input 
                                      placeholder="e.g. Received by Jane, Receipt #1023" 
                                      value={referenceNote}
                                      onChange={(e) => setReferenceNote(e.target.value)}
                                    />
                                  </div>
                                  <Button type="submit" className="w-full" disabled={manualPaymentMutation.isPending}>
                                    {manualPaymentMutation.isPending ? "Recording..." : "Confirm Payment"}
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    )
                  },
                ]}
                data={filteredInvoices}
              />

              {/* Pagination Controls */}
              {invoicesData?.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-gray-50/50">
                  <div className="text-sm text-slate-500">
                    Page {page} of {invoicesData.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.min(invoicesData.totalPages, p + 1))}
                      disabled={page === invoicesData.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
