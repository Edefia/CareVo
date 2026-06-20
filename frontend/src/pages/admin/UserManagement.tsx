import { useState } from "react"
import { Search, Shield, UserX, UserCheck, Trash2, MoreVertical, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatCard } from "@/components/shared/StatCard"
import { useUsers, useUserCounts, useUpdateUserStatus, useDeleteUser } from "@/hooks/useUsers"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import { UserFormDialog } from "./UserFormDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Mail } from "lucide-react"

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    page,
    limit: 20,
    role: roleFilter !== "ALL" ? roleFilter : undefined,
    search: searchTerm || undefined,
  })

  const { data: countsResponse, isLoading: countsLoading } = useUserCounts()
  const updateStatusMutation = useUpdateUserStatus()
  const deleteMutation = useDeleteUser()

  const usersData = usersResponse?.data || usersResponse
  const users = usersData?.items || usersData?.data || (Array.isArray(usersData) ? usersData : [])
  
  const countsData = countsResponse?.data || countsResponse
  const counts = countsData || { total: 0, active: 0, suspended: 0, byRole: {} }

  const handleToggleStatus = async (userId: string, currentActive: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({ id: userId, isActive: !currentActive })
      toast.success(`User ${currentActive ? 'suspended' : 'reactivated'} successfully`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user status")
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await deleteMutation.mutateAsync(userId)
      toast.success("User deleted successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user")
    }
  }

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "ADMIN": return "bg-purple-100 text-purple-700 border-purple-200"
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
          <Button 
            onClick={() => { setEditingUser(null); setIsFormOpen(true); }}
            className="h-[44px] bg-[var(--color-forest)] hover:bg-[var(--color-forest)]/90 flex items-center gap-2"
          >
            <Shield className="h-4 w-4" /> Provision New User
          </Button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OVERVIEW CARDS (KPIs)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[24px] grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
        {countsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[140px] rounded-xl" />)
        ) : (
          <>
            <StatCard title="Total Users" value={counts.total?.toLocaleString() || "0"} icon={UserCheck} description="Across all roles" className="border-t-4 border-t-emerald-500" />
            <StatCard title="Interpreters" value={counts.byRole?.INTERPRETER?.toLocaleString() || "0"} icon={Shield} description="Medical professionals" className="border-t-4 border-t-blue-500" />
            <StatCard title="Laboratories" value={counts.byRole?.LABORATORY?.toLocaleString() || "0"} icon={Shield} description="Active partner labs" className="border-t-4 border-t-violet-500" />
            <StatCard title="Suspended" value={counts.suspended?.toLocaleString() || "0"} icon={UserX} description="Requires investigation" className="border-t-4 border-t-red-500" />
          </>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          USER DIRECTORY
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Card className="shadow-[var(--shadow-card)] border-[var(--color-border)]">
        <CardHeader className="pb-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="font-serif text-xl text-[var(--color-forest)]">Global Directory</CardTitle>
            <div className="flex items-center gap-2">
              <form 
                className="relative w-full md:w-[350px]"
                onSubmit={(e) => {
                  e.preventDefault()
                  setPage(1)
                }}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search name or email... (Press Enter)" 
                  className="pl-9 h-10 border-slate-200 focus-visible:ring-[var(--color-forest)]/20" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
              <select 
                className="h-10 border border-slate-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/20"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              >
                <option value="ALL">All Roles</option>
                <option value="CLIENT">Clients</option>
                <option value="INTERPRETER">Interpreters</option>
                <option value="LABORATORY">Laboratories</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
          ) : (
            <>
              <DataTable 
                columns={[
                  { 
                    header: "User / Email", 
                    cell: (row: any) => (
                      <div>
                        <div className="font-semibold text-[14px] text-slate-900">{row.firstName} {row.lastName}</div>
                        <div className="text-[12px] text-slate-500">{row.email}</div>
                      </div>
                    ) 
                  },
                  { 
                    header: "Role", 
                    cell: (row: any) => <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getRoleBadge(row.role)}`}>{row.role.replace("_", " ")}</span> 
                  },
                  { 
                    header: "Status", 
                    cell: (row: any) => (
                      <span className={`flex items-center gap-1.5 text-[12px] font-medium ${row.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                        <span className={`h-2 w-2 rounded-full ${row.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {row.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    )
                  },
                  { header: "Registered", cell: (row: any) => new Date(row.createdAt).toLocaleDateString() },
                  { header: "Last Login", cell: (row: any) => row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString() : 'Never' },
                  { 
                    header: "Actions", 
                    cell: (row: any) => (
                      <div className="flex items-center gap-2">
                        {row.isActive ? (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" 
                            title="Suspend User"
                            onClick={() => handleToggleStatus(row._id, row.isActive)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50" 
                            title="Reactivate User"
                            onClick={() => handleToggleStatus(row._id, row.isActive)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" 
                          title="Delete User"
                          onClick={() => handleDelete(row._id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setEditingUser(row); setIsFormOpen(true); }}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={async () => {
                                // TODO: Optional manual trigger for password reset email
                                toast.success("Password reset email sent (placeholder)")
                              }}
                            >
                              <Mail className="mr-2 h-4 w-4" /> Send Password Reset
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  },
                ]}
                data={users}
              />
              
              {/* Pagination Controls */}
              {usersData?.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-gray-50/50">
                  <div className="text-sm text-slate-500">
                    Page {page} of {usersData.totalPages}
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
                      onClick={() => setPage(p => Math.min(usersData.totalPages, p + 1))}
                      disabled={page === usersData.totalPages}
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

      <UserFormDialog 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        user={editingUser} 
      />
    </div>
  )
}
