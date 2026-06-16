import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Circle, Clock, Building2, Calendar, MapPin, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PatientJourney() {
  const navigate = useNavigate()

  // Mock patient journey state
  const journeySteps = [
    { id: 1, title: "Screening Booked", date: "Oct 10, 2025", status: "completed", description: "You scheduled a Comprehensive Wellness Screen." },
    { id: 2, title: "Samples Collected", date: "Oct 12, 2025", status: "completed", description: "Samples taken at AccuLab Diagnostics." },
    { id: 3, title: "Results Interpreted", date: "Oct 14, 2025", status: "completed", description: "Dr. Michael Chen reviewed your results." },
    { id: 4, title: "Follow-up Required", date: "Oct 14, 2025", status: "current", description: "Elevated risk detected. Action required." },
    { id: 5, title: "Hospital Appointment", date: "Pending", status: "upcoming", description: "Schedule a visit with a specialist." },
  ]

  const recommendedHospitals = [
    { name: "Korle Bu Teaching Hospital", distance: "2.4 km", specialty: "Cardiology Dept", rating: 4.8 },
    { name: "Ridge Regional Hospital", distance: "4.1 km", specialty: "Internal Medicine", rating: 4.5 },
    { name: "Nyaho Medical Centre", distance: "5.8 km", specialty: "Premium Care", rating: 4.9 },
  ]

  const [selectedHospital, setSelectedHospital] = useState<string | null>(null)

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1200px] mx-auto pb-[96px] animate-in fade-in duration-500">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1 shrink-0 bg-white shadow-sm border border-slate-200">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Your Health Journey
          </h1>
          <p className="text-[16px] text-[var(--color-text-secondary)]">
            Track your progress and schedule necessary follow-up care.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: TIMELINE (WINDING ROAD STYLE) */}
        <div className="bg-white rounded-2xl p-8 border shadow-[var(--shadow-card)] relative overflow-hidden">
          <h2 className="font-serif text-2xl font-semibold text-[var(--color-forest)] mb-8">Journey Timeline</h2>
          
          <div className="relative pl-6 border-l-2 border-slate-100 space-y-10">
            {journeySteps.map((step) => (
              <div key={step.id} className="relative">
                {/* Timeline Node */}
                <div className={`absolute -left-[35px] top-1 h-6 w-6 rounded-full flex items-center justify-center border-4 border-white ${
                  step.status === 'completed' ? 'bg-emerald-500' : 
                  step.status === 'current' ? 'bg-amber-500 ring-4 ring-amber-100 animate-pulse' : 
                  'bg-slate-200'
                }`}>
                  {step.status === 'completed' ? <CheckCircle2 className="h-3 w-3 text-white" /> : 
                   step.status === 'current' ? <Circle className="h-2 w-2 text-white fill-white" /> : 
                   <Clock className="h-3 w-3 text-slate-400" />}
                </div>

                {/* Content */}
                <div className={`p-4 rounded-xl border ${
                  step.status === 'current' ? 'bg-amber-50/50 border-amber-200 shadow-sm' : 
                  step.status === 'completed' ? 'bg-slate-50 border-slate-100' : 
                  'bg-white border-dashed border-slate-200 opacity-60'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold ${
                      step.status === 'completed' ? 'text-slate-700' : 
                      step.status === 'current' ? 'text-amber-900' : 
                      'text-slate-400'
                    }`}>{step.title}</h3>
                    <span className="text-xs font-medium text-slate-500">{step.date}</span>
                  </div>
                  <p className={`text-sm ${step.status === 'current' ? 'text-amber-700/80' : 'text-slate-500'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: REFERRAL MODULE */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[var(--color-forest)] to-slate-900 rounded-2xl p-8 text-white shadow-xl">
            <h2 className="font-serif text-2xl font-semibold mb-3">Schedule Follow-up</h2>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Based on Dr. Chen's interpretation, we've matched you with top-rated cardiovascular specialists in your area.
            </p>

            <div className="space-y-4">
              {recommendedHospitals.map((hospital, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedHospital(hospital.name)}
                  className={`bg-white/10 hover:bg-white/20 border transition-all cursor-pointer rounded-xl p-4 flex items-center justify-between ${
                    selectedHospital === hospital.name ? 'border-[var(--color-lime)] ring-2 ring-[var(--color-lime)]/50' : 'border-white/10'
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
                        <span>{hospital.specialty}</span>
                      </div>
                    </div>
                  </div>
                  {selectedHospital === hospital.name && <CheckCircle2 className="h-5 w-5 text-[var(--color-lime)]" />}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <Button 
                disabled={!selectedHospital}
                className="w-full h-12 bg-[var(--color-lime)] text-[var(--color-forest)] hover:bg-[var(--color-lime-dark)] font-bold disabled:opacity-50 disabled:bg-slate-300"
              >
                {selectedHospital ? `Book at ${selectedHospital}` : 'Select a Facility to Book'} <Calendar className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
