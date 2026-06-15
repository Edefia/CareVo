import { useState } from "react"
import { Search, Plus, MapPin, Phone, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"
import { useLaboratories } from "@/hooks/useLaboratories"

export function LabList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const { data: laboratoriesData, isLoading } = useLaboratories()

  const labs = laboratoriesData?.data || []

  const filteredLabs = labs.filter((lab: any) => 
    lab.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lab.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeLabsCount = labs.filter((lab: any) => lab.status === "ACTIVE").length

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
            <div className="text-2xl font-bold">{isLoading ? "-" : activeLabsCount}</div>
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
                  <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate(`/laboratories/${row._id}`)}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium group-hover:underline text-primary">{row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.code}</div>
                    </div>
                  </div>
                )
              },
              { 
                header: "Location", 
                cell: (row) => (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {row.address?.city || "Unknown"}, {row.address?.state || "Unknown"}
                  </div>
                )
              },
              { 
                header: "Contact", 
                cell: (row) => (
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                      {row.contactPhone}
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
                  <Button variant="outline" size="sm" onClick={() => navigate(`/laboratories/${row._id}`)}>
                    Manage
                  </Button>
                )
              },
            ]}
            data={filteredLabs}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
