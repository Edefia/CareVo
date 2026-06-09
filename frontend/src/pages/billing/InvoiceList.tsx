import { useState } from "react"
import { Search, Filter, Download, DollarSign, Receipt, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"

const mockInvoices = [
  { id: "INV-2023-001", patient: "Kwame Mensah", date: "2023-10-25", amount: "GHS 150.00", status: "PENDING" },
  { id: "INV-2023-002", patient: "Ama Osei", date: "2023-10-25", amount: "GHS 350.00", status: "PAID" },
  { id: "INV-2023-003", patient: "John Doe", date: "2023-10-24", amount: "GHS 80.00", status: "PAID" },
  { id: "INV-2023-004", patient: "Jane Smith", date: "2023-10-24", amount: "GHS 150.00", status: "OVERDUE" },
]

export function InvoiceList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInvoices = mockInvoices.filter(i => 
    i.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing & Invoices</h2>
          <p className="text-muted-foreground">Manage payments and financial records.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS 24,500.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">GHS 3,200.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">4</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Invoices</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search invoices..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={[
              { header: "Invoice ID", accessorKey: "id" },
              { header: "Patient", accessorKey: "patient" },
              { header: "Date", accessorKey: "date" },
              { header: "Amount", accessorKey: "amount" },
              { 
                header: "Status", 
                cell: (row) => <StatusBadge status={row.status} />
              },
              { 
                header: "Actions", 
                cell: (row) => (
                  <div className="flex gap-2">
                    {row.status === "PENDING" && (
                      <Button size="sm" onClick={() => navigate(`/billing/pay/${row.id}`)}>
                        Process Payment
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" title="Download PDF">
                      <Download className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                )
              },
            ]}
            data={filteredInvoices}
          />
        </CardContent>
      </Card>
    </div>
  )
}
