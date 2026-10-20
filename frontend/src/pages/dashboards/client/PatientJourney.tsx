import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Circle, Clock, Building2, Calendar, MapPin, ArrowLeft, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBookings } from "@/hooks/useBookings"
import { useResults } from "@/hooks/useResults"
import toast from "react-hot-toast"

export function PatientJourney() {
  const navigate = useNavigate()
  const { data: bookingsData, isLoading: loadingBookings } = useBookings()
  const { data: resultsData, isLoading: loadingResults } = useResults()

  const [selectedHospital, setSelectedHospital] = useState<string | null>(null)

  // Extract data safely
  const bookings = Array.isArray(bookingsData?.items || bookingsData?.data || bookingsData) ? (bookingsData?.items || bookingsData?.data || bookingsData) : []
  const results = Array.isArray(resultsData?.items || resultsData?.data || resultsData) ? (resultsData?.items || resultsData?.data || resultsData) : []

  // Dynamic logic to determine journey state
  const { journeySteps, needsFollowUp, recommendedSpecialty } = useMemo(() => {
    // Sort bookings by date descending
    const sortedBookings = [...bookings].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const latestBooking = sortedBookings[0]

    // Sort results by date descending
    const sortedResults = [...results].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const latestResult = sortedResults[0]

    const steps = []
    let requiresAction = false
    let specialty = "General Practice"

    if (!latestBooking && !latestResult) {
      return {
        journeySteps: [
          { id: 1, title: "No Journey Started", date: "-", status: "current", description: "Book your first screening to begin." }
        ],
        needsFollowUp: false,
        recommendedSpecialty: null
      }
    }

    // Node 1: Screening Booked
    if (latestBooking) {
      steps.push({
        id: 1,
        title: "Screening Booked",
        date: new Date(latestBooking.createdAt).toLocaleDateString(),
        status: "completed",
        description: `You scheduled a ${latestBooking.package?.name || "health screening"}.`
      })
    }

    // Node 2: Samples Collected / Completed
    const isCompleted = latestBooking?.status === 'COMPLETED' || latestResult
    steps.push({
      id: 2,
      title: "Samples Collected",
      date: isCompleted && latestResult ? new Date(latestResult.createdAt).toLocaleDateString() : "Pending",
      status: isCompleted ? "completed" : "current",
      description: isCompleted ? "Samples successfully analyzed." : "Awaiting sample collection at the lab."
    })

    // Node 3: Results Interpreted
    if (latestResult && latestResult.status === 'FINAL') {
      steps.push({
        id: 3,
        title: "Results Interpreted",
        date: new Date(latestResult.updatedAt || latestResult.createdAt).toLocaleDateString(),
        status: "completed",
        description: "Your results have been reviewed and finalized."
      })

      // Check for abnormal flags to trigger follow-up
      const hasAbnormalities = latestResult.biomarkers?.some((b: any) => b.flag === 'HIGH' || b.flag === 'CRITICAL')
      
      if (hasAbnormalities) {
        requiresAction = true
        specialty = latestResult.package?.category === 'Chronic & Metabolic' ? 'Cardiology / Endocrinology' : 'Specialist Care'
        
        steps.push({
          id: 4,
          title: "Follow-up Required",
          date: "Action Needed",
          status: "current",
          description: "Elevated risk detected in your recent results. Medical consultation is highly recommended."
        })
        steps.push({
          id: 5,
          title: "Hospital Appointment",
          date: "Pending",
          status: "upcoming",
          description: "Schedule a visit with a recommended specialist."
        })
      } else {
        steps.push({
          id: 4,
          title: "All Clear",
          date: new Date(latestResult.updatedAt || latestResult.createdAt).toLocaleDateString(),
          status: "completed",
          description: "No immediate medical action required. Keep up the good work!"
        })
      }
    } else if (isCompleted) {
      steps.push({
        id: 3,
        title: "Results Processing",
        date: "In Progress",
        status: "current",
        description: "Your results are currently being analyzed by our specialists."
      })
    }

    return { journeySteps: steps, needsFollowUp: requiresAction, recommendedSpecialty: specialty }
  }, [bookings, results])

  // Mocked smart recommendations based on specialty
  const recommendedHospitals = [
    { name: "Korle Bu Teaching Hospital", distance: "2.4 km", specialty: recommendedSpecialty || "General Dept", rating: 4.8 },
    { name: "Ridge Regional Hospital", distance: "4.1 km", specialty: "Internal Medicine", rating: 4.5 },
    { name: "Nyaho Medical Centre", distance: "5.8 km", specialty: "Premium Care", rating: 4.9 },
  ]

  if (loadingBookings || loadingResults) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="h-8 w-8 border-4 border-[var(--color-forest)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const handleBookAppointment = () => {
    toast.success(`Successfully booked appointment at ${selectedHospital}. They will contact you shortly!`)
    setSelectedHospital(null)
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1200px] mx-auto pb-[96px] animate-in fade-in duration-500">
      
      {/* Back Navigation */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-slate-600 bg-white shadow-xs border border-slate-200">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: TIMELINE (WINDING ROAD STYLE) */}
        <div className="bg-white rounded-2xl p-8 border shadow-[var(--shadow-card)] relative overflow-hidden">
          <h2 className="font-serif text-2xl font-semibold text-[var(--color-forest)] mb-8">Journey Timeline</h2>
          
          <div className="relative pl-6 border-l-2 border-slate-100 space-y-10">
            {journeySteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Timeline Node */}
                <div className={`absolute -left-[35px] top-1 h-6 w-6 rounded-full flex items-center justify-center border-4 border-white ${
                  step.status === 'completed' ? 'bg-emerald-500' : 
                  step.status === 'current' && needsFollowUp && step.title.includes("Follow-up") ? 'bg-red-500 ring-4 ring-red-100 animate-pulse' :
                  step.status === 'current' ? 'bg-amber-500 ring-4 ring-amber-100 animate-pulse' : 
                  'bg-slate-200'
                }`}>
                  {step.status === 'completed' ? <CheckCircle2 className="h-3 w-3 text-white" /> : 
                   step.status === 'current' ? <Circle className="h-2 w-2 text-white fill-white" /> : 
                   <Clock className="h-3 w-3 text-slate-400" />}
                </div>

                {/* Content */}
                <div className={`p-4 rounded-xl border transition-all ${
                  step.status === 'current' && needsFollowUp && step.title.includes("Follow-up") ? 'bg-red-50/50 border-red-200 shadow-sm' :
                  step.status === 'current' ? 'bg-amber-50/50 border-amber-200 shadow-sm' : 
                  step.status === 'completed' ? 'bg-slate-50 border-slate-100' : 
                  'bg-white border-dashed border-slate-200 opacity-60'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold ${
                      step.status === 'completed' ? 'text-slate-700' : 
                      step.status === 'current' && needsFollowUp && step.title.includes("Follow-up") ? 'text-red-900' :
                      step.status === 'current' ? 'text-amber-900' : 
                      'text-slate-400'
                    }`}>{step.title}</h3>
                    <span className="text-xs font-medium text-slate-500">{step.date}</span>
                  </div>
                  <p className={`text-sm ${
                    step.status === 'current' && needsFollowUp && step.title.includes("Follow-up") ? 'text-red-700/80 font-medium' :
                    step.status === 'current' ? 'text-amber-700/80' : 
                    'text-slate-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: SMART FOLLOW-UP MODULE */}
        <div className="space-y-6">
          {needsFollowUp ? (
            <div className="bg-[var(--color-forest)] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Stethoscope className="h-32 w-32" />
              </div>
              <h2 className="font-serif text-2xl font-semibold mb-3 relative z-10">Schedule Follow-up</h2>
              <p className="text-white/80 text-sm mb-6 leading-relaxed relative z-10">
                Based on your recent lab results, our system has detected areas requiring medical attention. We've matched you with top-rated <span className="font-bold text-[var(--color-lime)]">{recommendedSpecialty}</span> specialists in your area.
              </p>

              <div className="space-y-4 relative z-10">
                {recommendedHospitals.map((hospital, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedHospital(hospital.name)}
                    className={`bg-white/10 hover:bg-white/20 border transition-all cursor-pointer rounded-xl p-4 flex items-center justify-between ${
                      selectedHospital === hospital.name ? 'border-[var(--color-lime)] ring-2 ring-[var(--color-lime)]/50 bg-white/20' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-[var(--color-lime)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{hospital.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-white/60 mt-1">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {hospital.distance}</span>
                          <span>•</span>
                          <span className="font-medium text-white/80">{hospital.specialty}</span>
                        </div>
                      </div>
                    </div>
                    {selectedHospital === hospital.name && <CheckCircle2 className="h-5 w-5 text-[var(--color-lime)]" />}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                <Button 
                  disabled={!selectedHospital}
                  onClick={handleBookAppointment}
                  className="w-full h-12 bg-[var(--color-lime)] text-white hover:bg-[var(--color-lime-dark)] font-bold disabled:opacity-50 disabled:bg-slate-400"
                >
                  {selectedHospital ? `Book Appointment at ${selectedHospital}` : 'Select a Facility to Book'} <Calendar className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-emerald-900 mb-3">All Clear</h2>
              <p className="text-emerald-700/80 text-sm leading-relaxed max-w-sm">
                Your recent results look good and no immediate medical follow-up is required. Continue maintaining a healthy lifestyle!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
