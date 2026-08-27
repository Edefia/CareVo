import { useState, useEffect } from "react"
import { 
  Search, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Activity
} from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { useAuditLogs } from "@/hooks/useAuditLogs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedRole, setSelectedRole] = useState("ALL")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const { data: logsResponse, isLoading } = useAuditLogs({
    page,
    limit,
    actorRole: selectedRole !== "ALL" ? selectedRole : undefined,
    search: debouncedSearch || undefined,
  })

  // Extract raw log list safely from various API response shapes
  const rawData = logsResponse?.data ?? logsResponse
  const logs: any[] = Array.isArray(rawData) 
    ? rawData 
    : (Array.isArray(rawData?.items) ? rawData.items : (Array.isArray(rawData?.data) ? rawData.data : []))

  // Extract pagination metadata
  const totalCount: number = logsResponse?.meta?.totalCount ?? logsResponse?.total ?? (Array.isArray(logs) ? logs.length : 0)
  const totalPages: number = logsResponse?.meta?.totalPages ?? logsResponse?.totalPages ?? Math.max(1, Math.ceil(totalCount / limit))
  const currentPage: number = logsResponse?.meta?.page ?? page

  const getSeverityBadge = (severity?: string, action?: string) => {
    let resolved = severity
    if (!resolved || resolved === "INFO") {
      const act = (action || "").toLowerCase()
      if (act.includes('delete') || act.includes('remove') || act.includes('destroy')) resolved = "CRITICAL"
      else if (act.includes('suspend') || act.includes('revoke') || act.includes('reject') || act.includes('fail')) resolved = "HIGH"
      else if (act.includes('update') || act.includes('edit') || act.includes('change')) resolved = "MEDIUM"
      else resolved = "INFO"
    }

    switch(resolved) {
      case "CRITICAL": return <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider rounded bg-red-100 text-red-700 border border-red-200">CRIT</span>
      case "HIGH": return <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider rounded bg-orange-100 text-orange-700 border border-orange-200">HIGH</span>
      case "MEDIUM": return <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider rounded bg-amber-100 text-amber-700 border border-amber-200">MED</span>
      case "LOW": return <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider rounded bg-blue-100 text-blue-700 border border-blue-200">LOW</span>
      case "INFO": 
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider rounded bg-slate-100 text-slate-700 border border-slate-200">INFO</span>
    }
  }

  // Pagination calculation
  const startItem = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0
  const endItem = Math.min(currentPage * limit, totalCount)

  // Generate page numbers window (e.g. 1 ... 4 5 6 ... 10)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1600px] mx-auto pb-[96px] animate-in fade-in duration-500">
      
      {/* 
          SECURITY FEED TABLE
      */}
      <Card className="shadow-[var(--shadow-card)] border-[var(--color-border)]">
        <CardHeader className="pb-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="font-serif text-xl text-[var(--color-forest)] flex items-center gap-2">
              Security Feed
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search Action, Target, or IP..." 
                  className="pl-9 h-10 border-slate-200 font-mono text-sm" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select 
                aria-label="Filter by Role"
                className="h-10 border border-slate-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/20 bg-white"
                value={selectedRole}
                onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }}
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="CLIENT">Client</option>
                <option value="LABORATORY">Laboratory</option>
                <option value="INTERPRETER">Interpreter</option>
              </select>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-xs whitespace-nowrap">Show:</span>
                <select
                  aria-label="Items per page"
                  className="h-10 border border-slate-200 rounded-md px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/20 bg-white font-mono"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value))
                    setPage(1)
                  }}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <span className="text-sm font-medium text-slate-500">Loading audit feed...</span>
            </div>
          ) : logs.length > 0 ? (
            <>
              <DataTable 
                columns={[
                  { 
                    header: "Event ID", 
                    cell: (row: any) => (
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {row._id ? `EV-${row._id.slice(-6).toUpperCase()}` : 'N/A'}
                      </span>
                    )
                  },
                  { 
                    header: "Timestamp (UTC)", 
                    cell: (row: any) => {
                      const timeVal = row.timestamp || row.createdAt
                      if (!timeVal) return <span className="font-mono text-xs text-slate-400">N/A</span>
                      const d = new Date(timeVal)
                      if (isNaN(d.getTime())) return <span className="font-mono text-xs text-slate-400">Invalid</span>
                      return (
                        <div className="font-mono text-xs text-slate-700 leading-tight">
                          <div>{d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>
                      )
                    }
                  },
                  { 
                    header: "Severity", 
                    cell: (row: any) => getSeverityBadge(row.severity, row.action)
                  },
                  { 
                    header: "Actor (Role)", 
                    cell: (row: any) => {
                      const actorName = row.actorId?.firstName 
                        ? `${row.actorId.firstName} ${row.actorId.lastName || ''}`.trim() 
                        : (row.actorId?.name || (typeof row.actorId === 'string' ? `User (${row.actorId.slice(-6).toUpperCase()})` : 'System'))
                      const actorEmail = row.actorId?.email

                      return (
                        <div>
                          <div className="font-semibold text-[13px] text-slate-900 leading-snug">
                            {actorName}
                          </div>
                          {actorEmail && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                              {actorEmail}
                            </div>
                          )}
                          <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded w-fit mt-0.5">
                            {row.actorRole}
                          </div>
                        </div>
                      )
                    } 
                  },
                  { 
                    header: "IP Address", 
                    cell: (row: any) => (
                      <span className="font-mono text-[12px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        {row.ipAddress || '::1'}
                      </span>
                    ) 
                  },
                  { 
                    header: "Action & Target", 
                    cell: (row: any) => (
                      <div>
                        <div className="font-mono font-bold text-[13px] text-violet-700">
                          {row.action}
                        </div>
                        <div className="text-[12px] text-slate-600 mt-0.5 truncate max-w-[220px]">
                          {row.resourceType} <span className="font-mono text-slate-400">({row.resourceId ? row.resourceId.slice(-6).toUpperCase() : 'N/A'})</span>
                        </div>
                      </div>
                    ) 
                  },
                  { 
                    header: "Status", 
                    cell: (row: any) => (
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        row.success 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                          : 'text-red-700 bg-red-50 border-red-200'
                      }`}>
                        {row.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    )
                  },
                  { 
                    header: "Payload", 
                    cell: (row) => (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-mono text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                            {"{ JSON }"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <span>Event Payload</span>
                              <span className="text-xs font-mono text-slate-400 font-normal">
                                {row._id ? `EV-${row._id.slice(-6).toUpperCase()}` : ''}
                              </span>
                            </DialogTitle>
                          </DialogHeader>
                          <pre className="bg-slate-950 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                            {JSON.stringify({ 
                              action: row.action,
                              actorRole: row.actorRole,
                              ipAddress: row.ipAddress,
                              previousState: row.previousState, 
                              newState: row.newState,
                              failureReason: row.failureReason 
                            }, null, 2)}
                          </pre>
                        </DialogContent>
                      </Dialog>
                    )
                  },
                ]}
                data={logs}
                isLoading={isLoading}
              />

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  ENTERPRISE PAGINATION CONTROLS
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[var(--color-border)] bg-slate-50/50">
                <div className="text-xs sm:text-sm text-slate-600 font-medium">
                  Showing <span className="font-semibold text-slate-900">{startItem}</span> to <span className="font-semibold text-slate-900">{endItem}</span> of <span className="font-semibold text-slate-900">{totalCount.toLocaleString()}</span> events
                </div>

                <div className="flex items-center gap-1.5">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    onClick={() => setPage(1)}
                    disabled={currentPage === 1}
                    title="First Page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>

                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1 mx-1">
                    {getPageNumbers().map((pageNum, idx) => (
                      typeof pageNum === 'number' ? (
                        <Button
                          key={idx}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className={`h-8 min-w-[32px] px-2 text-xs font-medium ${
                            currentPage === pageNum 
                              ? 'bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest)]/90' 
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      ) : (
                        <span key={idx} className="px-1 text-slate-400 text-xs">...</span>
                      )
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    onClick={() => setPage(totalPages)}
                    disabled={currentPage >= totalPages}
                    title="Last Page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-16">
              <EmptyState 
                icon={<Activity className="h-10 w-10 text-muted-foreground" />}
                title="No logs found"
                description={debouncedSearch || selectedRole !== "ALL" ? "Try adjusting your search or role filter." : "Audit feed will record all system activity in real time."}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

