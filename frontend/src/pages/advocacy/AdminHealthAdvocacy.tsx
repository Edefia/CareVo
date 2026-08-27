import { useState } from "react"

import { Plus, Activity, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"



export function AdminHealthAdvocacy() {

  const [activeTab, setActiveTab] = useState<'trends' | 'content'>('trends')

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1200px] mx-auto pb-[96px] animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Health Advocacy Panel
          </h1>
          <p className="text-[16px] text-[var(--color-text-secondary)]">
            Monitor disease trends and manage patient education content.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <Button 
            variant={activeTab === 'trends' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('trends')}
            className={activeTab === 'trends' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}
          >
            Disease Trends
          </Button>
          <Button 
            variant={activeTab === 'content' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('content')}
            className={activeTab === 'content' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}
          >
            Content Editor
          </Button>
        </div>
      </div>

      {activeTab === 'trends' ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Hypertension Spikes</p>
                <h3 className="text-2xl font-bold text-slate-900">-</h3>
                <p className="text-xs text-slate-400 mt-1">Pending live data feed</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Diabetes Screenings</p>
                <h3 className="text-2xl font-bold text-slate-900">-</h3>
                <p className="text-xs text-slate-400 mt-1">Pending live data feed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-serif text-xl font-semibold mb-6 text-[var(--color-forest)]">Disease Trend Charts</h3>
            <div className="h-[400px] w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <div className="text-center">
                <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No live trend data available yet</p>
                <p className="text-slate-400 text-sm mt-1">Check back when more clinical interpretations are published.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
            <div>
              <h3 className="font-serif text-xl font-semibold text-[var(--color-forest)]">Editable Content System</h3>
              <p className="text-sm text-slate-500 mt-1">Manage Education Cards and Preventive Tips</p>
            </div>
            <Button className="bg-[var(--color-forest)] hover:bg-[var(--color-forest-mid)] gap-2">
              <Plus className="h-4 w-4" /> Create New Content
            </Button>
          </div>

          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
             <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
             <p className="text-slate-500 font-medium text-lg">No educational content published</p>
             <p className="text-slate-400 text-sm mt-1 max-w-sm text-center">Use the Create New Content button above to author preventive health cards for patients.</p>
          </div>
        </div>
      )}
    </div>
  )
}
