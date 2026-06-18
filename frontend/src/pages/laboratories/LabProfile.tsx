import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, MapPin, Phone, Mail, Settings, Users, Activity, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { useLaboratories } from "@/hooks/useLaboratories"

export function LabProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data: laboratoriesData, isLoading } = useLaboratories()
  
  // Try items first, then data, then assume array
  const labs = laboratoriesData?.items || laboratoriesData?.data || (Array.isArray(laboratoriesData) ? laboratoriesData : [])
  const labData = labs.find((l: any) => l._id === id) || {
    _id: id || "Unknown",
    name: "Loading...",
    code: "...",
    status: "ACTIVE",
    address: { street: "", city: "", state: "" },
    contactPhone: "",
    contactEmail: "",
  }

  // Real app would fetch staff and services from API
  const staff: any[] = []
  const services: any[] = []

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
              <StatusBadge status={labData.status} />
            </div>
            <p className="text-muted-foreground">Code: {labData.code}</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button className="flex items-center gap-2">
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
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Add Staff
              </Button>
            </CardHeader>
            <CardContent>
              {staff.length > 0 ? (
                <DataTable 
                  columns={[
                    { header: "Name", accessorKey: "name" },
                    { header: "Role", accessorKey: "role" },
                    { 
                      header: "Status", 
                      cell: (row) => <StatusBadge status={row.status} />
                    },
                    { 
                      header: "Actions", 
                      cell: () => <Button variant="ghost" size="sm">Edit</Button>
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
              <Button variant="outline" size="sm">Manage Services</Button>
            </CardHeader>
            <CardContent>
              {services.length > 0 ? (
                <DataTable 
                  columns={[
                    { header: "Package Name", accessorKey: "name" },
                    { header: "Price", accessorKey: "price" },
                    { 
                      header: "Status", 
                      cell: (row) => <StatusBadge status={row.status} />
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
    </div>
  )
}
