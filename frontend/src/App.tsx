import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import { AuthLayout } from "./layouts/AuthLayout"
import { DashboardLayout } from "./layouts/DashboardLayout"
import { useAuthStore } from "./store/auth"

// Import Dashboards
import { SuperAdminDashboard } from "./pages/dashboards/SuperAdminDashboard"
import { PlatformAdminDashboard } from "./pages/dashboards/PlatformAdminDashboard"
import { LabAdminDashboard } from "./pages/dashboards/LabAdminDashboard"
import { LabStaffDashboard } from "./pages/dashboards/LabStaffDashboard"
import { InterpreterDashboard } from "./pages/dashboards/InterpreterDashboard"
import { AdvocateDashboard } from "./pages/dashboards/AdvocateDashboard"
import { ReferralPartnerDashboard } from "./pages/dashboards/ReferralPartnerDashboard"
import { PatientDashboard } from "./pages/dashboards/PatientDashboard"
import { PatientList } from "./pages/patients/PatientList"
import { PatientProfile } from "./pages/patients/PatientProfile"
import { LabList } from "./pages/laboratories/LabList"
import { LabProfile } from "./pages/laboratories/LabProfile"
import { ResultsList } from "./pages/results/ResultsList"
import { ResultsEntry } from "./pages/results/ResultsEntry"
import { InterpretationsQueue } from "./pages/interpretations/InterpretationsQueue"
import { InterpretationForm } from "./pages/interpretations/InterpretationForm"
import { BookingList } from "./pages/bookings/BookingList"
import { BookingWizard } from "./pages/bookings/BookingWizard"
import { InvoiceList } from "./pages/billing/InvoiceList"
import { PaymentTerminal } from "./pages/billing/PaymentTerminal"
import { TaskBoard } from "./pages/advocacy/TaskBoard"
import { AuditLogs } from "./pages/audit/AuditLogs"
import { SettingsDashboard } from "./pages/settings/SettingsDashboard"

// Create a client
const queryClient = new QueryClient()

// Placeholder for Login
function Login() {
  const { setUser } = useAuthStore()
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">Sign in to CareVo</h3>
        <p className="text-sm text-muted-foreground mt-1">Select a role to demo the dashboard</p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-md font-medium text-sm transition-colors" onClick={() => setUser({ id: "1", email: "admin@carevo.com", firstName: "Super", lastName: "Admin", role: "SUPER_ADMIN" })}>Super Admin</button>
        <button className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-md font-medium text-sm transition-colors" onClick={() => setUser({ id: "2", email: "platform@carevo.com", firstName: "Platform", lastName: "Admin", role: "PLATFORM_ADMIN" })}>Platform Admin</button>
        <button className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-md font-medium text-sm transition-colors" onClick={() => setUser({ id: "3", email: "labadmin@carevo.com", firstName: "Lab", lastName: "Admin", role: "LAB_ADMIN" })}>Lab Admin</button>
        <button className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-md font-medium text-sm transition-colors" onClick={() => setUser({ id: "4", email: "labstaff@carevo.com", firstName: "Lab", lastName: "Staff", role: "LAB_STAFF" })}>Lab Staff</button>
        <button className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-md font-medium text-sm transition-colors" onClick={() => setUser({ id: "5", email: "interpreter@carevo.com", firstName: "Clinical", lastName: "Interpreter", role: "INTERPRETER" })}>Interpreter</button>
        <button className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-md font-medium text-sm transition-colors" onClick={() => setUser({ id: "6", email: "advocate@carevo.com", firstName: "Health", lastName: "Advocate", role: "HEALTH_ADVOCATE" })}>Health Advocate</button>
        <button className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-md font-medium text-sm transition-colors" onClick={() => setUser({ id: "7", email: "partner@carevo.com", firstName: "Referral", lastName: "Partner", role: "REFERRAL_PARTNER" })}>Referral Partner</button>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 p-2 rounded-md font-medium text-sm shadow-sm transition-colors" onClick={() => setUser({ id: "8", email: "patient@carevo.com", firstName: "John", lastName: "Doe", role: "PATIENT" })}>Patient</button>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  
  return <>{children}</>
}

// Placeholder Pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in-50">
    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
    <p className="mt-4 text-muted-foreground max-w-md mx-auto">This module is currently under development. Please check back later for updates.</p>
  </div>
)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Dashboards */}
            <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/platform/dashboard" element={<PlatformAdminDashboard />} />
            <Route path="/lab/dashboard" element={<LabAdminDashboard />} />
            <Route path="/lab/staff/dashboard" element={<LabStaffDashboard />} />
            <Route path="/interpreter/dashboard" element={<InterpreterDashboard />} />
            <Route path="/advocate/dashboard" element={<AdvocateDashboard />} />
            <Route path="/referral/dashboard" element={<ReferralPartnerDashboard />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />

            {/* Modules Placeholders */}
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:id" element={<PatientProfile />} />
            
            <Route path="/laboratories" element={<LabList />} />
            <Route path="/laboratories/:id" element={<LabProfile />} />
            <Route path="/results" element={<ResultsList />} />
            <Route path="/results/entry/:bookingId" element={<ResultsEntry />} />
            
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/bookings/new" element={<BookingWizard />} />
            <Route path="/billing" element={<InvoiceList />} />
            <Route path="/billing/pay/:id" element={<PaymentTerminal />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/advocacy" element={<TaskBoard />} />
            <Route path="/interpretations/queue" element={<InterpretationsQueue />} />
            <Route path="/interpretations/:id" element={<InterpretationForm />} />
            
            <Route path="/patient/results" element={<Placeholder title="My Results" />} />
            <Route path="/patient/bookings" element={<Placeholder title="My Bookings" />} />
            <Route path="/patient/health" element={<Placeholder title="Health Insights" />} />
            <Route path="/patient/billing" element={<Placeholder title="My Billing" />} />
            
            <Route path="/settings" element={<SettingsDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
