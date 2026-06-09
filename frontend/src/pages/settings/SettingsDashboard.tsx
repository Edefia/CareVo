import { useState } from "react"
import { Building2, Users, Bell, Shield, Database, LayoutDashboard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState("general")

  const tabs = [
    { id: "general", label: "General Settings", icon: Building2 },
    { id: "users", label: "User Management", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Access", icon: Shield },
    { id: "integrations", label: "Integrations", icon: Database },
    { id: "appearance", label: "Appearance", icon: LayoutDashboard },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Manage platform configurations and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {tabs.find(t => t.id === activeTab)?.label}
              </CardTitle>
              <CardDescription>
                Configure {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} settings for the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2">Platform Details</h4>
                    <p className="text-sm text-muted-foreground">CareVo Health Management System v1.0</p>
                  </div>
                  {/* More general settings would go here */}
                </div>
              )}
              {activeTab === "users" && (
                <div className="space-y-4">
                  <p className="text-sm">Manage system users, roles, and permissions.</p>
                  {/* User management component would go here */}
                </div>
              )}
              {/* Other tabs content */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
