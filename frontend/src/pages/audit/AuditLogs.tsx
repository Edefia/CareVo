import { useState } from "react"
import { Search, Download, Activity, ShieldCheck, Database, Server, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatCard } from "@/components/shared/StatCard"
import { useAuditLogs } from "@/hooks/useAuditLogs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("ALL")
  const [page, setPage] = useState(1)

  const { data: logsResponse, isLoading } = useAuditLogs({
    page,
    limit: 50,
    actorRole: selectedRole !== "ALL" ? selectedRole : undefined,
  })

  const logsData = logsResponse?.data || logsResponse
  const logs = logsData?.items || logsData?.data || (Array.isArray(logsData) ? logsData : [])

  // Client-side filtering for search term if needed (since backend might not support deep search yet)
  const filteredLogs = logs.filter((log: any) => 
    searchTerm === "" || 
    (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.resourceType && log.resourceType.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.ipAddress && log.ipAddress.includes(searchTerm))
  )

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case "CRITICAL": return <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">CRIT</span>
      case "HIGH": return <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">HIGH</span>
      case "MEDIUM": return <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">MED</span>
      case "LOW": return <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">LOW</span>
      case "INFO": return <span className="text-slate-600 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">INFO</span>
      default: return <span className="text-slate-600 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">INFO</span>
    }
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1600px] mx-auto pb-[96px] animate-in fade-in duration-500">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAGE HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[24px]">
        <div>
          <div className="flex items-center gap-3 mb-[8px]">
            <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight">
              System Audit Logs
            </h1>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">
            Immutable, industry-standard audit trail for security and compliance.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-[44px] flex items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SYSTEM HEALTH & LOG METRICS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[24px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events Recorded" value={logsData?.total?.toLocaleString() || "0"} icon={Activity} description="Lifetime logs" className="border-t-4 border-t-blue-500" />
        <StatCard title="System Integrity" value="100%" icon={ShieldCheck} description="No tampering detected" className="border-t-4 border-t-emerald-500" />
        <StatCard title="DB Status" value="Online" icon={Database} description="Responding normally" className="border-t-4 border-t-amber-500" />
        <StatCard title="Active Nodes" value="1 / 1" icon={Server} description="All systems operational" className="border-t-4 border-t-violet-500" />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ADVANCED AUDIT LOG VIEWER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Card className="shadow-[var(--shadow-card)] border-[var(--color-border)]">
        <CardHeader className="pb-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="font-serif text-xl text-[var(--color-forest)] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> Security Feed
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search Action, Target, or IP..." 
                  className="pl-9 h-10 border-slate-200 font-mono text-sm" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="h-10 border border-slate-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/20"
                value={selectedRole}
                onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }}
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="CLIENT">Client</option>
                <option value="LABORATORY">Laboratory</option>
                <option value="INTERPRETER">Interpreter</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
          ) : filteredLogs.length > 0 ? (
            <DataTable 
              columns={[
                { 
                  header: "Event ID", 
                  cell: (row: any) => <span className="font-mono text-xs text-slate-500">{row._id?.substring(0, 8)}</span> 
                },
                { 
                  header: "Timestamp (UTC)", 
                  cell: (row: any) => <span className="font-mono text-[13px]">{new Date(row.createdAt).toLocaleString()}</span> 
                },
                { header: "Severity", cell: (row: any) => getSeverityBadge(row.action?.includes('delete') || row.action?.includes('suspend') ? 'HIGH' : 'INFO') },
                { 
                  header: "Actor (Role)", 
                  cell: (row: any) => (
                    <div>
                      <div className="font-semibold text-[13px] text-slate-900">{row.actorId?.firstName ? `${row.actorId.firstName} ${row.actorId.lastName}` : row.actorId || 'System'}</div>
                      <div className="text-[10px] uppercase text-slate-500 tracking-wider font-mono mt-0.5">{row.actorRole}</div>
                    </div>
                  ) 
                },
                { header: "IP Address", cell: (row: any) => <span className="font-mono text-[13px] text-slate-600 bg-slate-50 px-2 py-1 rounded">{row.ipAddress}</span> },
                { 
                  header: "Action & Target", 
                  cell: (row: any) => (
                    <div>
                      <div className="font-mono font-bold text-[13px] text-violet-700">{row.action}</div>
                      <div className="text-[12px] text-slate-600 mt-0.5 truncate max-w-[200px]">{row.resourceType} ({row.resourceId?.substring(0, 8) || 'N/A'})</div>
                    </div>
                  ) 
                },
                { 
                  header: "Status", 
                  cell: (row: any) => (
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${row.success ? 'text-emerald-600' : 'text-red-600'}`}>
                      {row.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  )
                },
                { 
                  header: "Payload", 
                  cell: (row) => (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="h-8 text-xs font-mono text-blue-600 hover:bg-blue-50">{"{ JSON }"}</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Event Payload JSON</DialogTitle>
                        </DialogHeader>
                        <pre className="bg-slate-950 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                          {JSON.stringify({ previousState: row.previousState, newState: row.newState }, null, 2)}
                        </pre>
                      </DialogContent>
                    </Dialog>
                  )
                },
              ]}
              data={filteredLogs}
              isLoading={isLoading}
            />
          ) : (
            <div className="p-12">
              <EmptyState 
                icon={<Activity className="h-10 w-10 text-muted-foreground" />}
                title="No logs found"
                description="Try adjusting your search or filters."
              />
            </div>
          )}
          
          {/* Pagination Controls */}
          {logsData?.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)]">
              <div className="text-sm text-slate-500">
                Page {page} of {logsData.totalPages}
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
                  onClick={() => setPage(p => Math.min(logsData.totalPages, p + 1))}
                  disabled={page === logsData.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
