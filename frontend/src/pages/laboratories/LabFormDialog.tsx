import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateLaboratory, useUpdateLaboratory } from "@/hooks/useLaboratories"
import toast from "react-hot-toast"

export function LabFormDialog({ open, onOpenChange, lab }: { open: boolean, onOpenChange: (open: boolean) => void, lab?: any }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contactEmail: "",
    contactPhone: "",
    isActive: true,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Ghana",
    }
  })

  useEffect(() => {
    if (lab) {
      // eslint-disable-next-line
      setFormData({
        name: lab.name || "",
        code: lab.code || "",
        contactEmail: lab.contactEmail || "",
        contactPhone: lab.contactPhone || "",
        isActive: lab.isActive !== undefined ? lab.isActive : true,
        address: {
          street: lab.address?.street || "",
          city: lab.address?.city || "",
          state: lab.address?.state || "",
          zipCode: lab.address?.zipCode || "",
          country: lab.address?.country || "Ghana",
        }
      })
    } else {
      // eslint-disable-next-line
      setFormData({
        name: "", code: "", contactEmail: "", contactPhone: "", isActive: true,
        address: { street: "", city: "", state: "", zipCode: "", country: "Ghana" }
      })
    }
  }, [lab, open])

  const createLabMutation = useCreateLaboratory()
  const updateLabMutation = useUpdateLaboratory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (lab) {
        await updateLabMutation.mutateAsync({ id: lab._id, data: formData })
        toast.success("Laboratory updated successfully")
      } else {
        await createLabMutation.mutateAsync(formData)
        toast.success("Laboratory registered successfully")
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${lab ? 'update' : 'register'} laboratory`)
    }
  }

  const isPending = createLabMutation.isPending || updateLabMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{lab ? "Edit Laboratory" : "Register New Laboratory"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Laboratory Name</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. AccuLab Diagnostics" 
              />
            </div>
            <div className="space-y-2">
              <Label>Lab Code</Label>
              <Input 
                required 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})} 
                placeholder="e.g. ACCU" 
                disabled={!!lab}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input 
                type="email" 
                required 
                value={formData.contactEmail} 
                onChange={e => setFormData({...formData, contactEmail: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input 
                required 
                value={formData.contactPhone} 
                onChange={e => setFormData({...formData, contactPhone: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Street Address</Label>
            <Input 
              value={formData.address.street} 
              onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})} 
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input 
                value={formData.address.city} 
                onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})} 
              />
            </div>
            <div className="space-y-2">
              <Label>State/Region</Label>
              <Input 
                value={formData.address.state} 
                onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value}})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Zip Code</Label>
              <Input 
                value={formData.address.zipCode} 
                onChange={e => setFormData({...formData, address: {...formData.address, zipCode: e.target.value}})} 
              />
            </div>
          </div>
          
          {lab && (
            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox"
                id="active-status" 
                checked={formData.isActive} 
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="active-status">Active Laboratory</Label>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : (lab ? "Save Changes" : "Register Laboratory")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
