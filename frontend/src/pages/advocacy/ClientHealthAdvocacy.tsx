import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, Heart, ArrowLeft, Droplet, Flame, Brain, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

const MOCK_EDUCATION_CARDS = [
  { id: 1, title: 'Understanding Blood Pressure', category: 'CARDIOVASCULAR', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', excerpt: 'Learn about the silent killer, how to measure it, and lifestyle changes to keep it in check.' },
  { id: 2, title: 'Managing Blood Sugar Levels', category: 'METABOLIC', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50', excerpt: 'Practical tips on diet and exercise to maintain healthy fasting blood glucose.' },
  { id: 3, title: 'Cholesterol & Heart Health', category: 'CARDIOVASCULAR', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', excerpt: 'The difference between HDL and LDL, and why it matters for your longevity.' },
  { id: 4, title: 'Stress & Mental Clarity', category: 'WELLNESS', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50', excerpt: 'How chronic stress affects your physical biomarkers and actionable ways to decompress.' },
]

const MOCK_TIPS = [
  "Drink at least 2.5L of water daily to support kidney function.",
  "Aim for 150 minutes of moderate aerobic activity per week.",
  "Reduce sodium intake to less than 2,300mg a day to help lower blood pressure.",
  "Eat a serving of leafy greens with at least one meal a day.",
]

export function ClientHealthAdvocacy() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<string>('ALL')

  const filteredCards = activeCategory === 'ALL' ? MOCK_EDUCATION_CARDS : MOCK_EDUCATION_CARDS.filter(c => c.category === activeCategory)

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1200px] mx-auto pb-[96px] animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1 shrink-0 hover:bg-slate-200">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Health Education & Advocacy
          </h1>
          <p className="text-[16px] text-[var(--color-text-secondary)]">
            Curated medical knowledge and preventive tips to keep you healthy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: EDUCATION CARDS (Takes up 2 columns on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['ALL', 'CARDIOVASCULAR', 'METABOLIC', 'WELLNESS'].map(cat => (
              <Button 
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-5 ${activeCategory === cat ? 'bg-[var(--color-forest)] text-white' : 'text-slate-600'}`}
                size="sm"
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.id} className="bg-white rounded-2xl p-6 border shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="text-xs font-bold text-slate-400 mb-2">{card.category}</div>
                  <h3 className="font-serif text-xl font-semibold text-slate-900 mb-3">{card.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{card.excerpt}</p>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[var(--color-forest)] font-medium text-sm">
                    Read Article <ArrowLeft className="h-4 w-4 rotate-180" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT: PREVENTIVE TIPS SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-[var(--color-forest)] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <ShieldCheck className="absolute -right-6 -bottom-6 h-32 w-32 text-white/10" />
            
            <div className="relative z-10">
              <h3 className="font-serif text-2xl font-semibold mb-2">Preventive Tips</h3>
              <p className="text-blue-100 text-sm mb-6">Daily habits for a healthier, longer life.</p>

              <div className="space-y-4">
                {MOCK_TIPS.map((tip, idx) => (
                  <div key={idx} className="bg-white/10 rounded-xl p-4 flex gap-3 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                    <Info className="h-5 w-5 text-blue-200 shrink-0 mt-0.5" />
                    <p className="text-sm text-white/90 leading-snug">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-2xl p-6 shadow-sm text-center">
            <h4 className="font-semibold text-slate-900 mb-2">Need personalized advice?</h4>
            <p className="text-sm text-slate-500 mb-4">Book a consultation with our medical team to discuss your specific health goals.</p>
            <Button className="w-full bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest-mid)]">Book Consultation</Button>
          </div>
        </div>

      </div>
    </div>
  )
}
