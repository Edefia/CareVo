import { useState } from "react"
import { Search, Filter, Download, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("")

  // Real app would fetch this via an API hook
  const logs: any[] = []
  const isLoading = false

  const filteredLogs = logs.filter(log => 
    log.actor?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Audit Logs</h2>
          <p className="text-muted-foreground">Monitor platform activity for compliance and security.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Activity Feed</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by actor, action, or target..." 
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
          {logs.length > 0 ? (
            <DataTable 
              columns={[
                { header: "Timestamp", accessorKey: "timestamp" },
                { header: "Actor", accessorKey: "actor" },
                { 
                  header: "Role", 
                  cell: (row) => <span className="text-xs text-muted-foreground border px-2 py-1 rounded-full">{row.role?.replace("_", " ")}</span>
                },
                { header: "Action", accessorKey: "action" },
                { header: "Target/Resource", accessorKey: "target" },
                { 
                  header: "Status", 
                  cell: (row) => (
                    <span className={`text-xs font-medium ${row.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                      {row.status}
                    </span>
                  )
                },
                { 
                  header: "Details", 
                  cell: () => <Button variant="link" size="sm">View JSON</Button>
                },
              ]}
              data={filteredLogs}
              isLoading={isLoading}
            />
          ) : (
            <EmptyState 
              icon={<Activity className="h-10 w-10 text-muted-foreground" />}
              title="No audit logs"
              description="System activity logs will appear here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
