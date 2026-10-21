import { useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { 
  Search, 
  Plus, 
  Package as PackageIcon, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FlaskConical, 
  Clock, 
  Building2, 
  ShieldCheck, 
  CheckSquare, 
  XSquare, 
  Tag, 
  MessageSquare,
  ArrowUpDown,
  Filter,
  RotateCcw,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { usePackages, useCreatePackage, useUpdatePackage, useDeletePackage } from "@/hooks/usePackages"
import { useAdminLabServices, useUpdateLabServiceStatus } from "@/hooks/useLabServices"
import { useCategories, useAllCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories"
import { useLaboratories } from "@/hooks/useLaboratories"

import toast from "react-hot-toast"

export function PackageManagement() {
  const [searchParams] = useSearchParams()
  const initialLabId = searchParams.get("labId")
  
  // Default to LAB_SERVICES so admin immediately sees new laboratory requests
  const [activeTab, setActiveTab] = useState<'LAB_SERVICES' | 'GLOBAL' | 'CATEGORIES'>('LAB_SERVICES')
  const [selectedLabId, setSelectedLabId] = useState<string>(initialLabId || "all")
  
  // Filtering & Sorting for Lab Services
  const [labSearch, setLabSearch] = useState("")
  const [labStatusFilter, setLabStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [labCategoryFilter, setLabCategoryFilter] = useState<string>('all')
  const [labSort, setLabSort] = useState<
    'pending-first' | 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'lab-asc' | 'price-asc' | 'price-desc'
  >('pending-first')

  // Filtering & Sorting for Global Packages
  const [pkgSearch, setPkgSearch] = useState("")
  const [pkgCategoryFilter, setPkgCategoryFilter] = useState<string>('all')
  const [pkgStatusFilter, setPkgStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [pkgSort, setPkgSort] = useState<'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'tests-desc' | 'tests-asc'>('name-asc')

  // Filtering & Sorting for Categories
  const [catSearch, setCatSearch] = useState("")
  const [catAppliesToFilter, setCatAppliesToFilter] = useState<'ALL' | 'PACKAGES' | 'LAB_SERVICES'>('ALL')
  const [catStatusFilter, setCatStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [catSort, setCatSort] = useState<'name-asc' | 'name-desc' | 'newest'>('name-asc')

  // Global Package modal state
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

  // Laboratories for lab dropdown filter
  const { data: laboratoriesData } = useLaboratories({ limit: 100 })
  const laboratories = useMemo(() => {
    const list = laboratoriesData?.items || laboratoriesData?.data || (Array.isArray(laboratoriesData) ? laboratoriesData : [])
    return Array.isArray(list) ? list : []
  }, [laboratoriesData])

  // Packages list
  const packagesData = packagesResponse?.data || packagesResponse
  const packages = useMemo(() => {
    const list = packagesData?.data || packagesData || []
    return Array.isArray(list) ? list : []
  }, [packagesData])

  // Lab Services
  const { data: labServicesData, isLoading: labServicesLoading } = useAdminLabServices(
    selectedLabId !== "all" ? { laboratoryId: selectedLabId, limit: 200 } : { limit: 200 }
  )
  const updateServiceStatus = useUpdateLabServiceStatus()
  const labServices = useMemo(() => {
    const list = labServicesData?.items || labServicesData?.data || labServicesData || []
    return Array.isArray(list) ? list : []
  }, [labServicesData])

  // Lab services counts
  const pendingLabCount = useMemo(() => labServices.filter((s: any) => s.approvalStatus === 'PENDING').length, [labServices])
  const approvedLabCount = useMemo(() => labServices.filter((s: any) => s.approvalStatus === 'APPROVED').length, [labServices])
  const rejectedLabCount = useMemo(() => labServices.filter((s: any) => s.approvalStatus === 'REJECTED').length, [labServices])

  // Categories available among lab services
  const availableLabCategories = useMemo(() => {
    const set = new Set<string>()
    labServices.forEach((s: any) => {
      if (s.category) set.add(s.category)
    })
    return Array.from(set).sort()
  }, [labServices])

  // Filtered & Sorted Lab Services
  const processedLabServices = useMemo(() => {
    let result = [...labServices]

    // Search filter
    if (labSearch.trim()) {
      const q = labSearch.toLowerCase()
      result = result.filter((s: any) =>
        s.name?.toLowerCase().includes(q) ||
        s.laboratoryId?.name?.toLowerCase().includes(q) ||
        s.laboratoryId?.code?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (labStatusFilter !== 'ALL') {
      result = result.filter((s: any) => s.approvalStatus === labStatusFilter)
    }

    // Category filter
    if (labCategoryFilter !== 'all') {
      result = result.filter((s: any) => s.category === labCategoryFilter)
    }

    // Sorting
    const getCreatedTime = (s: any) => s.createdAt ? new Date(s.createdAt).getTime() : 0

    result.sort((a: any, b: any) => {
      switch (labSort) {
        case 'pending-first': {
          // Priority 1: PENDING first
          const aPending = a.approvalStatus === 'PENDING' ? 1 : 0
          const bPending = b.approvalStatus === 'PENDING' ? 1 : 0
          if (aPending !== bPending) {
            return bPending - aPending // pending at top
          }
          // Priority 2: Newest created/submitted first
          return getCreatedTime(b) - getCreatedTime(a)
        }
        case 'newest':
          return getCreatedTime(b) - getCreatedTime(a)
        case 'oldest':
          return getCreatedTime(a) - getCreatedTime(b)
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '')
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '')
        case 'lab-asc':
          return (a.laboratoryId?.name || '').localeCompare(b.laboratoryId?.name || '')
        case 'price-asc':
          return (a.platformPrice ?? a.labPrice ?? 0) - (b.platformPrice ?? b.labPrice ?? 0)
        case 'price-desc':
          return (b.platformPrice ?? b.labPrice ?? 0) - (a.platformPrice ?? a.labPrice ?? 0)
        default:
          return 0
      }
    })

    return result
  }, [labServices, labSearch, labStatusFilter, labCategoryFilter, labSort])

  const hasActiveLabFilters = labSearch.trim() !== "" || labStatusFilter !== 'ALL' || selectedLabId !== "all" || labCategoryFilter !== 'all' || labSort !== 'pending-first'

  const resetLabFilters = () => {
    setLabSearch("")
    setLabStatusFilter('ALL')
    setSelectedLabId("all")
    setLabCategoryFilter('all')
    setLabSort('pending-first')
  }

  // Filtered & Sorted Packages
  const processedPackages = useMemo(() => {
    let result = [...packages]

    // Search
    if (pkgSearch.trim()) {
      const q = pkgSearch.toLowerCase()
      result = result.filter((p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        (Array.isArray(p.testsIncluded) && p.testsIncluded.some((t: string) => t.toLowerCase().includes(q)))
      )
    }

    // Category
    if (pkgCategoryFilter !== 'all') {
      result = result.filter((p: any) => p.category === pkgCategoryFilter)
    }

    // Status
    if (pkgStatusFilter !== 'ALL') {
      result = result.filter((p: any) => pkgStatusFilter === 'ACTIVE' ? p.isActive : !p.isActive)
    }

    // Sorting
    const getCreatedTime = (p: any) => p.createdAt ? new Date(p.createdAt).getTime() : 0

    result.sort((a: any, b: any) => {
      switch (pkgSort) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '')
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '')
        case 'newest':
          return getCreatedTime(b) - getCreatedTime(a)
        case 'oldest':
          return getCreatedTime(a) - getCreatedTime(b)
        case 'tests-desc': {
          const aCount = Array.isArray(a.testsIncluded) ? a.testsIncluded.length : 0
          const bCount = Array.isArray(b.testsIncluded) ? b.testsIncluded.length : 0
          return bCount - aCount
        }
        case 'tests-asc': {
          const aCount = Array.isArray(a.testsIncluded) ? a.testsIncluded.length : 0
          const bCount = Array.isArray(b.testsIncluded) ? b.testsIncluded.length : 0
          return aCount - bCount
        }
        default:
          return 0
      }
    })

    return result
  }, [packages, pkgSearch, pkgCategoryFilter, pkgStatusFilter, pkgSort])

  const hasActivePkgFilters = pkgSearch.trim() !== "" || pkgCategoryFilter !== 'all' || pkgStatusFilter !== 'ALL' || pkgSort !== 'name-asc'

  const resetPkgFilters = () => {
    setPkgSearch("")
    setPkgCategoryFilter('all')
    setPkgStatusFilter('ALL')
    setPkgSort('name-asc')
  }

  // Filtered & Sorted Categories
  const processedCategories = useMemo(() => {
    let result = [...allCategories]

    // Search
    if (catSearch.trim()) {
      const q = catSearch.toLowerCase()
      result = result.filter((c: any) =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      )
    }

    // Applies To
    if (catAppliesToFilter !== 'ALL') {
      result = result.filter((c: any) => Array.isArray(c.appliesTo) && c.appliesTo.includes(catAppliesToFilter))
    }

    // Status
    if (catStatusFilter !== 'ALL') {
      result = result.filter((c: any) => catStatusFilter === 'ACTIVE' ? c.isActive : !c.isActive)
    }

    // Sorting
    result.sort((a: any, b: any) => {
      switch (catSort) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '')
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '')
        case 'newest': {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        }
        default:
          return 0
      }
    })

    return result
  }, [allCategories, catSearch, catAppliesToFilter, catStatusFilter, catSort])

  const hasActiveCatFilters = catSearch.trim() !== "" || catAppliesToFilter !== 'ALL' || catStatusFilter !== 'ALL' || catSort !== 'name-asc'

  const resetCatFilters = () => {
    setCatSearch("")
    setCatAppliesToFilter('ALL')
    setCatStatusFilter('ALL')
    setCatSort('name-asc')
  }

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
    <div className="space-y-4">
      {/* Top Header: Tabs & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Swapped Tab Navigation: Lab Service Queue first, then Global Packages, then Categories */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-max flex-wrap gap-1 border border-slate-200/80 shadow-xs">
          <button 
            type="button"
            onClick={() => setActiveTab('LAB_SERVICES')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'LAB_SERVICES'
                ? 'bg-white text-[var(--color-forest)] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-emerald-600" /> 
            <span>Lab Service Queue</span>
            {pendingLabCount > 0 ? (
              <span className="ml-1 flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold shadow-xs animate-pulse">
                {pendingLabCount}
              </span>
            ) : (
              <span className="ml-1 text-xs text-slate-400 font-normal">
                ({labServices.length})
              </span>
            )}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('GLOBAL')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'GLOBAL'
                ? 'bg-white text-[var(--color-forest)] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <PackageIcon className="w-4 h-4 text-blue-600" /> 
            <span>Global Packages</span>
            <span className="ml-1 text-xs text-slate-400 font-normal">
              ({packages.length})
            </span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('CATEGORIES')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'CATEGORIES'
                ? 'bg-white text-[var(--color-forest)] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Tag className="w-4 h-4 text-purple-600" /> 
            <span>Categories</span>
            <span className="ml-1 text-xs text-slate-400 font-normal">
              ({allCategories.length})
            </span>
          </button>
        </div>

        {/* Action / Quick notification buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'LAB_SERVICES' && pendingLabCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingLabCount} new request{pendingLabCount > 1 ? 's' : ''} awaiting review</span>
            </div>
          )}
          {activeTab === 'GLOBAL' && (
            <Button className="flex items-center gap-2 bg-[var(--color-forest)] hover:bg-[var(--color-forest)]/90 text-white shadow-xs" onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4" />
              Create Package
            </Button>
          )}
          {activeTab === 'CATEGORIES' && (
            <Button className="flex items-center gap-2 bg-[var(--color-forest)] hover:bg-[var(--color-forest)]/90 text-white shadow-xs" onClick={() => handleOpenCategoryModal()}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-xs border-slate-200">
        <CardContent className="p-0">
          {/* TAB 1: LAB SERVICES QUEUE */}
          {activeTab === 'LAB_SERVICES' && (
            <div>
              {/* Filter and Sort Toolbar */}
              <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 space-y-3">
                {/* Status Grouping Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" /> Status:
                    </span>
                    <button
                      type="button"
                      onClick={() => setLabStatusFilter('ALL')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        labStatusFilter === 'ALL'
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      All ({labServices.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLabStatusFilter('PENDING')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        labStatusFilter === 'PENDING'
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pendingLabCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                      Pending ({pendingLabCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLabStatusFilter('APPROVED')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        labStatusFilter === 'APPROVED'
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Approved ({approvedLabCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLabStatusFilter('REJECTED')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        labStatusFilter === 'REJECTED'
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Rejected ({rejectedLabCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Showing <strong className="text-slate-800">{processedLabServices.length}</strong> of {labServices.length}
                    </span>
                    {hasActiveLabFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetLabFilters}
                        className="text-xs text-slate-600 hover:text-slate-900 h-7 px-2 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset
                      </Button>
                    )}
                  </div>
                </div>

                {/* Search, Lab, Category & Sort Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search service, lab or code..."
                      className="pl-8 text-xs h-9 bg-white" 
                      value={labSearch}
                      onChange={(e) => setLabSearch(e.target.value)}
                    />
                  </div>

                  {/* Laboratory Filter */}
                  <div>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1.5 text-xs text-slate-700 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={selectedLabId}
                      onChange={(e) => setSelectedLabId(e.target.value)}
                    >
                      <option value="all">All Laboratories ({laboratories.length})</option>
                      {laboratories.map((lab: any) => (
                        <option key={lab._id} value={lab._id}>
                          {lab.name} {lab.code ? `(${lab.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1.5 text-xs text-slate-700 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={labCategoryFilter}
                      onChange={(e) => setLabCategoryFilter(e.target.value)}
                    >
                      <option value="all">All Categories ({availableLabCategories.length})</option>
                      {availableLabCategories.map((cat: string) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Selector: Defaults to New Requests First */}
                  <div className="relative">
                    <ArrowUpDown className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={labSort}
                      onChange={(e) => setLabSort(e.target.value as any)}
                    >
                      <option value="pending-first">New Requests (Pending First)</option>
                      <option value="newest">Newest Submitted First</option>
                      <option value="oldest">Oldest Submitted First</option>
                      <option value="name-asc">Service Name (A to Z)</option>
                      <option value="name-desc">Service Name (Z to A)</option>
                      <option value="lab-asc">Laboratory Name (A to Z)</option>
                      <option value="price-desc">Platform Price (High to Low)</option>
                      <option value="price-asc">Platform Price (Low to High)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              {labServicesLoading ? (
                <div className="p-16 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <span className="text-xs text-slate-500">Loading lab services queue...</span>
                </div>
              ) : (
                <DataTable 
                  columns={[
                    { 
                      header: "Laboratory", 
                      cell: (row) => (
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block leading-tight">
                              {row.laboratoryId?.name || 'Unknown Lab'}
                            </span>
                            {row.laboratoryId?.code && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                {row.laboratoryId.code}
                              </span>
                            )}
                          </div>
                        </div>
                      ) 
                    },
                    { 
                      header: "Service Details", 
                      className: "min-w-[280px]",
                      cell: (row) => (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {row.approvalStatus === 'PENDING' && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 inline-block ring-2 ring-amber-200/60" title="Awaiting Review" />
                            )}
                            <span className="font-semibold text-slate-900 text-sm whitespace-nowrap leading-tight">{row.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 whitespace-nowrap leading-none">
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap shrink-0">
                              {row.category}
                            </span>
                            {row.createdAt && (
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                • Submitted {new Date(row.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ) 
                    },
                    { 
                      header: "Lab Price", 
                      cell: (row) => <span className="font-semibold text-slate-600 whitespace-nowrap">GHS {row.labPrice?.toFixed(2)}</span>
                    },
                    { 
                      header: "Platform Price", 
                      cell: (row) => <span className="font-bold text-emerald-700 whitespace-nowrap">GHS {row.platformPrice?.toFixed(2)}</span>
                    },
                    { 
                      header: "Turnaround", 
                      cell: (row) => <span className="text-sm text-slate-700 whitespace-nowrap">{row.turnaroundTime || '—'}</span>
                    },
                    { 
                      header: "Approval", 
                      cell: (row) => {
                        if (row.approvalStatus === 'APPROVED') {
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 w-max leading-tight">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Approved
                            </span>
                          )
                        }
                        if (row.approvalStatus === 'REJECTED') {
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200/80 w-max leading-tight">
                              <XCircle className="w-3 h-3 text-red-600" /> Rejected
                            </span>
                          )
                        }
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80 w-max leading-tight">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending
                          </span>
                        )
                      }
                    },
                    { 
                      header: "Actions", 
                      cell: (row) => (
                        <div className="flex items-center gap-1.5">
                          {row.approvalStatus === 'PENDING' && (
                            <>
                              <button 
                                type="button"
                                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                                onClick={() => handleOpenApprovalDialog(row, 'APPROVED')} 
                                disabled={updateServiceStatus.isPending}
                              >
                                <CheckSquare className="w-3.5 h-3.5 mr-1" /> Approve
                              </button>
                              <button 
                                type="button"
                                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md border border-red-300 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                                onClick={() => handleOpenApprovalDialog(row, 'REJECTED')} 
                                disabled={updateServiceStatus.isPending}
                              >
                                <XSquare className="w-3.5 h-3.5 mr-1" /> Reject
                              </button>
                            </>
                          )}
                          {row.approvalStatus === 'APPROVED' && (
                            <button 
                              type="button"
                              className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50 cursor-pointer border border-transparent hover:border-red-200"
                              onClick={() => handleOpenApprovalDialog(row, 'REJECTED')} 
                              disabled={updateServiceStatus.isPending}
                            >
                              Revoke
                            </button>
                          )}
                          {row.approvalStatus === 'REJECTED' && (
                            <button 
                              type="button"
                              className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors disabled:opacity-50 cursor-pointer border border-transparent hover:border-emerald-200"
                              onClick={() => handleOpenApprovalDialog(row, 'APPROVED')} 
                              disabled={updateServiceStatus.isPending}
                            >
                              Approve
                            </button>
                          )}
                          {row.adminComment && (
                            <span title={`Admin Comment: ${row.adminComment}`} className="text-slate-400 hover:text-slate-600 cursor-help p-1">
                              <MessageSquare className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      )
                    },
                  ]}
                  data={processedLabServices}
                  rowClassName={(row) => row.approvalStatus === 'PENDING' ? 'bg-amber-50/35 hover:bg-amber-50/60' : undefined}
                  emptyState={
                    <div className="p-12 text-center text-muted-foreground">
                      <FlaskConical className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                      <p className="font-semibold text-slate-700">No lab services found</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {hasActiveLabFilters ? "Try clearing or adjusting your search and filter criteria." : "No laboratory services have been submitted yet."}
                      </p>
                      {hasActiveLabFilters && (
                        <Button variant="outline" size="sm" onClick={resetLabFilters} className="mt-4 text-xs">
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  }
                />
              )}
            </div>
          )}

          {/* TAB 2: GLOBAL HEALTH PACKAGES */}
          {activeTab === 'GLOBAL' && (
            <div>
              {/* Filter and Sort Toolbar for Packages */}
              <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Status Grouping Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" /> Status:
                    </span>
                    <button
                      type="button"
                      onClick={() => setPkgStatusFilter('ALL')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        pkgStatusFilter === 'ALL'
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      All ({packages.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPkgStatusFilter('ACTIVE')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        pkgStatusFilter === 'ACTIVE'
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Active ({packages.filter((p: any) => p.isActive).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPkgStatusFilter('INACTIVE')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        pkgStatusFilter === 'INACTIVE'
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Inactive ({packages.filter((p: any) => !p.isActive).length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Showing <strong className="text-slate-800">{processedPackages.length}</strong> of {packages.length}
                    </span>
                    {hasActivePkgFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetPkgFilters}
                        className="text-xs text-slate-600 hover:text-slate-900 h-7 px-2 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset
                      </Button>
                    )}
                  </div>
                </div>

                {/* Search, Category & Sort */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search packages or tests..."
                      className="pl-8 text-xs h-9 bg-white" 
                      value={pkgSearch}
                      onChange={(e) => setPkgSearch(e.target.value)}
                    />
                  </div>

                  <div>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1.5 text-xs text-slate-700 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={pkgCategoryFilter}
                      onChange={(e) => setPkgCategoryFilter(e.target.value)}
                    >
                      <option value="all">All Categories ({categories.length})</option>
                      {categories.map((cat: any) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <ArrowUpDown className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={pkgSort}
                      onChange={(e) => setPkgSort(e.target.value as any)}
                    >
                      <option value="name-asc">Package Name (A to Z)</option>
                      <option value="name-desc">Package Name (Z to A)</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="tests-desc">Most Tests Included</option>
                      <option value="tests-asc">Fewest Tests Included</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              {pkgsLoading ? (
                <div className="p-16 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <span className="text-xs text-slate-500">Loading global packages...</span>
                </div>
              ) : (
                <DataTable 
                  columns={[
                    { 
                      header: "Package Name", 
                      cell: (row) => (
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
                            <PackageIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{row.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[220px]">{row.description}</div>
                          </div>
                        </div>
                      ) 
                    },
                    { 
                      header: "Category", 
                      cell: (row) => (
                        <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                          {row.category || '—'}
                        </span>
                      )
                    },
                    { 
                      header: "Tests Included", 
                      cell: (row) => (
                        <span className="text-sm font-medium text-slate-700">
                          {Array.isArray(row.testsIncluded) ? row.testsIncluded.length : 0} tests
                        </span>
                      )
                    },
                    { 
                      header: "Turnaround Time", 
                      cell: (row) => <span className="text-sm text-slate-600">{row.turnaroundTime || 'N/A'}</span>
                    },
                    { 
                      header: "Status", 
                      cell: (row) => <StatusBadge status={row.isActive ? "ACTIVE" : "INACTIVE"} />
                    },
                    { 
                      header: "Actions", 
                      cell: (row) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-700 h-8 w-8" onClick={() => handleOpenModal(row)} title="Edit Package">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-amber-50 hover:text-amber-700 h-8 w-8" onClick={() => handleToggleStatus(row)} title={row.isActive ? "Deactivate" : "Activate"}>
                            {row.isActive ? <XCircle className="h-4 w-4 text-amber-600" /> : <CheckCircle className="h-4 w-4 text-emerald-600" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-700 h-8 w-8" onClick={() => handleDelete(row._id)} title="Delete Package" disabled={deleteMutation.isPending}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )
                    },
                  ]}
                  data={processedPackages}
                  emptyState={
                    <div className="p-12 text-center text-muted-foreground">
                      <PackageIcon className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                      <p className="font-semibold text-slate-700">No packages found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {hasActivePkgFilters ? "Try adjusting your filters or search terms." : "Create your first global package using the button above."}
                      </p>
                    </div>
                  }
                />
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'CATEGORIES' && (
            <div>
              {/* Filter and Sort Toolbar for Categories */}
              <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Status Grouping */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" /> Status:
                    </span>
                    <button
                      type="button"
                      onClick={() => setCatStatusFilter('ALL')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        catStatusFilter === 'ALL'
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      All ({allCategories.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatStatusFilter('ACTIVE')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        catStatusFilter === 'ACTIVE'
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Active ({allCategories.filter((c: any) => c.isActive).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatStatusFilter('INACTIVE')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        catStatusFilter === 'INACTIVE'
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Inactive ({allCategories.filter((c: any) => !c.isActive).length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Showing <strong className="text-slate-800">{processedCategories.length}</strong> of {allCategories.length}
                    </span>
                    {hasActiveCatFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetCatFilters}
                        className="text-xs text-slate-600 hover:text-slate-900 h-7 px-2 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset
                      </Button>
                    )}
                  </div>
                </div>

                {/* Search, Applies To & Sort */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search categories..."
                      className="pl-8 text-xs h-9 bg-white" 
                      value={catSearch}
                      onChange={(e) => setCatSearch(e.target.value)}
                    />
                  </div>

                  <div>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1.5 text-xs text-slate-700 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={catAppliesToFilter}
                      onChange={(e) => setCatAppliesToFilter(e.target.value as any)}
                    >
                      <option value="ALL">All Applications</option>
                      <option value="PACKAGES">Global Packages Only</option>
                      <option value="LAB_SERVICES">Lab Services Only</option>
                    </select>
                  </div>

                  <div className="relative">
                    <ArrowUpDown className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={catSort}
                      onChange={(e) => setCatSort(e.target.value as any)}
                    >
                      <option value="name-asc">Category Name (A to Z)</option>
                      <option value="name-desc">Category Name (Z to A)</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              {categoriesLoading ? (
                <div className="p-16 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <span className="text-xs text-slate-500">Loading categories...</span>
                </div>
              ) : (
                <DataTable
                  columns={[
                    {
                      header: "Category Name",
                      cell: (row) => (
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shrink-0 border border-purple-100">
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
                            <span key={a} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">
                              {a.replace('_', ' ')}
                            </span>
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
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="hover:bg-blue-50 h-8 w-8" onClick={() => handleOpenCategoryModal(row)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-red-50 h-8 w-8" onClick={() => handleDeleteCategory(row._id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )
                    },
                  ]}
                  data={processedCategories}
                  emptyState={
                    <div className="p-12 text-center text-muted-foreground">
                      <Tag className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                      <p className="font-semibold text-slate-700">No categories found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {hasActiveCatFilters ? "Try adjusting your search or filters." : "Create your first category using the button above."}
                      </p>
                    </div>
                  }
                />
              )}
            </div>
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
