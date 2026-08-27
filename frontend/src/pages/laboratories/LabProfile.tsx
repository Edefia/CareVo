import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, MapPin, Phone, Mail, Settings, Users, Activity, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useLaboratories } from "@/hooks/useLaboratories"
import { useUsers, useUpdateUserStatus } from "@/hooks/useUsers"
import { useAdminLabServices } from "@/hooks/useLabServices"
import { LabFormDialog } from "./LabFormDialog"
import { UserFormDialog } from "../admin/UserFormDialog"
import toast from "react-hot-toast"
import { useState } from "react"

export function LabProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [isLabFormOpen, setIsLabFormOpen] = useState(false)
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    destructive?: boolean;
    confirmText?: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: () => {},
  })

  const { data: laboratoriesData, isLoading } = useLaboratories()
  
  // Try items first, then data, then assume array
  const labs = laboratoriesData?.items || laboratoriesData?.data || (Array.isArray(laboratoriesData) ? laboratoriesData : [])
  const labData = labs.find((l: any) => l._id === id) || {
    _id: id || "Unknown",
    name: "Loading...",
    code: "...",
    isActive: true,
    address: { street: "", city: "", state: "" },
    contactPhone: "",
    contactEmail: "",
  }

  // Fetch staff assigned to this lab
  const { data: staffResponse } = useUsers({
    role: "LABORATORY",
    laboratoryId: id,
    limit: 100, // fetch all for now
  })
  
  const staffData = staffResponse?.data || staffResponse
  const staff = staffData?.items || staffData?.data || (Array.isArray(staffData) ? staffData : [])

  const { data: servicesResponse } = useAdminLabServices({ laboratoryId: id })
  const servicesData = servicesResponse?.data || servicesResponse
  const services = servicesData?.items || servicesData?.data || (Array.isArray(servicesData) ? servicesData : [])

  const updateStatusMutation = useUpdateUserStatus()

  const handleToggleStaffStatus = (userId: string, currentActive: boolean) => {
    setConfirmDialog({
      isOpen: true,
      title: `${currentActive ? 'Suspend' : 'Reactivate'} Staff Member`,
      description: `Are you sure you want to ${currentActive ? 'suspend' : 'reactivate'} this staff member? They will ${currentActive ? 'lose' : 'regain'} access to the laboratory portal.`,
      destructive: currentActive,
      confirmText: currentActive ? 'Suspend' : 'Reactivate',
      action: async () => {
        try {
          await updateStatusMutation.mutateAsync({ id: userId, isActive: !currentActive })
          toast.success(`Staff member ${currentActive ? 'suspended' : 'reactivated'} successfully`)
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Failed to update staff status")
        }
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{labData.name}</h2>
              <StatusBadge status={labData.isActive ? "ACTIVE" : "INACTIVE"} />
            </div>
            <p className="text-muted-foreground">Code: {labData.code}</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsLabFormOpen(true)}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button className="flex items-center gap-2" onClick={() => {
              // Option B: Public Booking View
              window.open(`/book?laboratory=${labData._id}`, '_blank')
            }}>
              <ExternalLink className="h-4 w-4" />
              View Portal
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Details */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Laboratory Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center text-muted-foreground mb-1 text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Address
                </div>
                <div className="font-medium text-sm pl-6">
                  {labData.address?.street}<br />
                  {labData.address?.city}, {labData.address?.state}
                </div>
              </div>
              <div>
                <div className="flex items-center text-muted-foreground mb-1 text-sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone
                </div>
                <div className="font-medium text-sm pl-6">{labData.contactPhone || "-"}</div>
              </div>
              <div>
                <div className="flex items-center text-muted-foreground mb-1 text-sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </div>
                <div className="font-medium text-sm pl-6">{labData.contactEmail || "-"}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs (Staff & Services) */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Staff Members</CardTitle>
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => { setEditingStaff(null); setIsStaffFormOpen(true); }}>
                <Users className="h-4 w-4" />
                Add Staff
              </Button>
            </CardHeader>
            <CardContent>
              {staff.length > 0 ? (
                <DataTable 
                  columns={[
                    { 
                      header: "Name", 
                      cell: (row: any) => `${row.firstName} ${row.lastName}` 
                    },
                    { 
                      header: "Email", 
                      accessorKey: "email" 
                    },
                    { 
                      header: "Status", 
                      cell: (row: any) => <StatusBadge status={row.isActive ? "ACTIVE" : "SUSPENDED"} />
                    },
                    { 
                      header: "Actions", 
                      cell: (row: any) => (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setEditingStaff(row); setIsStaffFormOpen(true); }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={row.isActive ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
                            onClick={() => handleToggleStaffStatus(row._id, row.isActive)}
                            disabled={updateStatusMutation.isPending}
                          >
                            {row.isActive ? "Suspend" : "Activate"}
                          </Button>
                        </div>
                      )
                    },
                  ]}
                  data={staff}
                />
              ) : (
                <EmptyState 
                  icon={<Users className="h-10 w-10 text-muted-foreground" />}
                  title="No staff members"
                  description="Add staff members to manage this laboratory."
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Configured Packages & Pricing</CardTitle>
                <CardDescription>Services offered by this laboratory branch.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(`/packages?labId=${labData._id}`)}>Manage Services</Button>
            </CardHeader>
            <CardContent>
              {services.length > 0 ? (
                <DataTable 
                  columns={[
                    { header: "Package Name", accessorKey: "name" },
                    { header: "Price", accessorKey: "price" },
                    { 
                      header: "Status", 
                      cell: (row: any) => <StatusBadge status={row.status} />
                    },
                  ]}
                  data={services}
                />
              ) : (
                <EmptyState 
                  icon={<Activity className="h-10 w-10 text-muted-foreground" />}
                  title="No services configured"
                  description="Configure test packages and pricing for this laboratory."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.action}
        destructive={confirmDialog.destructive}
        confirmText={confirmDialog.confirmText}
      />

      <LabFormDialog
        open={isLabFormOpen}
        onOpenChange={setIsLabFormOpen}
        lab={labData}
      />

      <UserFormDialog
        isOpen={isStaffFormOpen}
        onClose={() => setIsStaffFormOpen(false)}
        user={editingStaff}
        lockedRole="LABORATORY"
        lockedLaboratoryId={labData._id}
      />
    </div>
  )
}
