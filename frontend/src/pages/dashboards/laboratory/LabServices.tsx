import { useState } from "react"
import { Search, Plus, Trash2, RefreshCw, Loader2, MessageSquare, TestTube, ArrowLeft } from "lucide-react"
import { useLabServices, useCreateLabService, useUpdateLabService, useDeleteLabService } from "@/hooks/useLabServices"
import { usePackages } from "@/hooks/usePackages"
import { useCategories } from "@/hooks/useCategories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { Check, DownloadCloud, X } from "lucide-react"

export function LabServices() {
  const { data: servicesData, isLoading } = useLabServices()
  const { data: packagesResponse } = usePackages()
  const { data: categoriesResponse } = useCategories('LAB_SERVICES')
  
  const packagesRaw = packagesResponse?.data || packagesResponse
  const packages = packagesRaw?.data || packagesRaw || []

  const categoriesData = categoriesResponse?.data || categoriesResponse
  let categories = Array.isArray(categoriesData) ? categoriesData : []
  
  if (categories.length === 0) {
    categories = [
      { _id: 'c1', name: 'General Health' },
      { _id: 'c2', name: 'Infectious Disease' },
      { _id: 'c3', name: 'Sexual Health' },
      { _id: 'c4', name: 'Chronic Disease' },
      { _id: 'c5', name: 'Specialized' },
    ]
  }
  
  const services = servicesData?.items || servicesData?.data || servicesData || []
  
  const createService = useCreateLabService()
  const updateService = useUpdateLabService()
  const deleteService = useDeleteLabService()
  
  const isPending = createService.isPending || updateService.isPending

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<any>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  
  // Bulk Import State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [bulkSelections, setBulkSelections] = useState<Record<string, { price: string, turnaroundTime: string, selected: boolean }>>({})

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

  const handleAddNew = () => {
    setSelectedService(null)
    setIsAddingNew(true)
    setFormData({ name: "", description: "", category: categories[0]?.name || "", labPrice: "", turnaroundTime: "", packageId: "" })
  }

  const handleSelectService = (service: any) => {
    setIsAddingNew(false)
    setSelectedService(service)
    setFormData({
      name: service.name,
      description: service.description || "",
      category: service.category,
      labPrice: service.labPrice.toString(),
      turnaroundTime: service.turnaroundTime,
      packageId: service.packageId || "",
    })
  }

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || !formData.labPrice || !formData.turnaroundTime) {
      toast.error("Please fill all required fields")
      return
    }

    const payload: any = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      turnaroundTime: formData.turnaroundTime,
      labPrice: parseFloat(formData.labPrice)
    }
    
    if (formData.packageId) {
      payload.packageId = formData.packageId
    }

    try {
      if (selectedService && !isAddingNew) {
        await updateService.mutateAsync({ id: selectedService._id, data: payload })
        toast.success("Service updated successfully. Awaiting admin approval.")
      } else {
        await createService.mutateAsync(payload)
        toast.success("Service added successfully. Awaiting admin approval.")
        setIsAddingNew(false)
      }
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
        if (selectedService?._id === id) {
          setSelectedService(null)
        }
      } catch (err) {
        toast.error("Failed to delete service")
      }
    }
  }

  const handleBulkSubmit = async () => {
    const selectedKeys = Object.keys(bulkSelections).filter(k => bulkSelections[k].selected)
    if (selectedKeys.length === 0) {
      toast.error("Please select at least one test.")
      return
    }

    try {
      await Promise.all(selectedKeys.map(async (pkgId) => {
        const pkg = packages.find((p: any) => (p._id || p.id) === pkgId)
        if (!pkg) return

        const selection = bulkSelections[pkgId]
        await createService.mutateAsync({
          packageId: pkgId,
          name: pkg.name,
          description: pkg.description || "",
          category: pkg.category || "",
          turnaroundTime: selection.turnaroundTime || pkg.turnaroundTime || "24 hours",
          labPrice: parseFloat(selection.price) || 0
        })
      }))
      toast.success("Import successful. Awaiting admin approval.")
      setIsBulkImportOpen(false)
      setBulkSelections({})
    } catch (err: any) {
      toast.error("An error occurred during bulk import.")
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded text-[10px] font-bold uppercase tracking-wider">Pending</span>
      case 'APPROVED': return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase tracking-wider">Approved</span>
      case 'REJECTED': return <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded text-[10px] font-bold uppercase tracking-wider">Rejected</span>
      default: return null
    }
  }

  // --- 2-Pane Layout ---
  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--color-lims-bg)]">
      
      {/* LEFT PANE: CATALOG LIST */}
      <div className={`shrink-0 h-full w-full md:w-[380px] bg-white border-r border-[var(--color-lims-border)] flex flex-col z-20 shadow-sm ${(selectedService || isAddingNew) ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-[var(--color-lims-border)] bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-bold text-[var(--color-lims-text)] font-sans flex items-center gap-2">
                <TestTube className="h-5 w-5 text-[var(--color-lims-accent)]" />
                Service Catalog
              </h2>
              <p className="text-[12px] text-[var(--color-lims-text-muted)] mt-1">Manage tests your lab offers</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button 
                onClick={() => {
                  setBulkSelections({});
                  setIsBulkImportOpen(true);
                }} 
                variant="outline"
                className="h-8 px-2.5 text-[12px] bg-white text-[var(--color-lims-text)] hover:text-[var(--color-lims-accent)] border-[var(--color-lims-border)] shadow-sm"
                title="Import from Global Catalog"
              >
                <DownloadCloud className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                onClick={handleAddNew}
                className="bg-[var(--color-lims-accent)] hover:bg-[var(--color-lims-accent)]/90 text-white h-8 text-[12px] shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Service
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-[13px] bg-white border border-[var(--color-lims-border)] rounded-md focus:outline-none focus:border-[var(--color-lims-accent)] focus:ring-1 focus:ring-[var(--color-lims-accent)] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
              <RefreshCw className="h-5 w-5 animate-spin mb-2" />
              <span className="text-[12px]">Loading catalog...</span>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <TestTube className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-[13px] font-medium text-gray-600">No services found</p>
              <p className="text-[12px] text-gray-400 mt-1">Click "Add Service" to opt into system tests.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-lims-border)]">
              {filteredServices.map((service: any) => {
                const isSelected = selectedService?._id === service._id && !isAddingNew
                return (
                  <div
                    key={service._id}
                    onClick={() => handleSelectService(service)}
                    className={`p-4 cursor-pointer transition-colors group relative ${
                      isSelected 
                        ? 'bg-[var(--color-lims-accent)]/5' 
                        : 'hover:bg-gray-50/80 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-lims-accent)]" />
                    )}
                    
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="font-semibold text-[13px] text-[var(--color-lims-text)] line-clamp-1 pr-2">
                        {service.name}
                      </div>
                      <div className="shrink-0">{renderStatusBadge(service.approvalStatus)}</div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-lims-text-muted)]">
                      <span className="font-medium bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{service.category}</span>
                      <span className="font-mono font-medium text-[var(--color-lims-accent)]">₵{service.labPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: DETAILS / FORM */}
      <div className={`flex-1 flex flex-col min-w-0 ${(!selectedService && !isAddingNew) ? 'hidden md:flex' : 'flex'}`}>
        {(!selectedService && !isAddingNew) ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--color-lims-border)] mb-4">
              <TestTube className="h-6 w-6 text-gray-300" />
            </div>
            <h3 className="text-[16px] font-bold text-gray-700 mb-2">Service Configuration</h3>
            <p className="text-[13px] text-gray-500 max-w-sm">
              Select a service from the catalog to view details or edit pricing, or add a new service to your offerings.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-white m-4 md:m-6 rounded-lg border border-[var(--color-lims-border)] shadow-sm overflow-hidden animate-fade-in-up">
            {/* Right Pane Header */}
            <div className="shrink-0 h-[60px] border-b border-[var(--color-lims-border)] px-6 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden -ml-2 text-[var(--color-lims-text-muted)]"
                  onClick={() => { setSelectedService(null); setIsAddingNew(false) }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h3 className="text-[15px] font-bold text-[var(--color-lims-text)]">
                  {isAddingNew ? "Add New Service" : "Edit Service Details"}
                </h3>
              </div>
              
              {!isAddingNew && selectedService && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-[12px]"
                  onClick={() => handleDelete(selectedService._id)}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Remove
                </Button>
              )}
            </div>

            {/* Right Pane Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              
              {selectedService?.adminComment && (
                <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-[12px] uppercase mb-1">
                    <MessageSquare className="h-4 w-4" /> Admin Review Note
                  </div>
                  <p className="text-[13px] text-amber-900 leading-relaxed">
                    {selectedService.adminComment}
                  </p>
                </div>
              )}

              <form onSubmit={handleSaveService} className="max-w-2xl space-y-6">
                
                {/* Global Test Selection */}
                <div className="space-y-2 p-4 bg-[var(--color-lims-bg)] border border-[var(--color-lims-border)] rounded-md">
                  <Label htmlFor="packageId" className="text-[13px] font-bold text-[var(--color-lims-text)] flex items-center gap-1.5">
                    Link to System Test Panel <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-[12px] text-[var(--color-lims-text-muted)] mb-3">
                    Select the global test panel you wish to offer. The name and category will be auto-filled.
                  </p>
                  <select
                    id="packageId"
                    required
                    className="w-full h-[38px] rounded border border-[var(--color-lims-border)] bg-white px-3 text-[13px] shadow-sm focus:border-[var(--color-lims-accent)] focus:ring-1 focus:ring-[var(--color-lims-accent)] outline-none transition-all"
                    value={formData.packageId}
                    onChange={(e) => {
                      const pkgId = e.target.value
                      const pkg = packages.find((p: any) => (p._id || p.id) === pkgId)
                      if (pkg) {
                        setFormData({
                          ...formData,
                          packageId: pkgId,
                          name: pkg.name,
                          category: pkg.category || formData.category,
                        })
                      } else {
                        setFormData({ ...formData, packageId: pkgId })
                      }
                    }}
                  >
                    <option value="">-- Choose a System Test Panel --</option>
                    {packages.map((pkg: any) => (
                      <option key={pkg._id || pkg.id} value={pkg._id || pkg.id}>
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-bold text-[var(--color-lims-text-muted)] uppercase">Service Display Name</Label>
                    <Input 
                      required 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      className="h-[38px] text-[13px] bg-gray-50/50" 
                      placeholder="e.g. Complete Blood Count"
                      readOnly={!!formData.packageId} 
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-bold text-[var(--color-lims-text-muted)] uppercase">Category</Label>
                    <select
                      required
                      className="w-full h-[38px] rounded border border-[var(--color-lims-border)] bg-gray-50/50 px-3 text-[13px] shadow-sm outline-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      disabled={!!formData.packageId}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat: any) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-bold text-[var(--color-lims-text-muted)] uppercase">Your Price (GHS) <span className="text-red-500">*</span></Label>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      required 
                      value={formData.labPrice} 
                      onChange={(e) => setFormData({...formData, labPrice: e.target.value})} 
                      className="h-[38px] text-[13px] font-mono" 
                      placeholder="0.00" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-bold text-[var(--color-lims-text-muted)] uppercase">Turnaround Time <span className="text-red-500">*</span></Label>
                    <Input 
                      required 
                      value={formData.turnaroundTime} 
                      onChange={(e) => setFormData({...formData, turnaroundTime: e.target.value})} 
                      className="h-[38px] text-[13px]" 
                      placeholder="e.g. 24 Hours, 2 Days" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px] font-bold text-[var(--color-lims-text-muted)] uppercase">Description & Instructions</Label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder="Provide any patient preparation instructions or internal details..." 
                    className="w-full min-h-[100px] rounded border border-[var(--color-lims-border)] bg-white p-3 text-[13px] shadow-sm focus:border-[var(--color-lims-accent)] focus:ring-1 focus:ring-[var(--color-lims-accent)] outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-6 border-t border-[var(--color-lims-border)] flex justify-end gap-3">
                  <Button 
                    type="submit" 
                    disabled={isPending} 
                    className="bg-[var(--color-lims-accent)] hover:bg-[var(--color-lims-accent)]/90 text-white h-[38px] px-6 text-[13px] shadow-sm"
                  >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isAddingNew ? "Submit for Approval" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* BULK IMPORT MODAL */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DownloadCloud className="h-5 w-5 text-[var(--color-lims-accent)]" />
                  Import from Global Catalog
                </h2>
                <p className="text-xs text-gray-500 mt-1">Select the tests you offer and instantly attach your laboratory.</p>
              </div>
              <button 
                onClick={() => setIsBulkImportOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 sticky top-0 z-10 text-[11px] uppercase tracking-wider text-gray-500 font-semibold shadow-sm">
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-100">Select</th>
                    <th className="px-6 py-3 border-b border-gray-100">Test Name / Category</th>
                    <th className="px-6 py-3 border-b border-gray-100 w-32">Lab Price (₵)</th>
                    <th className="px-6 py-3 border-b border-gray-100 w-40">Turnaround Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {packages.map((pkg: any) => {
                    const id = pkg._id || pkg.id;
                    const isSelected = bulkSelections[id]?.selected || false;
                    
                    // Check if already offered (we check if any existing service has this packageId)
                    const alreadyOffered = services.some((s: any) => s.packageId === id);

                    return (
                      <tr 
                        key={id} 
                        className={`transition-colors ${alreadyOffered ? 'bg-gray-50/50 opacity-60' : isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-6 py-4">
                          {alreadyOffered ? (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-max">
                              <Check className="h-3 w-3" /> Attached
                            </div>
                          ) : (
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 rounded border-gray-300 text-[var(--color-lims-accent)] focus:ring-[var(--color-lims-accent)]"
                              checked={isSelected}
                              onChange={(e) => {
                                setBulkSelections(prev => ({
                                  ...prev,
                                  [id]: {
                                    ...prev[id],
                                    selected: e.target.checked,
                                    price: prev[id]?.price || "",
                                    turnaroundTime: prev[id]?.turnaroundTime || pkg.turnaroundTime || "24 hours"
                                  }
                                }))
                              }}
                            />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[13px] text-gray-900">{pkg.name}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{pkg.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={!isSelected || alreadyOffered}
                            value={bulkSelections[id]?.price || ""}
                            onChange={(e) => {
                              setBulkSelections(prev => ({
                                ...prev,
                                [id]: { ...prev[id], price: e.target.value }
                              }))
                            }}
                            className="h-8 text-[13px]"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input 
                            type="text"
                            placeholder="e.g. 24 hours"
                            disabled={!isSelected || alreadyOffered}
                            value={bulkSelections[id]?.turnaroundTime || ""}
                            onChange={(e) => {
                              setBulkSelections(prev => ({
                                ...prev,
                                [id]: { ...prev[id], turnaroundTime: e.target.value }
                              }))
                            }}
                            className="h-8 text-[13px]"
                          />
                        </td>
                      </tr>
                    )
                  })}
                  {packages.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-[13px]">
                        No global packages available in the system yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
              <div className="text-[12px] text-gray-500 font-medium">
                {Object.values(bulkSelections).filter(s => s.selected).length} test(s) selected
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-[13px]" onClick={() => setIsBulkImportOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleBulkSubmit}
                  disabled={createService.isPending || Object.values(bulkSelections).filter(s => s.selected).length === 0}
                  className="bg-[var(--color-lims-accent)] hover:bg-[var(--color-lims-accent)]/90 text-white shadow-sm text-[13px] px-6"
                >
                  {createService.isPending ? "Importing..." : "Import Selected Tests"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

