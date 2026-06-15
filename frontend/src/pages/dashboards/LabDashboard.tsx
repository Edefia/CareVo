import { useState } from "react"
import { Search, Copy, CheckCircle, Clock, FileText, Heart, Droplets, Activity, ChevronRight, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"

export function LabDashboard() {
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")

  // Mock Assigned Clients Data
  const assignedClients = [
    {
      id: "bkg-1",
      referralCode: "CRV-2025-A7K3P2",
      clientName: "Kwame Mensah",
      package: "Cardio Essentials",
      pillar: "CARDIO",
      bookedFor: "Today, 09:00 AM",
      status: "PENDING_ARRIVAL"
    },
    {
      id: "bkg-2",
      referralCode: "CRV-2025-M9B4R1",
      clientName: "Ama Serwaa",
      package: "Complete Wellness",
      pillar: "METABOLIC",
      bookedFor: "Today, 11:30 AM",
      status: "ATTENDED"
    },
    {
      id: "bkg-3",
      referralCode: "CRV-2025-X2L8J4",
      clientName: "Kofi Annan",
      package: "Renal Check",
      pillar: "RENAL",
      bookedFor: "Yesterday, 02:00 PM",
      status: "RESULTS_ENTERED"
    },
    {
      id: "bkg-4",
      referralCode: "CRV-2025-V5N1C9",
      clientName: "Abena Osei",
      package: "Metabolic Profile",
      pillar: "METABOLIC",
      bookedFor: "Oct 12, 10:00 AM",
      status: "SUBMITTED"
    }
  ]

  const filteredClients = assignedClients.filter(c => 
    c.referralCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Referral Code copied")
  }

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING_ARRIVAL': return <span className="px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded text-[11px] font-bold uppercase tracking-wider">Pending Arrival</span>
      case 'ATTENDED': return <span className="px-2 py-1 bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20 rounded text-[11px] font-bold uppercase tracking-wider">Attended</span>
      case 'RESULTS_ENTERED': return <span className="px-2 py-1 bg-[#EFF6FF] text-[#0F76E0] border border-[#0F76E0]/20 rounded text-[11px] font-bold uppercase tracking-wider">Results Entered</span>
      case 'SUBMITTED': return <span className="px-2 py-1 bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 rounded text-[11px] font-bold uppercase tracking-wider">Submitted</span>
      default: return null
    }
  }

  const renderPillarIcon = (pillar: string) => {
    switch(pillar) {
      case 'CARDIO': return <div className="h-6 w-6 rounded-md bg-[#DC2626]/10 flex items-center justify-center"><Heart className="h-3.5 w-3.5 text-[#DC2626]" /></div>
      case 'RENAL': return <div className="h-6 w-6 rounded-md bg-[#0F76E0]/10 flex items-center justify-center"><Droplets className="h-3.5 w-3.5 text-[#0F76E0]" /></div>
      case 'METABOLIC': return <div className="h-6 w-6 rounded-md bg-[#D97706]/10 flex items-center justify-center"><Activity className="h-3.5 w-3.5 text-[#D97706]" /></div>
      default: return null
    }
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1280px] mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[24px]">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Laboratory Operations
          </h1>
          <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">
            Welcome back, {user?.firstName}. Manage your assigned clients and enter results.
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[24px] shadow-sm">
        <h2 className="font-sans text-[18px] font-bold text-[var(--color-text-primary)] mb-4">Find a Client</h2>
        <div className="relative max-w-[600px]">
          <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          <Input 
            placeholder="Enter Referral Code (e.g. CRV-2025-A7K3P2)" 
            className="pl-[48px] h-[56px] text-[16px] font-mono border-2 focus:border-[var(--color-forest)] bg-[var(--color-surface-2)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ASSIGNED CLIENTS QUEUE */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-[24px] py-[20px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50">
          <h2 className="font-serif text-[24px] font-semibold text-[var(--color-forest)]">
            Assigned Clients
          </h2>
          <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mt-1">
            Clients booked at your laboratory using their Referral Codes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-gray-50/50">
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Referral Code</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Client Name</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Package</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Booked For</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/30 transition-colors">
                    <td className="px-[24px] py-[20px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[14px] font-bold text-[var(--color-forest)] bg-[#7EE8A2]/10 px-2 py-1 rounded">
                          {client.referralCode}
                        </span>
                        <button onClick={() => handleCopy(client.referralCode)} className="text-[var(--color-text-muted)] hover:text-[var(--color-forest)] transition-colors p-1">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-[24px] py-[20px] font-medium text-[var(--color-text-primary)]">
                      {client.clientName}
                    </td>
                    <td className="px-[24px] py-[20px]">
                      <div className="flex items-center gap-2">
                        {renderPillarIcon(client.pillar)}
                        <span className="font-medium text-[14px] text-[var(--color-text-secondary)]">{client.package}</span>
                      </div>
                    </td>
                    <td className="px-[24px] py-[20px]">
                      <div className="flex items-center gap-1.5 text-[14px] text-[var(--color-text-secondary)]">
                        <Clock className="h-4 w-4 text-[var(--color-text-muted)]" />
                        {client.bookedFor}
                      </div>
                    </td>
                    <td className="px-[24px] py-[20px]">
                      {renderStatusBadge(client.status)}
                    </td>
                    <td className="px-[24px] py-[20px] text-right">
                      {client.status !== 'SUBMITTED' ? (
                        <Link to={`/lab/results/enter/${client.referralCode}`}>
                          <Button size="sm" variant={client.status === 'PENDING_ARRIVAL' ? 'outline' : 'default'} className="font-medium">
                            {client.status === 'PENDING_ARRIVAL' ? 'Mark Arrived' : 'Enter Results'}
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="ghost" disabled className="font-medium text-[var(--color-text-muted)]">
                          Submitted
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-[24px] py-[64px] text-center">
                    <div className="flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                      <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                      <p className="font-medium text-[16px]">No clients found.</p>
                      <p className="text-[14px]">Try adjusting your search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
