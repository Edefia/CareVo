import { useState } from "react"
import { Search, Plus, MapPin, Phone, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"

const mockLabs = [
  { id: "LAB-001", name: "Accra Central Laboratory", location: "Accra, Greater Accra", phone: "024 111 1111", email: "contact@accracentral.lab", status: "ACTIVE", type: "Main Branch" },
  { id: "LAB-002", name: "Kumasi Diagnostic Center", location: "Kumasi, Ashanti", phone: "020 222 2222", email: "info@kumasidiagnostic.com", status: "ACTIVE", type: "Partner Lab" },
  { id: "LAB-003", name: "Tema General Hub", location: "Tema, Greater Accra", phone: "027 333 3333", email: "hello@temahub.com", status: "INACTIVE", type: "Collection Point" },
]

export function LabList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLabs = mockLabs.filter(lab => 
    lab.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lab.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Laboratories Directory</h2>
          <p className="text-muted-foreground">Manage all registered laboratories and partners.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Register Laboratory
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Labs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Points</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Laboratories</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search labs by name or location..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={[
              { 
                header: "Laboratory Name", 
                cell: (row) => (
                  <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate(`/laboratories/${row.id}`)}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium group-hover:underline text-primary">{row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.type}</div>
                    </div>
                  </div>
                )
              },
              { 
                header: "Location", 
                cell: (row) => (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {row.location}
                  </div>
                )
              },
              { 
                header: "Contact", 
                cell: (row) => (
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                      {row.phone}
                    </div>
                  </div>
                )
              },
              { 
                header: "Status", 
                cell: (row) => <StatusBadge status={row.status} />
              },
              { 
                header: "Actions", 
                cell: (row) => (
                  <Button variant="outline" size="sm" onClick={() => navigate(`/laboratories/${row.id}`)}>
                    Manage
                  </Button>
                )
              },
            ]}
            data={filteredLabs}
          />
        </CardContent>
      </Card>
    </div>
  )
}
