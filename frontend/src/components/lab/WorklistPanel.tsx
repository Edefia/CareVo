import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Search, Plus, Filter, Clock, CheckCircle } from "lucide-react"
import { useBookings } from "@/hooks/useBookings"
import { cn } from "@/lib/utils"

export function WorklistPanel() {
  const navigate = useNavigate()
  const { referralCode } = useParams<{ referralCode: string }>()
  const { data: bookingsData, isLoading } = useBookings()
  const bookings = bookingsData?.items || bookingsData || []
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<"ALL" | "PENDING" | "URGENT">("ALL")
  
  const filteredBookings = React.useMemo(() => {
    if (!Array.isArray(bookings)) return []
    return bookings.filter((b: any) => {
      const name = b.patientId?.userId ? `${b.patientId.userId.firstName} ${b.patientId.userId.lastName}` : ""
      const matchesSearch = (b.referralCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
             name.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (!matchesSearch) return false

      if (filterType === "PENDING") {
        return b.status === "PENDING"
      }
      if (filterType === "URGENT") {
        const reason = (b.reason || "").toLowerCase()
        return reason.includes("urgent") || reason.includes("follow-up") || b.locationType === "HOME"
      }
      return true
    })
  }, [bookings, searchQuery, filterType])

  return (
    <div className="flex flex-col h-full bg-white border-r border-[var(--color-lims-border)] w-[360px] shrink-0 z-10 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
      
      {/* Worklist Header */}
      <div className="p-4 border-b border-[var(--color-lims-border)] shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-[var(--color-lims-text)] font-sans">
            Worklist
            <span className="ml-2 text-xs font-semibold bg-[var(--color-lims-bg)] text-[var(--color-lims-text-muted)] px-2 py-0.5 rounded-full border border-[var(--color-lims-border)]">
              {filteredBookings.length}
            </span>
          </h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setFilterType(filterType === "ALL" ? "PENDING" : "ALL")}
              className="h-7 w-7 flex items-center justify-center rounded bg-[var(--color-lims-bg)] text-[var(--color-lims-text-muted)] hover:text-[var(--color-lims-text)] hover:bg-[var(--color-lims-border)] transition-colors"
              title="Toggle filter"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate('/lab/bookings/new')}
              className="h-7 w-7 flex items-center justify-center rounded bg-[var(--color-lims-accent)] text-white hover:bg-[var(--color-lims-accent-hover)] transition-colors shadow-sm"
              title="Create New Booking"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-lims-text-muted)]" />
          <input 
            type="text" 
            placeholder="Search MRN, Name, Order..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-[var(--color-lims-border)] bg-[var(--color-lims-bg)] text-[13px] outline-none focus:border-[var(--color-lims-accent)] focus:ring-1 focus:ring-[var(--color-lims-accent)] transition-all"
          />
        </div>
        
        {/* Quick Filters */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
          <button 
            onClick={() => setFilterType("ALL")}
            className={cn(
              "whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-semibold transition-colors",
              filterType === "ALL" 
                ? "bg-[var(--color-lims-active-bg)] text-[var(--color-lims-accent)] border border-[var(--color-lims-accent)]/20" 
                : "bg-white text-[var(--color-lims-text-muted)] border border-[var(--color-lims-border)] hover:bg-[var(--color-lims-bg)]"
            )}
          >
            All Active
          </button>
          <button 
            onClick={() => setFilterType("PENDING")}
            className={cn(
              "whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-semibold transition-colors",
              filterType === "PENDING" 
                ? "bg-[var(--color-lims-active-bg)] text-[var(--color-lims-accent)] border border-[var(--color-lims-accent)]/20" 
                : "bg-white text-[var(--color-lims-text-muted)] border border-[var(--color-lims-border)] hover:bg-[var(--color-lims-bg)]"
            )}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilterType("URGENT")}
            className={cn(
              "whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-semibold transition-colors",
              filterType === "URGENT" 
                ? "bg-rose-50 text-rose-700 border border-rose-200" 
                : "bg-white text-[var(--color-lims-text-muted)] border border-[var(--color-lims-border)] hover:bg-[var(--color-lims-bg)]"
            )}
          >
            Urgent / Home
          </button>
        </div>
      </div>

      {/* Worklist Items */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-[var(--color-lims-text-muted)]">
            Loading worklist...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-lims-text-muted)]">
            No items found.
          </div>
        ) : (
          filteredBookings.map((client: any) => {
            const isActive = referralCode === client.referralCode;
            const name = client.patientId?.userId ? `${client.patientId.userId.firstName} ${client.patientId.userId.lastName}` : "Unknown";
            const mrn = client.patientId?.mrn || "MRN-PENDING";
            const isCompleted = client.status === 'COMPLETED';
            
            return (
              <div 
                key={client._id || client.id}
                onClick={() => navigate(`/lab/dashboard/${client.referralCode}`)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                  isActive 
                    ? "bg-[var(--color-lims-active-bg)] border-[var(--color-lims-accent)]/30 shadow-[0_2px_8px_rgba(109,74,224,0.1)]" 
                    : "bg-white border-transparent hover:border-[var(--color-lims-border)] hover:bg-[var(--color-lims-bg)]"
                )}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[14px] text-[var(--color-lims-text)] leading-none">{name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--color-lims-text-muted)] bg-white px-1.5 py-0.5 rounded border border-[var(--color-lims-border)]">
                    {mrn}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <span className="text-[13px] font-medium text-[var(--color-lims-text-muted)] truncate">
                      {client.packageId?.name || client.reason || "General"}
                    </span>
                    {(client.reason?.toLowerCase().includes("follow-up") || client.reason?.toLowerCase().includes("further")) && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-1 py-0.5 rounded shrink-0">
                        Follow-Up
                      </span>
                    )}
                    {client.locationType === 'HOME' && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-1 py-0.5 rounded shrink-0">
                        Home
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-[var(--color-lims-accent)]">
                    {client.referralCode}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-lims-border)]/50">
                  <div className="flex items-center gap-1.5">
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className={cn(
                      "text-[11px] font-bold uppercase tracking-wider",
                      isCompleted ? "text-green-600" : "text-amber-600"
                    )}>
                      {isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[var(--color-lims-text-muted)]">
                    {new Date(client.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
