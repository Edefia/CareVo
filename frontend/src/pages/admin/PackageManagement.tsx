import { useState } from "react"
import { Search, Plus, Package as PackageIcon, Edit, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import toast from "react-hot-toast"

import { usePackages, useCreatePackage, useUpdatePackage, useDeletePackage } from "@/hooks/usePackages"

export function PackageManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "GENERAL",
    testsIncluded: "",
    isActive: true,
    turnaroundTime: ""
  })

  const { data: packagesResponse, isLoading } = usePackages()
  const createMutation = useCreatePackage()
  const updateMutation = useUpdatePackage()
  const deleteMutation = useDeletePackage()

  const packagesData = packagesResponse?.data || packagesResponse
  const packages = packagesData?.data || packagesData || []

  const filteredPackages = Array.isArray(packages) ? packages.filter((p: any) => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const handleOpenModal = (pkg: any = null) => {
    if (pkg) {
      setEditingPackage(pkg)
      setFormData({
        name: pkg.name,
        description: pkg.description,
        price: (pkg.price / 100).toString(),
        category: pkg.category || "GENERAL",
        testsIncluded: Array.isArray(pkg.testsIncluded) ? pkg.testsIncluded.join(", ") : pkg.testsIncluded,
        isActive: pkg.isActive,
        turnaroundTime: pkg.turnaroundTime || ""
      })
    } else {
      setEditingPackage(null)
      setFormData({
        name: "", description: "", price: "", category: "GENERAL", testsIncluded: "", isActive: true, turnaroundTime: ""
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      ...formData,
      price: Math.round(parseFloat(formData.price) * 100), // Convert GHS to pesewas
      testsIncluded: formData.testsIncluded.split(",").map(t => t.trim()).filter(Boolean)
    }

    try {
      if (editingPackage) {
        await updateMutation.mutateAsync({ id: editingPackage._id, data: payload })
        toast.success("Package updated successfully")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Package created successfully")
      }
      setIsModalOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save package")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Package deleted successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete package")
    }
  }

  const handleToggleStatus = async (pkg: any) => {
    try {
      await updateMutation.mutateAsync({ id: pkg._id, data: { isActive: !pkg.isActive } })
      toast.success(`Package ${pkg.isActive ? 'deactivated' : 'activated'} successfully`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update package status")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Package Management</h2>
          <p className="text-muted-foreground">Create and manage health packages offered to clients.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="flex items-center gap-2" onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4" />
            Create Package
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Health Packages</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search packages by name..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
          ) : (
            <DataTable 
              columns={[
                { 
                  header: "Package Name", 
                  cell: (row) => (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                        <PackageIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{row.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{row.description}</div>
                      </div>
                    </div>
                  ) 
                },
                { 
                  header: "Category", 
                  cell: (row) => <span className="text-sm font-medium">{row.category}</span>
                },
                { 
                  header: "Tests Included", 
                  cell: (row) => <span className="text-sm text-muted-foreground">{Array.isArray(row.testsIncluded) ? row.testsIncluded.length : 0} tests</span>
                },
                { 
                  header: "Price", 
                  cell: (row) => <span className="font-bold text-slate-900">GHS {(row.price / 100).toFixed(2)}</span>
                },
                { 
                  header: "Turnaround Time", 
                  cell: (row) => <span className="text-sm">{row.turnaroundTime || 'N/A'}</span>
                },
                { 
                  header: "Status", 
                  cell: (row) => <StatusBadge status={row.isActive ? "ACTIVE" : "INACTIVE"} />
                },
                { 
                  header: "Actions", 
                  cell: (row) => (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(row)} title="Edit Package">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(row)} title={row.isActive ? "Deactivate" : "Activate"}>
                        {row.isActive ? <XCircle className="h-4 w-4 text-amber-600" /> : <CheckCircle className="h-4 w-4 text-emerald-600" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(row._id)} title="Delete Package" disabled={deleteMutation.isPending}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )
                },
              ]}
              data={filteredPackages}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPackage ? 'Edit Package' : 'Create New Package'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Comprehensive Wellness" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="GENERAL">General Health</option>
                  <option value="SPECIALIZED">Specialized</option>
                  <option value="PRENATAL">Prenatal</option>
                  <option value="CORPORATE">Corporate</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea required value={formData.description} onChange={(e: any) => setFormData({...formData, description: e.target.value})} placeholder="Describe what this package is for..." className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>

            <div className="space-y-2">
              <Label>Tests Included (Comma separated)</Label>
              <textarea required value={formData.testsIncluded} onChange={(e: any) => setFormData({...formData, testsIncluded: e.target.value})} placeholder="e.g. Complete Blood Count, Lipid Panel, Urinalysis" className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (GHS)</Label>
                <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Estimated Turnaround Time</Label>
                <Input required value={formData.turnaroundTime} onChange={e => setFormData({...formData, turnaroundTime: e.target.value})} placeholder="e.g. 24-48 hours" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={formData.isActive} 
                onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isActive">Package is active and available for booking</Label>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
