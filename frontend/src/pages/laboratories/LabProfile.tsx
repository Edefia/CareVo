import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Building2, MapPin, Phone, Mail, Settings, Users, Activity, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable } from "@/components/shared/DataTable"

export function LabProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Mock data for the specific lab
  const lab = {
    id: id || "LAB-001",
    name: "Accra Central Laboratory",
    location: "Accra, Greater Accra",
    address: "Plot 12 Independence Avenue, Ridge, Accra",
    phone: "024 111 1111",
    email: "contact@accracentral.lab",
    status: "ACTIVE",
    type: "Main Branch",
    registeredAt: "2023-01-10",
    manager: "Dr. Emmanuel Osei",
  }

  const mockStaff = [
    { name: "Sarah Jones", role: "Lab Admin", status: "ACTIVE" },
    { name: "Michael Smith", role: "Lab Tech", status: "ACTIVE" },
    { name: "Jessica Barnes", role: "Lab Tech", status: "INACTIVE" },
  ]

  const mockServices = [
    { name: "Basic Wellness Package", price: "GHS 150.00", status: "ACTIVE" },
    { name: "Comprehensive Wellness", price: "GHS 350.00", status: "ACTIVE" },
    { name: "Lipid Profile", price: "GHS 80.00", status: "ACTIVE" },
  ]

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
              <h2 className="text-2xl font-bold tracking-tight">{lab.name}</h2>
              <StatusBadge status={lab.status} />
            </div>
            <p className="text-muted-foreground">ID: {lab.id} • {lab.type}</p>
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
                <div className="font-medium text-sm pl-6">{lab.address}</div>
              </div>
              <div>
                <div className="flex items-center text-muted-foreground mb-1 text-sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone
                </div>
                <div className="font-medium text-sm pl-6">{lab.phone}</div>
              </div>
              <div>
                <div className="flex items-center text-muted-foreground mb-1 text-sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </div>
                <div className="font-medium text-sm pl-6">{lab.email}</div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center text-muted-foreground mb-1 text-sm">
                  <Building2 className="h-4 w-4 mr-2" />
                  Branch Manager
                </div>
                <div className="font-medium text-sm pl-6">{lab.manager}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Performance</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This lab has processed <span className="font-semibold text-foreground">1,245</span> tests this month with an average TAT of <span className="font-semibold text-foreground">1.2 days</span>.
                  </p>
                </div>
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
                data={mockStaff}
              />
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
              <DataTable 
                columns={[
                  { header: "Package Name", accessorKey: "name" },
                  { header: "Price", accessorKey: "price" },
                  { 
                    header: "Status", 
                    cell: (row) => <StatusBadge status={row.status} />
                  },
                ]}
                data={mockServices}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
