import { useState, useEffect } from "react"
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers"
import { useLaboratories } from "@/hooks/useLaboratories"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface UserFormDialogProps {
  isOpen: boolean
  onClose: () => void
  user?: any // null if creating, object if editing
}

export function UserFormDialog({ isOpen, onClose, user }: UserFormDialogProps) {
  const isEditing = !!user

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "CLIENT",
    password: "", // only used when creating
    laboratoryId: "none",
    sendResetEmail: true,
  })

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "CLIENT",
        password: "",
        laboratoryId: user.laboratoryId || "none",
        sendResetEmail: false,
      })
    } else if (isOpen) {
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "LABORATORY", // Default for admin provisioning
        password: Math.random().toString(36).slice(-12) + "A1!", // Generate temporary random password
        laboratoryId: "none",
        sendResetEmail: true,
      })
    }
  }, [user, isOpen])

  const { data: labsData } = useLaboratories()
  const labs = labsData?.data || labsData || []

  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        laboratoryId: formData.laboratoryId === "none" ? null : formData.laboratoryId,
      }

      if (isEditing) {
        await updateMutation.mutateAsync({ id: user._id, data: payload })
        toast.success("User updated successfully")
      } else {
        payload.password = formData.password
        payload.sendResetEmail = formData.sendResetEmail
        await createMutation.mutateAsync(payload)
        toast.success("User provisioned successfully")
      }
      
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-[24px] text-[var(--color-forest)]">
            {isEditing ? "Edit User" : "Provision New User"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update user profile details and role assignments."
              : "Create a new user account. They will receive an email to set their own password if checked."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Role Assignment</Label>
            <Select 
              value={formData.role} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">System Administrator</SelectItem>
                <SelectItem value="LABORATORY">Laboratory Technician</SelectItem>
                <SelectItem value="INTERPRETER">Medical Interpreter</SelectItem>
                <SelectItem value="CLIENT">Patient / Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === "LABORATORY" && (
            <div className="space-y-2">
              <Label>Laboratory Assignment</Label>
              <Select 
                value={formData.laboratoryId} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, laboratoryId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a laboratory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Specific Lab (Global)</SelectItem>
                  {labs.map((lab: any) => (
                    <SelectItem key={lab._id} value={lab._id}>{lab.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Lab Techs should be scoped to a specific lab to manage local results.</p>
            </div>
          )}

          {!isEditing && (
            <div className="flex items-center gap-2 mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id="sendResetEmail"
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                checked={formData.sendResetEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, sendResetEmail: e.target.checked }))}
              />
              <div className="grid gap-1 leading-none">
                <label htmlFor="sendResetEmail" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Send Welcome Email & Magic Reset Link
                </label>
                <p className="text-xs text-slate-500">
                  Automatically generates a secure link so the user can set their own password immediately.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[var(--color-forest)]" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Provision Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
