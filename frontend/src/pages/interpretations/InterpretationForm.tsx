import { useState, useEffect } from "react"
import { ArrowLeft, FileText, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams } from "react-router-dom"
import { useInterpretation, useUpdateInterpretation, usePublishInterpretation } from "@/hooks/useInterpretations"
import { useResult } from "@/hooks/useResults"
import toast from "react-hot-toast"
export function InterpretationForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  const { data: interpretationData, isLoading: interpLoading } = useInterpretation(id as string)
  const interpretation = interpretationData?.data || interpretationData

  const { data: resultData, isLoading: resultLoading } = useResult(interpretation?.resultId)
  const result = resultData?.data || resultData

  const updateInterp = useUpdateInterpretation()
  const publishInterp = usePublishInterpretation()
  
  const [formData, setFormData] = useState({
    riskLevel: "",
    summary: "",
    recommendations: "",
  })

  useEffect(() => {
    if (interpretation) {
      setFormData({
        riskLevel: "LOW", // Mocking riskLevel as it's not in schema
        summary: interpretation.summary || "",
        recommendations: interpretation.recommendations || "",
      })
    }
  }, [interpretation])

  const handleSaveDraft = async () => {
    try {
      await updateInterp.mutateAsync({ 
        id: id as string, 
        summary: formData.summary, 
        recommendations: formData.recommendations 
      })
      toast.success("Draft saved successfully")
    } catch (e) {
      toast.error("Failed to save draft")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateInterp.mutateAsync({ 
        id: id as string, 
        summary: formData.summary, 
        recommendations: formData.recommendations 
      })
      await publishInterp.mutateAsync(id as string)
      toast.success("Interpretation published successfully")
      navigate('/interpretations')
    } catch (e) {
      toast.error("Failed to publish interpretation")
    }
  }

  if (interpLoading || resultLoading) return <div>Loading...</div>
  if (!interpretation || !result) return <div>Data not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Clinical Interpretation</h2>
            <StatusBadge status={interpretation.status} />
          </div>
          <p className="text-muted-foreground">Patient ID: {interpretation.patientId}</p>
        </div>
        <div>
          <Button variant="outline" className="mr-2" onClick={handleSaveDraft} disabled={updateInterp.isPending}>Save Draft</Button>
          <Button onClick={handleSubmit} className="flex items-center gap-2" disabled={publishInterp.isPending}>
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
                {(result.biomarkers || []).map((b: any, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <div className="font-medium text-sm">{b.name}</div>
                      <div className="text-xs text-muted-foreground">Ref: {b.referenceRange} {b.unit}</div>
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
