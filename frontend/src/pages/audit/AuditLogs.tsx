import { useState } from "react"
import { Search, Filter, Download, Activity, FileJson, AlertTriangle, ShieldCheck, Database, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatCard } from "@/components/shared/StatCard"

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("ALL")

  // Advanced Mock Data for Auditors
  const logs = [
    { id: "EVT-901", timestamp: "2026-06-16T19:20:05Z", actor: "Admin (SysAuth)", role: "SUPER_ADMIN", action: "UPDATE_CONFIG", target: "System Parameters", ip: "192.168.1.45", status: "SUCCESS", severity: "HIGH" },
    { id: "EVT-902", timestamp: "2026-06-16T18:45:12Z", actor: "Dr. Michael Chen", role: "INTERPRETER", action: "ACCESS_RECORD", target: "Result ID: RS-4091", ip: "10.0.4.11", status: "SUCCESS", severity: "LOW" },
    { id: "EVT-903", timestamp: "2026-06-16T18:30:00Z", actor: "System Agent", role: "SYSTEM", action: "DB_BACKUP", target: "Database Cluster A", ip: "127.0.0.1", status: "SUCCESS", severity: "INFO" },
    { id: "EVT-904", timestamp: "2026-06-16T17:15:22Z", actor: "Unknown", role: "UNAUTHENTICATED", action: "FAILED_LOGIN", target: "Admin Dashboard", ip: "185.15.42.11", status: "FAILED", severity: "CRITICAL" },
    { id: "EVT-905", timestamp: "2026-06-16T16:05:10Z", actor: "AccuLab Diagnostics", role: "LABORATORY", action: "UPLOAD_RESULTS", target: "Batch #B-9002", ip: "198.51.100.14", status: "SUCCESS", severity: "MEDIUM" },
  ]

  const isLoading = false

  const filteredLogs = logs.filter(log => 
    (selectedRole === "ALL" || log.role === selectedRole) &&
    (log.actor.toLowerCase().includes(searchTerm.toLowerCase()) || 
     log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.ip.includes(searchTerm))
  )

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case "CRITICAL": return <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200"><AlertTriangle className="h-3 w-3"/> CRIT</span>
      case "HIGH": return <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">HIGH</span>
      case "MEDIUM": return <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">MED</span>
      case "LOW": return <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">LOW</span>
      case "INFO": return <span className="text-slate-600 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">INFO</span>
      default: return null
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
              Live Activity Logs
            </h1>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
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
          <Button variant="outline" className="h-[44px] flex items-center gap-2 border-slate-300">
            <FileJson className="h-4 w-4" /> Export JSON
          </Button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SYSTEM HEALTH & LOG METRICS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[24px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Events (24h)" value="14,204" icon={Activity} description="Normal volume" className="border-t-4 border-t-blue-500" />
        <StatCard title="Security Alerts" value="3" icon={AlertTriangle} description="1 Critical, 2 High" className="border-t-4 border-t-red-500" />
        <StatCard title="DB Integrity" value="100%" icon={Database} description="Last check: 5m ago" className="border-t-4 border-t-emerald-500" />
        <StatCard title="Active Nodes" value="4 / 4" icon={Server} description="All systems operational" className="border-t-4 border-t-violet-500" />
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
                  placeholder="Search IP, Actor, Action, or Target..." 
                  className="pl-9 h-10 border-slate-200 font-mono text-sm" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="h-10 border border-slate-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/20"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Admin</option>
                <option value="SYSTEM">System</option>
                <option value="INTERPRETER">Interpreter</option>
                <option value="UNAUTHENTICATED">Unauthenticated</option>
              </select>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length > 0 ? (
            <DataTable 
              columns={[
                { 
                  header: "Event ID", 
                  cell: (row) => <span className="font-mono text-xs text-slate-500">{row.id}</span> 
                },
                { 
                  header: "Timestamp (UTC)", 
                  cell: (row) => <span className="font-mono text-[13px]">{row.timestamp}</span> 
                },
                { header: "Severity", cell: (row) => getSeverityBadge(row.severity) },
                { 
                  header: "Actor (Role)", 
                  cell: (row) => (
                    <div>
                      <div className="font-semibold text-[13px] text-slate-900">{row.actor}</div>
                      <div className="text-[10px] uppercase text-slate-500 tracking-wider font-mono mt-0.5">{row.role}</div>
                    </div>
                  ) 
                },
                { header: "IP Address", cell: (row) => <span className="font-mono text-[13px] text-slate-600 bg-slate-50 px-2 py-1 rounded">{row.ip}</span> },
                { 
                  header: "Action & Target", 
                  cell: (row) => (
                    <div>
                      <div className="font-mono font-bold text-[13px] text-violet-700">{row.action}</div>
                      <div className="text-[12px] text-slate-600 mt-0.5 truncate max-w-[200px]">{row.target}</div>
                    </div>
                  ) 
                },
                { 
                  header: "Status", 
                  cell: (row) => (
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${row.status === 'SUCCESS' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {row.status}
                    </span>
                  )
                },
                { 
                  header: "Payload", 
                  cell: () => <Button variant="ghost" className="h-8 text-xs font-mono text-blue-600 hover:bg-blue-50">{"{ JSON }"}</Button>
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
        </CardContent>
      </Card>
    </div>
  )
}
