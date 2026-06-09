import { useState } from "react"
import { ArrowLeft, FileText, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function InterpretationForm() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    riskLevel: "",
    summary: "",
    recommendations: "",
  })

  const mockData = {
    patient: "Kwame Mensah",
    package: "Basic Wellness",
    lab: "Accra Central",
    biomarkers: [
      { name: "Fasting Blood Sugar", value: "110", unit: "mg/dL", ref: "70-99", flag: "HIGH" },
      { name: "HbA1c", value: "5.8", unit: "%", ref: "< 5.7", flag: "HIGH" },
      { name: "Total Cholesterol", value: "180", unit: "mg/dL", ref: "< 200", flag: "NORMAL" },
    ]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting interpretation", formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Clinical Interpretation</h2>
            <StatusBadge status="IN_PROGRESS" />
          </div>
          <p className="text-muted-foreground">{mockData.patient} • {mockData.package}</p>
        </div>
        <div>
          <Button variant="outline" className="mr-2">Save Draft</Button>
          <Button onClick={handleSubmit} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Data Review */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Raw Results Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.biomarkers.map((b, i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <div className="font-medium text-sm">{b.name}</div>
                      <div className="text-xs text-muted-foreground">Ref: {b.ref} {b.unit}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${b.flag === 'HIGH' ? 'text-red-600' : 'text-green-600'}`}>
                        {b.value} {b.unit}
                      </div>
                      <div className="text-xs font-medium uppercase">{b.flag}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interpretation Form */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment & Recommendations</CardTitle>
              <CardDescription>Provide a patient-friendly summary of these results.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                
                <div className="space-y-3">
                  <Label>Overall Risk Level Assessment</Label>
                  <Select 
                    value={formData.riskLevel} 
                    onValueChange={(val: string) => setFormData({...formData, riskLevel: val})}
                  >
                    <SelectTrigger className="w-full md:w-1/2">
                      <SelectValue placeholder="Select Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low Risk</SelectItem>
                      <SelectItem value="MODERATE">Moderate Risk</SelectItem>
                      <SelectItem value="HIGH">High Risk</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Clinical Summary (Patient-Facing)</Label>
                  <textarea 
                    id="summary" 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Summarize the findings in simple language..."
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendations">Actionable Recommendations</Label>
                  <textarea 
                    id="recommendations" 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="1. Start daily cardio... 2. Reduce sugar..."
                    value={formData.recommendations}
                    onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                  />
                </div>

              </form>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t flex items-center justify-between">
              <div className="flex items-center text-amber-600 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Publishing will make this visible to the Patient and Advocate.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
