import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useUpdatePatient } from "@/hooks/usePatients"

interface EditPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
}

export function EditPatientModal({ open, onOpenChange, patient }: EditPatientModalProps) {
  const updatePatientMutation = useUpdatePatient()
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Unknown",
    bloodType: "Unknown",
    address: {
      street: "",
      city: "",
      state: ""
    }
  })

  // Prepopulate form when modal opens
  useEffect(() => {
    if (open && patient) {
      // eslint-disable-next-line
      setFormData({
        firstName: patient.userId?.firstName || patient.user?.firstName || "",
        lastName: patient.userId?.lastName || patient.user?.lastName || "",
        email: patient.userId?.email || patient.user?.email || patient.email || "",
        phone: patient.userId?.phone || patient.user?.phone || patient.phone || "",
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : "",
        gender: patient.gender || "Unknown",
        bloodType: patient.bloodType || "Unknown",
        address: {
          street: patient.address?.street || "",
          city: patient.address?.city || "",
          state: patient.address?.state || ""
        }
      })
    }
  }, [open, patient])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : ""
    }

    updatePatientMutation.mutate(
      { id: patient._id || patient.id, updates: submitData },
      {
        onSuccess: () => {
          toast.success("Patient profile updated successfully")
          onOpenChange(false)
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error?.message || "Failed to update profile")
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-[24px] text-[var(--color-forest)]">Edit Profile</DialogTitle>
          <DialogDescription>
            Update the patient's demographic information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input 
                id="dateOfBirth" 
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
             <Label>Street Address</Label>
             <Input 
                value={formData.address.street}
                onChange={(e) => setFormData({...formData, address: { ...formData.address, street: e.target.value }})}
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input 
                  value={formData.address.city}
                  onChange={(e) => setFormData({...formData, address: { ...formData.address, city: e.target.value }})}
                />
            </div>
             <div className="space-y-2">
              <Label>Blood Type</Label>
              <Select value={formData.bloodType} onValueChange={(val) => setFormData({...formData, bloodType: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Blood Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePatientMutation.isPending} className="bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest-mid)]">
              {updatePatientMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
