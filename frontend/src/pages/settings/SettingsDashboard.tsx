import { useState, useRef } from "react"
import { Building2, Users, Bell, Shield, Database, LayoutDashboard, User, Camera, Loader2, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth"
import { userService } from "@/api/services/user"
import toast from "react-hot-toast"

export function SettingsDashboard() {
  const { user, setUser } = useAuthStore()
  
  // Default to profile tab
  const [activeTab, setActiveTab] = useState("profile")
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Define tabs based on role
  const allTabs = [
    { id: "profile", label: "My Profile", icon: User, showFor: ['CLIENT', 'INTERPRETER', 'LAB', 'ADMIN'] },
    { id: "security", label: "Security & Login", icon: Shield, showFor: ['CLIENT', 'INTERPRETER', 'LAB', 'ADMIN'] },
    { id: "general", label: "Platform Settings", icon: Building2, showFor: ['ADMIN'] },
    { id: "users", label: "User Management", icon: Users, showFor: ['ADMIN'] },
    { id: "notifications", label: "Notifications", icon: Bell, showFor: ['ADMIN', 'LAB'] },
    { id: "integrations", label: "Integrations", icon: Database, showFor: ['ADMIN'] },
    { id: "appearance", label: "Appearance", icon: LayoutDashboard, showFor: ['ADMIN', 'CLIENT', 'INTERPRETER', 'LAB'] },
  ]

  const visibleTabs = allTabs.filter(tab => tab.showFor.includes(user?.role || 'CLIENT'))

  // --- Handlers ---

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const updated = await userService.updateProfile(profileData)
      setUser({ ...user, ...updated } as any)
      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success("Password changed successfully")
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    setIsUploadingAvatar(true)
    
    // Read file as base64
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const base64 = reader.result as string
      try {
        const result = await userService.uploadAvatar(base64)
        // Update global user state with new avatar
        setUser({ ...user, avatarUrl: result.avatarUrl } as any)
        toast.success("Avatar updated successfully")
      } catch (error: any) {
        toast.error(error.response?.data?.error?.message || "Failed to upload avatar")
      } finally {
        setIsUploadingAvatar(false)
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[var(--color-forest)]">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your personal account and system preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 space-y-1">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? "bg-[var(--color-lime-dark)]/10 text-[var(--color-forest)]" 
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-[var(--color-lime-dark)]' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>My Profile</CardTitle>
                <CardDescription>
                  Update your personal information and profile picture.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200">
                      {isUploadingAvatar ? (
                        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                      ) : user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.firstName} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-slate-400" />
                      )}
                    </div>
                    <button 
                      onClick={triggerFileInput}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
                      title="Upload photo"
                    >
                      <Camera className="h-4 w-4 text-slate-600" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarSelect} 
                      accept="image/png, image/jpeg, image/jpg" 
                      className="hidden" 
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-sm text-slate-500 mb-2">{user?.role} ACCOUNT</p>
                    <p className="text-xs text-slate-400">Recommended size: 400x400px. Max 5MB.</p>
                  </div>
                </div>

                {/* Info Form */}
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={profileData.firstName} 
                        onChange={e => setProfileData({...profileData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={profileData.lastName}
                        onChange={e => setProfileData({...profileData, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" value={user?.email || ''} disabled className="bg-slate-50" />
                      <p className="text-xs text-slate-500">Email cannot be changed directly.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={profileData.phone}
                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Ensure your account is using a long, random password to stay secure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password"
                        required
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        required
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">Min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        required
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="mt-2">
                      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#16A34A]/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Authenticator App</h4>
                        <p className="text-xs text-slate-500">Secure your account with TOTP.</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.success("MFA Setup Wizard coming soon")}>
                      Manage MFA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ADMIN TABS (PLACEHOLDERS) */}
          {["general", "users", "notifications", "integrations", "appearance"].includes(activeTab) && (
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>{allTabs.find(t => t.id === activeTab)?.label}</CardTitle>
                <CardDescription>
                  Configure platform settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                  <Building2 className="h-12 w-12 text-slate-200 mb-4" />
                  <p>This settings module is under active development.</p>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
