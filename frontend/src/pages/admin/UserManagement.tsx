import { useState } from "react"
import { Search, Filter, Shield, UserX, UserCheck, KeyRound, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatCard } from "@/components/shared/StatCard"

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")

  // Mock User Data
  const users = [
    { id: "USR-001", name: "Sarah Jenkins", email: "sarah.j@example.com", role: "CLIENT", status: "ACTIVE", lastLogin: "2026-06-16T19:00:00Z" },
    { id: "USR-002", name: "Dr. Michael Chen", email: "dr.chen@mediscan.com", role: "INTERPRETER", status: "ACTIVE", lastLogin: "2026-06-16T18:45:00Z" },
    { id: "USR-003", name: "AccuLab Admin", email: "admin@acculab.gh", role: "LABORATORY", status: "ACTIVE", lastLogin: "2026-06-15T09:00:00Z" },
    { id: "USR-004", name: "James Wilson", email: "james.w@example.com", role: "CLIENT", status: "SUSPENDED", lastLogin: "2026-05-20T14:20:00Z" },
    { id: "USR-005", name: "Admin (SysAuth)", email: "sysadmin@carevo.com", role: "SUPER_ADMIN", status: "ACTIVE", lastLogin: "2026-06-16T19:20:00Z" },
  ]

  const filteredUsers = users.filter(u => 
    (roleFilter === "ALL" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "SUPER_ADMIN": return "bg-purple-100 text-purple-700 border-purple-200"
      case "INTERPRETER": return "bg-blue-100 text-blue-700 border-blue-200"
      case "LABORATORY": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "CLIENT": return "bg-slate-100 text-slate-700 border-slate-200"
      default: return "bg-gray-100 text-gray-700"
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
            User Management
          </h1>
          <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">
            Control access, roles, and security for all platform users.
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="h-[44px] bg-[var(--color-forest)] hover:bg-[var(--color-forest)]/90 flex items-center gap-2">
            <Shield className="h-4 w-4" /> Provision New Admin
          </Button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OVERVIEW CARDS (KPIs)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[24px] grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard title="Total Users" value="24,500" icon={UserCheck} description="Across all roles" className="border-t-4 border-t-emerald-500" />
        <StatCard title="Interpreters" value="45" icon={Shield} description="Medical professionals" className="border-t-4 border-t-blue-500" />
        <StatCard title="Laboratories" value="48" icon={Shield} description="Active partner labs" className="border-t-4 border-t-violet-500" />
        <StatCard title="Suspended" value="12" icon={UserX} description="Requires investigation" className="border-t-4 border-t-red-500" />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          USER DIRECTORY
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Card className="shadow-[var(--shadow-card)] border-[var(--color-border)]">
        <CardHeader className="pb-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="font-serif text-xl text-[var(--color-forest)]">Global Directory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-[350px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search name or email..." 
                  className="pl-9 h-10 border-slate-200 focus-visible:ring-[var(--color-forest)]/20" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="h-10 border border-slate-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/20"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="CLIENT">Clients</option>
                <option value="INTERPRETER">Interpreters</option>
                <option value="LABORATORY">Laboratories</option>
                <option value="SUPER_ADMIN">Admins</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable 
            columns={[
              { 
                header: "User / Email", 
                cell: (row) => (
                  <div>
                    <div className="font-semibold text-[14px] text-slate-900">{row.name}</div>
                    <div className="text-[12px] text-slate-500">{row.email}</div>
                  </div>
                ) 
              },
              { 
                header: "Role", 
                cell: (row) => <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getRoleBadge(row.role)}`}>{row.role.replace("_", " ")}</span> 
              },
              { 
                header: "Status", 
                cell: (row) => (
                  <span className={`flex items-center gap-1.5 text-[12px] font-medium ${row.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}`}>
                    <span className={`h-2 w-2 rounded-full ${row.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {row.status}
                  </span>
                )
              },
              { header: "Last Login", cell: (row) => new Date(row.lastLogin).toLocaleString() },
              { 
                header: "Actions", 
                cell: (row) => (
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50" title="Reset Password">
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    {row.status === 'ACTIVE' ? (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" title="Suspend User">
                        <UserX className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50" title="Reactivate User">
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                )
              },
            ]}
            data={filteredUsers}
          />
        </CardContent>
      </Card>
    </div>
  )
}
