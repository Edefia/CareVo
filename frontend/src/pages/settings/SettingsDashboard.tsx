import { useState, useRef } from "react"
<<<<<<< HEAD
import { Building2, Users, Bell, Shield, Database, LayoutDashboard, User, Camera, Loader2, CheckCircle2 } from "lucide-react"

=======
import { Building2, Users, Bell, Shield, Database, LayoutDashboard, User, Camera, Loader2, CheckCircle2, History } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
>>>>>>> bd51494230ae3f46a5b12de7b5135f8179699274
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth"
import { userService } from "@/api/services/user"
import toast from "react-hot-toast"
import { useAuditLogs } from "@/hooks/useAuditLogs"
import { DataTable } from "@/components/shared/DataTable"

export function SettingsDashboard() {
  const { user, setUser } = useAuthStore()
  
  // Default to profile tab
  const [activeTab, setActiveTab] = useState("profile")
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [auditPage, setAuditPage] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { data: auditLogsData, isLoading: auditLogsLoading } = useAuditLogs({ page: auditPage, limit: 15 })
  const auditLogs = auditLogsData?.data?.items || auditLogsData?.items || []
  const auditTotalPages = auditLogsData?.data?.totalPages || auditLogsData?.totalPages || 1

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
    { id: "audit", label: "Audit Logs", icon: History, showFor: ['ADMIN'] },
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
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1280px] mx-auto animate-fade-in-up">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-1">
            Settings
          </h1>
          <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">
            Manage your personal account and system preferences.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-[32px]">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-[240px] shrink-0 flex flex-col gap-1">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? "bg-[var(--color-forest)]/10 text-[var(--color-forest)]" 
                  : "hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-[var(--color-forest)]' : 'text-[var(--color-text-muted)]'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border)] bg-gray-50/50">
                <h2 className="font-sans text-base font-semibold text-[var(--color-text-primary)]">My Profile</h2>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                  Update your personal information and profile picture.
                </p>
              </div>
              <div className="p-6 md:p-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[var(--color-border)]">
                  <div className="relative group shrink-0">
                    <div className="h-[88px] w-[88px] rounded-full bg-[var(--color-surface-2)] flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
                      {isUploadingAvatar ? (
                        <Loader2 className="h-8 w-8 text-[var(--color-text-muted)] animate-spin" />
                      ) : user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.firstName} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-[var(--color-text-muted)]" />
                      )}
                    </div>
                    <button 
                      onClick={triggerFileInput}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border border-[var(--color-border)] shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                      title="Upload photo"
                    >
                      <Camera className="h-4 w-4 text-[var(--color-text-secondary)]" />
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
                    <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">{user?.role} ACCOUNT</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Recommended size: 400x400px. Max 5MB.</p>
                  </div>
                </div>

                {/* Info Form */}
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-[13px] font-medium text-[var(--color-text-primary)]">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={profileData.firstName} 
                        onChange={e => setProfileData({...profileData, firstName: e.target.value})}
                        className="focus:border-[var(--color-forest)] transition-colors h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-[13px] font-medium text-[var(--color-text-primary)]">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={profileData.lastName}
                        onChange={e => setProfileData({...profileData, lastName: e.target.value})}
                        className="focus:border-[var(--color-forest)] transition-colors h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[13px] font-medium text-[var(--color-text-primary)]">Email Address</Label>
                      <Input id="email" value={user?.email || ''} disabled className="bg-gray-50 h-10 text-[var(--color-text-muted)]" />
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">Email cannot be changed directly.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[13px] font-medium text-[var(--color-text-primary)]">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={profileData.phone}
                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                        className="focus:border-[var(--color-forest)] transition-colors h-10"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-[var(--color-border)] mt-8">
                    <Button type="submit" disabled={isLoading} className="bg-[var(--color-forest)] hover:bg-[var(--color-forest-mid)] text-white shadow-sm transition-all h-10 px-6">
                      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-[32px]">
              <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[var(--color-border)] bg-gray-50/50">
                  <h2 className="font-sans text-base font-semibold text-[var(--color-text-primary)]">Change Password</h2>
                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                </div>
                <div className="p-6 md:p-8">
                  <form onSubmit={handlePasswordUpdate} className="space-y-5 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-[13px] font-medium text-[var(--color-text-primary)]">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password"
                        required
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="focus:border-[var(--color-forest)] transition-colors h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-[13px] font-medium text-[var(--color-text-primary)]">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        required
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="focus:border-[var(--color-forest)] transition-colors h-10"
                      />
                      <p className="text-[12px] text-[var(--color-text-muted)] mt-1">Min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-[13px] font-medium text-[var(--color-text-primary)]">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        required
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="focus:border-[var(--color-forest)] transition-colors h-10"
                      />
                    </div>
                    <div className="pt-2">
                      <Button type="submit" disabled={isLoading} className="bg-[var(--color-forest)] hover:bg-[var(--color-forest-mid)] text-white shadow-sm transition-all h-10 px-6">
                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Update Password
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[var(--color-border)] bg-gray-50/50">
                  <h2 className="font-sans text-base font-semibold text-[var(--color-text-primary)]">Two-Factor Authentication</h2>
                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                    Add an extra layer of security to your account.
                  </p>
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between p-5 border border-[var(--color-border)] rounded-lg bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-[#16A34A]/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">Authenticator App</h4>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Secure your account with TOTP.</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.success("MFA Setup Wizard coming soon")} className="shadow-sm">
                      Manage MFA
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === "audit" && (
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>System Audit Logs</CardTitle>
                <CardDescription>
                  Track all actions performed across the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {auditLogsLoading ? (
                  <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
                ) : (
                  <>
                    <DataTable 
                      columns={[
                        { 
                          header: "Timestamp", 
                          cell: (row) => new Date(row.timestamp).toLocaleString()
                        },
                        { 
                          header: "Action", 
                          cell: (row) => <span className="font-semibold text-slate-700">{row.action}</span>
                        },
                        { 
                          header: "Actor ID", 
                          cell: (row) => <span className="font-mono text-xs bg-slate-100 p-1 rounded">{row.actorId}</span>
                        },
                        { 
                          header: "Resource Type", 
                          cell: (row) => <span className="text-sm">{row.resourceType}</span>
                        },
                        { 
                          header: "Details", 
                          cell: (row) => (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px] block" title={JSON.stringify(row.details)}>
                              {JSON.stringify(row.details)}
                            </span>
                          )
                        },
                      ]}
                      data={auditLogs}
                    />
                    
                    {/* Pagination Controls */}
                    {auditTotalPages > 1 && (
                      <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-gray-50/50">
                        <div className="text-sm text-slate-500">
                          Page {auditPage} of {auditTotalPages}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                            disabled={auditPage === 1}
                          >
                            Previous
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setAuditPage(p => Math.min(auditTotalPages, p + 1))}
                            disabled={auditPage === auditTotalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ADMIN TABS (PLACEHOLDERS) */}
          {["general", "users", "notifications", "integrations", "appearance"].includes(activeTab) && (
            <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border)] bg-gray-50/50">
                <h2 className="font-sans text-base font-semibold text-[var(--color-text-primary)]">{allTabs.find(t => t.id === activeTab)?.label}</h2>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                  Configure platform settings.
                </p>
              </div>
              <div className="p-12 text-center text-[var(--color-text-muted)] flex flex-col items-center">
                <Building2 className="h-12 w-12 text-[var(--color-border)] mb-4" />
                <p className="font-medium">This settings module is under active development.</p>
                <p className="text-sm mt-1">Check back later for updates.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
