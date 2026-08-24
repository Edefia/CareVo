import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateLaboratory } from "@/hooks/useLaboratories"
import toast from "react-hot-toast"

export function NewLabModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contactEmail: "",
    contactPhone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Ghana",
    }
  })

  const createLabMutation = useCreateLaboratory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createLabMutation.mutateAsync(formData)
      toast.success("Laboratory registered successfully")
      onOpenChange(false)
      setFormData({
        name: "", code: "", contactEmail: "", contactPhone: "", 
        address: { street: "", city: "", state: "", zipCode: "", country: "Ghana" }
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to register laboratory")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register New Laboratory</DialogTitle>
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
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createLabMutation.isPending}>
              {createLabMutation.isPending ? "Registering..." : "Register Laboratory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
