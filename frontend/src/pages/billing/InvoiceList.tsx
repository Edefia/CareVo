import { useState } from "react"
import { Search, Filter, Download, DollarSign, Receipt, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"

import { useInvoices, useBillingStats } from "@/hooks/useBilling"

export function InvoiceList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)

  const { data: statsResponse, isLoading: statsLoading } = useBillingStats()
  const { data: invoicesResponse, isLoading: invoicesLoading } = useInvoices({ page, limit: 20 })

  const stats = statsResponse?.data || statsResponse
  const invoicesData = invoicesResponse?.data || invoicesResponse
  const invoices = invoicesData?.items || invoicesData?.data || (Array.isArray(invoicesData) ? invoicesData : [])

  // Client-side filtering for search term
  const filteredInvoices = invoices.filter((i: any) => 
    searchTerm === "" ||
    (i.patientId?.userId?.firstName + " " + i.patientId?.userId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i._id || "").toLowerCase().includes(searchTerm.toLowerCase())
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
        {statsLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">GHS {stats?.monthlyRevenue?.toLocaleString() || "0"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">GHS {stats?.pendingAmount?.toLocaleString() || "0"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.overdueCount || 0}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Invoices</CardTitle>
            <div className="flex items-center gap-2">
              <form 
                className="relative w-full md:w-64"
                onSubmit={(e) => {
                  e.preventDefault()
                  setPage(1)
                }}
              >
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search invoices..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
          ) : (
            <>
              <DataTable 
                columns={[
                  { 
                    header: "Invoice ID", 
                    cell: (row: any) => <span className="font-mono text-xs">{row._id?.substring(0, 8)}</span> 
                  },
                  { 
                    header: "Patient", 
                    cell: (row: any) => row.patientId?.userId ? `${row.patientId.userId.firstName} ${row.patientId.userId.lastName}` : "Unknown" 
                  },
                  { 
                    header: "Date", 
                    cell: (row: any) => new Date(row.createdAt).toLocaleDateString() 
                  },
                  { 
                    header: "Description", 
                    cell: (row: any) => <span className="text-[13px]">{row.description}</span> 
                  },
                  { 
                    header: "Amount", 
                    cell: (row: any) => `GHS ${(row.amount / 100).toLocaleString()}` 
                  },
                  { 
                    header: "Status", 
                    cell: (row: any) => <StatusBadge status={row.status} />
                  },
                  { 
                    header: "Actions", 
                    cell: (row: any) => (
                      <div className="flex gap-2">
                        {row.status === "PENDING" && (
                          <Button size="sm" onClick={() => navigate(`/billing/pay/${row._id}`)}>
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
              
              {/* Pagination Controls */}
              {invoicesData?.totalPages > 1 && (
                <div className="flex items-center justify-between py-4 border-t border-[var(--color-border)] mt-4">
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
