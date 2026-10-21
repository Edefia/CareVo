import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, Plus, Package as PackageIcon, Edit, Trash2, CheckCircle, XCircle, Loader2, FlaskConical, Clock, Building2, ShieldCheck, CheckSquare, XSquare, Tag, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { usePackages, useCreatePackage, useUpdatePackage, useDeletePackage } from "@/hooks/usePackages"
import { useAdminLabServices, useUpdateLabServiceStatus } from "@/hooks/useLabServices"
import { useCategories, useAllCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories"

import toast from "react-hot-toast"

export function PackageManagement() {
  const [searchParams] = useSearchParams()
  const initialLabId = searchParams.get("labId")
  
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'LAB_SERVICES' | 'CATEGORIES'>(initialLabId ? 'LAB_SERVICES' : 'GLOBAL')
  const [selectedLabId] = useState<string>(initialLabId || "all")
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<any>(null)
  
  // Approval Comment Dialog
  const [approvalDialog, setApprovalDialog] = useState<{
    isOpen: boolean;
    service: any;
    status: 'APPROVED' | 'REJECTED';
    comment: string;
  }>({
    isOpen: false,
    service: null,
    status: 'APPROVED',
    comment: '',
  })

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    appliesTo: ["PACKAGES", "LAB_SERVICES"],
  })
  
  // Confirm Dialog State
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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    testsIncluded: "",
    isActive: true,
    turnaroundTime: ""
  })

  // Data fetching
  const { data: packagesResponse, isLoading: pkgsLoading } = usePackages()
  const createMutation = useCreatePackage()
  const updateMutation = useUpdatePackage()
  const deleteMutation = useDeletePackage()

  // Categories
  const { data: categoriesResponse } = useCategories()
  const { data: allCategoriesResponse, isLoading: categoriesLoading } = useAllCategories()
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  const categoriesData = categoriesResponse?.data || categoriesResponse
  const categories = Array.isArray(categoriesData) ? categoriesData : []

  const allCategoriesData = allCategoriesResponse?.data || allCategoriesResponse
  const allCategories = Array.isArray(allCategoriesData) ? allCategoriesData : []

  const packagesData = packagesResponse?.data || packagesResponse
  const packages = packagesData?.data || packagesData || []
  const filteredPackages = Array.isArray(packages) ? packages.filter((p: any) => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  // Lab Services
  const { data: labServicesData, isLoading: labServicesLoading } = useAdminLabServices(selectedLabId !== "all" ? { laboratoryId: selectedLabId } : undefined)
  const updateServiceStatus = useUpdateLabServiceStatus()
  const labServices = labServicesData?.items || labServicesData?.data || labServicesData || []
  
  const filteredLabServices = Array.isArray(labServices) ? labServices.filter((s: any) => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.laboratoryId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  // --- Handlers for Global Packages ---
  const handleOpenModal = (pkg: any = null) => {
    if (pkg) {
      setEditingPackage(pkg)
      setFormData({
        name: pkg.name,
        description: pkg.description,
        category: pkg.category || "",
        testsIncluded: Array.isArray(pkg.testsIncluded) ? pkg.testsIncluded.join(", ") : (pkg.testsIncluded || ""),
        isActive: pkg.isActive,
        turnaroundTime: pkg.turnaroundTime || ""
      })
    } else {
      setEditingPackage(null)
      setFormData({
        name: "", description: "", category: categories[0]?.name || "", testsIncluded: "", isActive: true, turnaroundTime: ""
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      ...formData,
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

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Package",
      description: "Are you sure you want to delete this global package? This action cannot be undone.",
      destructive: true,
      confirmText: "Delete",
      action: async () => {
        try {
          await deleteMutation.mutateAsync(id)
          toast.success("Package deleted successfully")
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Failed to delete package")
        }
      }
    })
  }

  const handleToggleStatus = async (pkg: any) => {
    try {
      await updateMutation.mutateAsync({ id: pkg._id, data: { isActive: !pkg.isActive } })
      toast.success(`Package ${pkg.isActive ? 'deactivated' : 'activated'} successfully`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update package status")
    }
  }

  // --- Handlers for Lab Services ---
  const handleOpenApprovalDialog = (service: any, status: 'APPROVED' | 'REJECTED') => {
    setApprovalDialog({
      isOpen: true,
      service,
      status,
      comment: '',
    })
  }

  const handleSubmitApproval = async () => {
    try {
      await updateServiceStatus.mutateAsync({
        id: approvalDialog.service._id,
        data: {
          approvalStatus: approvalDialog.status,
          adminComment: approvalDialog.comment || undefined,
        }
      })
      const actionLabel =
        approvalDialog.status === 'APPROVED'
          ? 'approved'
          : approvalDialog.service?.approvalStatus === 'APPROVED'
            ? 'revoked'
            : 'rejected'
      toast.success(`Service ${actionLabel}. The laboratory has been notified by email.`)
      setApprovalDialog({ isOpen: false, service: null, status: 'APPROVED', comment: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update service status")
    }
  }

  // --- Category Handlers ---
  const handleOpenCategoryModal = (cat: any = null) => {
    if (cat) {
      setEditingCategory(cat)
      setCategoryForm({
        name: cat.name,
        description: cat.description || "",
        appliesTo: cat.appliesTo || ["PACKAGES", "LAB_SERVICES"],
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: "", description: "", appliesTo: ["PACKAGES", "LAB_SERVICES"] })
    }
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({ id: editingCategory._id, data: categoryForm })
        toast.success("Category updated")
      } else {
        await createCategoryMutation.mutateAsync(categoryForm)
        toast.success("Category created")
      }
      setIsCategoryModalOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save category")
    }
  }

  const handleDeleteCategory = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Category",
      description: "Are you sure you want to delete this category?",
      destructive: true,
      confirmText: "Delete",
      action: async () => {
        try {
          await deleteCategoryMutation.mutateAsync(id)
          toast.success("Category deleted")
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Failed to delete category")
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Package & Service Management</h2>
          <p className="text-muted-foreground">Manage global health packages, review laboratory-submitted services, and configure categories.</p>
        </div>
        <div className="mt-4 md:mt-0">
          {activeTab === 'GLOBAL' && (
            <Button className="flex items-center gap-2" onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4" />
              Create Package
            </Button>
          )}
          {activeTab === 'CATEGORIES' && (
            <Button className="flex items-center gap-2" onClick={() => handleOpenCategoryModal()}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          )}
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-lg w-max flex-wrap">
        <Button 
          variant={activeTab === 'GLOBAL' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('GLOBAL')}
          className={activeTab === 'GLOBAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}
        >
          <PackageIcon className="w-4 h-4 mr-2" /> Global Packages
        </Button>
        <Button 
          variant={activeTab === 'LAB_SERVICES' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('LAB_SERVICES')}
          className={activeTab === 'LAB_SERVICES' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}
        >
          <FlaskConical className="w-4 h-4 mr-2" /> Lab Service Queue
          {labServices.filter((s: any) => s.approvalStatus === 'PENDING').length > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-[11px] font-bold">
              {labServices.filter((s: any) => s.approvalStatus === 'PENDING').length}
            </span>
          )}
        </Button>
        <Button 
          variant={activeTab === 'CATEGORIES' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('CATEGORIES')}
          className={activeTab === 'CATEGORIES' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}
        >
          <Tag className="w-4 h-4 mr-2" /> Categories
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>
              {activeTab === 'GLOBAL' ? 'All Health Packages' : activeTab === 'LAB_SERVICES' ? 'Laboratory Submitted Services' : 'Service Categories'}
            </CardTitle>
            {activeTab !== 'CATEGORIES' && (
              <div className="flex items-center gap-2">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={activeTab === 'GLOBAL' ? "Search packages by name..." : "Search services or labs..."}
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'GLOBAL' ? (
            pkgsLoading ? (
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
                    cell: (row) => <span className="text-sm font-medium">{row.category || '—'}</span>
                  },
                  { 
                    header: "Tests Included", 
                    cell: (row) => <span className="text-sm text-muted-foreground">{Array.isArray(row.testsIncluded) ? row.testsIncluded.length : 0} tests</span>
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
                        <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-700" onClick={() => handleOpenModal(row)} title="Edit Package">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-amber-50 hover:text-amber-700" onClick={() => handleToggleStatus(row)} title={row.isActive ? "Deactivate" : "Activate"}>
                          {row.isActive ? <XCircle className="h-4 w-4 text-amber-600" /> : <CheckCircle className="h-4 w-4 text-emerald-600" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(row._id)} title="Delete Package" disabled={deleteMutation.isPending}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )
                  },
                ]}
                data={filteredPackages}
              />
            )
          ) : activeTab === 'LAB_SERVICES' ? (
            // LAB SERVICES TAB
            labServicesLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
            ) : (
              <DataTable 
                columns={[
                  { 
                    header: "Laboratory", 
                    cell: (row) => (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">{row.laboratoryId?.name || 'Unknown Lab'}</span>
                      </div>
                    ) 
                  },
                  { 
                    header: "Service Details", 
                    cell: (row) => (
                      <div>
                        <div className="font-medium text-slate-800">{row.name}</div>
                        <div className="text-[12px] text-slate-500">{row.category}</div>
                      </div>
                    ) 
                  },
                  { 
                    header: "Lab Price", 
                    cell: (row) => <span className="font-bold text-slate-600">GHS {row.labPrice?.toFixed(2)}</span>
                  },
                  { 
                    header: "Platform Price", 
                    cell: (row) => <span className="font-bold text-emerald-600">GHS {row.platformPrice?.toFixed(2)}</span>
                  },
                  { 
                    header: "Turnaround", 
                    cell: (row) => <span className="text-sm">{row.turnaroundTime}</span>
                  },
                  { 
                    header: "Approval", 
                    cell: (row) => {
                      if (row.approvalStatus === 'APPROVED') return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-bold uppercase flex items-center gap-1 w-max"><ShieldCheck className="w-3 h-3" /> Approved</span>
                      if (row.approvalStatus === 'REJECTED') return <span className="px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded-md text-[11px] font-bold uppercase flex items-center gap-1 w-max"><XCircle className="w-3 h-3" /> Rejected</span>
                      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-md text-[11px] font-bold uppercase flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Pending Review</span>
                    }
                  },
                  { 
                    header: "Actions", 
                    cell: (row) => (
                      <div className="flex items-center gap-2">
                        {row.approvalStatus === 'PENDING' && (
                          <>
                            <Button variant="outline" size="sm" className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800" onClick={() => handleOpenApprovalDialog(row, 'APPROVED')} disabled={updateServiceStatus.isPending}>
                              <CheckSquare className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => handleOpenApprovalDialog(row, 'REJECTED')} disabled={updateServiceStatus.isPending}>
                              <XSquare className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {row.approvalStatus === 'APPROVED' && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleOpenApprovalDialog(row, 'REJECTED')} disabled={updateServiceStatus.isPending}>
                            Revoke
                          </Button>
                        )}
                        {row.approvalStatus === 'REJECTED' && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => handleOpenApprovalDialog(row, 'APPROVED')} disabled={updateServiceStatus.isPending}>
                            Approve
                          </Button>
                        )}
                        {row.adminComment && (
                          <span title={row.adminComment} className="text-slate-400 cursor-help">
                            <MessageSquare className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    )
                  },
                ]}
                data={filteredLabServices}
              />
            )
          ) : (
            // CATEGORIES TAB
            categoriesLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
            ) : allCategories.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium text-lg text-gray-600">No categories yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first category to organize packages and lab services.</p>
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    header: "Category Name",
                    cell: (row) => (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 shrink-0">
                          <Tag className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{row.name}</div>
                          {row.description && <div className="text-xs text-muted-foreground truncate max-w-[250px]">{row.description}</div>}
                        </div>
                      </div>
                    )
                  },
                  {
                    header: "Applies To",
                    cell: (row) => (
                      <div className="flex flex-wrap gap-1">
                        {(row.appliesTo || []).map((a: string) => (
                          <span key={a} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">{a.replace('_', ' ')}</span>
                        ))}
                      </div>
                    )
                  },
                  {
                    header: "Status",
                    cell: (row) => <StatusBadge status={row.isActive ? "ACTIVE" : "INACTIVE"} />
                  },
                  {
                    header: "Actions",
                    cell: (row) => (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="hover:bg-blue-50" onClick={() => handleOpenCategoryModal(row)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-red-50" onClick={() => handleDeleteCategory(row._id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )
                  },
                ]}
                data={allCategories}
              />
            )
          )}
        </CardContent>
      </Card>

      {/* Global Package Modal */}
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
                  <option value="">Select a category</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
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

            <div className="space-y-2">
              <Label>Estimated Turnaround Time</Label>
              <Input value={formData.turnaroundTime} onChange={e => setFormData({...formData, turnaroundTime: e.target.value})} placeholder="e.g. 24-48 hours" />
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
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPackage ? "Update Package" : "Save Package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approval Comment Dialog */}
      <Dialog open={approvalDialog.isOpen} onOpenChange={(open) => setApprovalDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[480px] gap-0 overflow-hidden rounded-[var(--radius-lg)] border-[var(--color-border)] p-0">
          <div className="px-6 pt-6 pb-2">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full border ${
                approvalDialog.status === 'APPROVED'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : 'bg-red-50 border-red-100 text-red-600'
              }`}
            >
              {approvalDialog.status === 'APPROVED' ? (
                <CheckSquare className="h-6 w-6" />
              ) : (
                <XSquare className="h-6 w-6" />
              )}
            </div>
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="font-serif text-[22px] font-semibold text-[var(--color-text-primary)]">
                {approvalDialog.status === 'APPROVED'
                  ? 'Approve Service'
                  : approvalDialog.service?.approvalStatus === 'APPROVED'
                    ? 'Revoke Service'
                    : 'Reject Service'}
              </DialogTitle>
              <p className="font-sans text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
                {approvalDialog.status === 'APPROVED'
                  ? 'Confirm approval to go live. The laboratory will receive an email with your comment.'
                  : 'The laboratory will be emailed with your decision and any comment you leave below.'}
              </p>
            </DialogHeader>
          </div>
          <div className="space-y-4 px-6 py-4">
            {approvalDialog.service && (
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <div className="font-sans text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Service</div>
                <div className="font-sans text-[16px] font-semibold text-[var(--color-forest)]">{approvalDialog.service.name}</div>
                <div className="font-sans text-[13px] text-[var(--color-text-secondary)] mt-1">
                  {approvalDialog.service.laboratoryId?.name} · GHS {approvalDialog.service.labPrice?.toFixed(2)}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="adminComment">Admin Comment (Optional)</Label>
              <textarea
                id="adminComment"
                value={approvalDialog.comment}
                onChange={(e) => setApprovalDialog(prev => ({ ...prev, comment: e.target.value }))}
                placeholder={approvalDialog.status === 'APPROVED'
                  ? "e.g. Approved. Pricing looks good. Welcome aboard!"
                  : "e.g. Please revise your pricing to be competitive with market rates."}
                className="flex min-h-[100px] w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:border-[var(--color-forest)] focus-visible:ring-[3px] focus-visible:ring-[rgba(4,47,100,0.12)]"
              />
              <p className="text-[12px] text-[var(--color-text-muted)]">
                This comment is included in the laboratory email and shown in their service dashboard.
              </p>
            </div>
          </div>
          <DialogFooter className="border-t border-[var(--color-border)] bg-[var(--color-off-white)] px-6 py-4 sm:space-x-2">
            <Button variant="outline" onClick={() => setApprovalDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApproval}
              disabled={updateServiceStatus.isPending}
              className={
                approvalDialog.status === 'APPROVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {updateServiceStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {approvalDialog.status === 'APPROVED'
                ? 'Confirm Approval'
                : approvalDialog.service?.approvalStatus === 'APPROVED'
                  ? 'Confirm Revoke'
                  : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input required value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="e.g. General Health, Prenatal, Corporate" />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <textarea value={categoryForm.description} onChange={(e: any) => setCategoryForm({...categoryForm, description: e.target.value})} placeholder="Brief description of this category..." className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.action}
        destructive={confirmDialog.destructive}
        confirmText={confirmDialog.confirmText}
      />
    </div>
  )
}
