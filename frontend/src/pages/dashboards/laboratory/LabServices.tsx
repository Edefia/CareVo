import { useState } from "react"
import { Search, Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { useLabServices, useCreateLabService, useUpdateLabService, useDeleteLabService } from "@/hooks/useLabServices"
import { usePackages } from "@/hooks/usePackages"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function LabServices() {
  const { data: servicesData, isLoading } = useLabServices()
  const { data: packagesResponse } = usePackages()
  
  const packagesRaw = packagesResponse?.data || packagesResponse
  const packages = packagesRaw?.data || packagesRaw || []
  
  const services = servicesData?.items || servicesData?.data || servicesData || []
  const createService = useCreateLabService()
  const updateService = useUpdateLabService()
  const deleteService = useDeleteLabService()

  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    labPrice: "",
    turnaroundTime: "",
    packageId: "",
  })

  const filteredServices = Array.isArray(services) ? services.filter((s: any) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  const handleOpenAddModal = () => {
    setEditingService(null)
    setFormData({ name: "", description: "", category: "", labPrice: "", turnaroundTime: "", packageId: "" })
    setIsAddModalOpen(true)
  }

  const handleOpenEditModal = (service: any) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || "",
      category: service.category,
      labPrice: service.labPrice.toString(),
      turnaroundTime: service.turnaroundTime,
      packageId: service.packageId || "",
    })
    setIsAddModalOpen(true)
  }

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || !formData.labPrice || !formData.turnaroundTime) {
      toast.error("Please fill all required fields")
      return
    }

    const payload = {
      ...formData,
      labPrice: parseFloat(formData.labPrice)
    }

    try {
      if (editingService) {
        await updateService.mutateAsync({ id: editingService._id, data: payload })
        toast.success("Service updated successfully. Awaiting admin approval.")
      } else {
        await createService.mutateAsync(payload)
        toast.success("Service added successfully. Awaiting admin approval.")
      }
      setIsAddModalOpen(false)
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save service")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteService.mutateAsync(id)
        toast.success("Service deleted")
      } catch (err) {
        toast.error("Failed to delete service")
      }
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-md text-[11px] font-bold uppercase flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Pending</span>
      case 'APPROVED': return <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded-md text-[11px] font-bold uppercase flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3" /> Approved</span>
      case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded-md text-[11px] font-bold uppercase flex items-center gap-1 w-max"><AlertCircle className="w-3 h-3" /> Rejected</span>
      default: return null
    }
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1280px] mx-auto animate-fade-in-up">
      {/* PAGE HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-1">
            Services Catalog
          </h1>
          <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">
            Manage the tests and services your laboratory offers to CareVo clients.
          </p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <Input
              placeholder="Search services by name or category..."
              className="pl-9 h-10 text-sm focus:border-[var(--color-forest)] transition-all shadow-sm rounded-lg bg-white border-[var(--color-border)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenAddModal} className="w-full sm:w-auto bg-[var(--color-forest)] hover:bg-[var(--color-forest-mid)] text-white gap-2 h-10 px-4 rounded-lg shadow-sm">
            <Plus className="h-4 w-4" /> Add New Service
          </Button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-sans text-base font-semibold text-[var(--color-text-primary)]">
            Catalog Entries
          </h2>
          <div className="text-sm text-[var(--color-text-muted)]">
            Total Services: <strong className="text-[var(--color-text-primary)]">{filteredServices.length}</strong>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-gray-50/50">
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Service Name</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Category</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Your Price (GHS)</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Platform Price</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">TAT</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-[24px] py-[64px] text-center text-muted-foreground flex justify-center items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" /> Loading services...
                  </td>
                </tr>
              ) : filteredServices.length > 0 ? (
                filteredServices.map((service: any) => (
                  <tr key={service._id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-[24px] py-[20px]">
                      <div className="font-medium text-[var(--color-text-primary)]">{service.name}</div>
                      {service.description && <div className="text-[12px] text-[var(--color-text-muted)] mt-1 truncate max-w-[250px]">{service.description}</div>}
                    </td>
                    <td className="px-[24px] py-[20px] font-medium text-[var(--color-text-secondary)]">{service.category}</td>
                    <td className="px-[24px] py-[20px] font-medium">₵{service.labPrice.toFixed(2)}</td>
                    <td className="px-[24px] py-[20px] font-medium text-[var(--color-forest)]">
                      {service.approvalStatus === 'APPROVED' ? `₵${service.platformPrice.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-[24px] py-[20px] text-[14px] text-[var(--color-text-secondary)]">{service.turnaroundTime}</td>
                    <td className="px-[24px] py-[20px]">
                      {renderStatusBadge(service.approvalStatus)}
                    </td>
                    <td className="px-[24px] py-[20px] text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(service)} className="h-8 w-8 text-gray-500 hover:text-[var(--color-forest)]">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(service._id)} className="h-8 w-8 text-gray-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-[24px] py-[64px] text-center">
                    <div className="flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                      <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <AlertCircle className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="font-medium text-[16px] text-gray-600">No services found</p>
                      <p className="text-[14px] text-gray-400 mt-1">Click "Add New Service" to start building your catalog.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-[var(--color-forest)]">
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveService} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="packageId">Link to Platform Package (Optional)</Label>
              <select
                id="packageId"
                className="flex h-[40px] w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.packageId}
                onChange={(e) => {
                  const pkgId = e.target.value
                  const pkg = packages.find((p: any) => p._id === pkgId || p.id === pkgId)
                  if (pkg) {
                    setFormData({
                      ...formData,
                      packageId: pkgId,
                      name: pkg.name,
                      category: pkg.pillarIcon,
                    })
                  } else {
                    setFormData({ ...formData, packageId: pkgId })
                  }
                }}
              >
                <option value="">-- No Package Link --</option>
                {packages.map((pkg: any) => (
                  <option key={pkg._id || pkg.id} value={pkg._id || pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
              <p className="text-[12px] text-gray-500">If linked, this service will appear to clients when they book this package.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Service Name <span className="text-red-500">*</span></Label>
              <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Comprehensive Lipid Panel" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
              <Input id="category" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Cardiology, Hematology..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Your Price (GHS) <span className="text-red-500">*</span></Label>
                <Input id="price" type="number" min="0" step="0.01" required value={formData.labPrice} onChange={(e) => setFormData({...formData, labPrice: e.target.value})} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tat">Turnaround Time <span className="text-red-500">*</span></Label>
                <Input id="tat" required value={formData.turnaroundTime} onChange={(e) => setFormData({...formData, turnaroundTime: e.target.value})} placeholder="e.g. 24 Hours, 2 Days" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Provide any patient preparation instructions or details..." 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[var(--color-forest)] hover:bg-[var(--color-forest-mid)] text-white">
                {editingService ? "Update Service" : "Submit for Approval"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
