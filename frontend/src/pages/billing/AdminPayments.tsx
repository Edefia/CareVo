import { useState } from "react"
import { Search, Filter, Download, ArrowUpRight, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatCard } from "@/components/shared/StatCard"

export function AdminPayments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")

  // Mock Payments Data
  const payments = [
    { id: "PAY-1045", client: "Sarah Jenkins", amount: 450, status: "PAID", date: "2026-06-16T10:30:00Z", method: "Credit Card" },
    { id: "PAY-1046", client: "James Wilson", amount: 250, status: "PENDING", date: "2026-06-16T11:15:00Z", method: "Mobile Money" },
    { id: "PAY-1047", client: "Ama Ofori", amount: 150, status: "OVERDUE", date: "2026-06-10T09:00:00Z", method: "Bank Transfer" },
    { id: "PAY-1048", client: "Kwame Mensah", amount: 600, status: "PAID", date: "2026-06-15T14:20:00Z", method: "Credit Card" },
    { id: "PAY-1049", client: "MediScan Ghana", amount: 1200, status: "RECOVERED", date: "2026-06-12T08:45:00Z", method: "Bank Transfer" },
  ]

  const filteredPayments = payments.filter(p => 
    (filterStatus === "ALL" || p.status === filterStatus) &&
    (p.client.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch(status) {
      case "PAID": return "text-emerald-600 bg-emerald-50 border-emerald-200"
      case "PENDING": return "text-amber-600 bg-amber-50 border-amber-200"
      case "OVERDUE": return "text-red-600 bg-red-50 border-red-200"
      case "RECOVERED": return "text-blue-600 bg-blue-50 border-blue-200"
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
          <Button className="h-[44px] bg-[var(--color-forest)] hover:bg-[var(--color-forest)]/90">
            Record Offline Payment
          </Button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OVERVIEW CARDS (KPIs)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[24px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue (YTD)"
          value="$1,245,000"
          icon={DollarSign}
          description="+15% vs last year"
          className="border-t-4 border-t-emerald-500"
        />
        <StatCard
          title="Outstanding Payments"
          value="$12,450"
          icon={AlertCircle}
          description="Across 45 invoices"
          className="border-t-4 border-t-red-500"
        />
        <StatCard
          title="Recovered Funds"
          value="$8,200"
          icon={CheckCircle2}
          description="Recovered this month"
          className="border-t-4 border-t-blue-500"
        />
        <StatCard
          title="Processing Fees"
          value="$15,420"
          icon={ArrowUpRight}
          description="1.2% effective rate"
          className="border-t-4 border-t-violet-500"
        />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAYMENT LEDGER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Card className="shadow-[var(--shadow-card)] border-[var(--color-border)]">
        <CardHeader className="pb-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="font-serif text-xl text-[var(--color-forest)]">Transaction Ledger</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by ID or Client Name..." 
                  className="pl-9 h-10 border-slate-200 focus-visible:ring-[var(--color-forest)]/20" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-1 border border-slate-200 rounded-md p-1 bg-slate-50/50">
                {["ALL", "PAID", "PENDING", "OVERDUE", "RECOVERED"].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
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
          <DataTable 
            columns={[
              { header: "Transaction ID", accessorKey: "id" },
              { header: "Client / Entity", accessorKey: "client" },
              { 
                header: "Amount", 
                cell: (row) => <span className="font-semibold text-slate-900">${row.amount.toLocaleString()}</span>
              },
              { header: "Method", accessorKey: "method" },
              { header: "Date", cell: (row) => new Date(row.date).toLocaleDateString() },
              { 
                header: "Status", 
                cell: (row) => (
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                )
              },
              { 
                header: "Actions", 
                cell: (row) => (
                  <div className="flex gap-2">
                    {row.status === 'OVERDUE' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
                        Initiate Recovery
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500 hover:text-slate-900">
                      View Receipt
                    </Button>
                  </div>
                )
              },
            ]}
            data={filteredPayments}
          />
        </CardContent>
      </Card>
    </div>
  )
}
