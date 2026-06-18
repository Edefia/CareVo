import { useState } from "react"

import { Plus, Edit2, Archive, Activity, BookOpen } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"

const MOCK_DISEASE_TRENDS = [
  { month: 'Jan', hypertension: 40, diabetes: 24 },
  { month: 'Feb', hypertension: 30, diabetes: 13 },
  { month: 'Mar', hypertension: 20, diabetes: 58 },
  { month: 'Apr', hypertension: 27, diabetes: 39 },
  { month: 'May', hypertension: 18, diabetes: 48 },
  { month: 'Jun', hypertension: 23, diabetes: 38 },
  { month: 'Jul', hypertension: 34, diabetes: 43 },
]

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
                <h3 className="text-2xl font-bold text-slate-900">+14%</h3>
                <p className="text-xs text-slate-400 mt-1">vs last month</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Diabetes Screenings</p>
                <h3 className="text-2xl font-bold text-slate-900">43</h3>
                <p className="text-xs text-slate-400 mt-1">Flagged high this week</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-serif text-xl font-semibold mb-6 text-[var(--color-forest)]">Disease Trend Charts</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_DISEASE_TRENDS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHyp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="hypertension" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorHyp)" name="Hypertension" />
                  <Area type="monotone" dataKey="diabetes" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDia)" name="Diabetes" />
                </AreaChart>
              </ResponsiveContainer>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-slate-100 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-slate-300" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">EDUCATION CARD</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md">PUBLISHED</span>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Understanding Blood Pressure</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">Learn about the silent killer, how to measure it, and lifestyle changes to keep it in check.</p>
                  <div className="flex justify-end gap-2 border-t pt-4">
                    <Button variant="outline" size="sm" className="gap-2 text-slate-600"><Archive className="h-3.5 w-3.5" /> Archive</Button>
                    <Button variant="outline" size="sm" className="gap-2 text-[var(--color-forest)] border-[var(--color-forest)]"><Edit2 className="h-3.5 w-3.5" /> Edit</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
