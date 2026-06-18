import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import { AuthLayout } from "./layouts/AuthLayout"
import { DashboardLayout } from "./layouts/DashboardLayout"
import { useAuthStore } from "./store/auth"

// Import Auth & Public Pages
import { LandingPage } from "./pages/LandingPage"
import { LoginPage } from "./pages/auth/LoginPage"
import { RegisterPage } from "./pages/auth/RegisterPage"
import { MFAChallengePage } from "./pages/auth/MFAChallengePage"
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage"
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage"

// Import Dashboards
import { AdminDashboard } from "./pages/dashboards/AdminDashboard"
import { LabDashboard } from "./pages/dashboards/LabDashboard"
import { InterpreterDashboard } from "./pages/dashboards/InterpreterDashboard"
import { ClientDashboard } from "./pages/dashboards/ClientDashboard"
import { ClientResults } from "./pages/dashboards/client/ClientResults"
import { ClientBookings } from "./pages/dashboards/client/ClientBookings"
import { NewBooking } from "./pages/dashboards/client/NewBooking"
import { ClientReferrals } from "./pages/dashboards/client/ClientReferrals"
import { ClientBilling } from "./pages/dashboards/client/ClientBilling"
import { PatientJourney } from "./pages/dashboards/client/PatientJourney"
import { AdminHealthAdvocacy } from "./pages/advocacy/AdminHealthAdvocacy"
import { ClientHealthAdvocacy } from "./pages/advocacy/ClientHealthAdvocacy"

// Import Modules
import { PatientList } from "./pages/patients/PatientList"
import { PatientProfile } from "./pages/patients/PatientProfile"
import { LabList } from "./pages/laboratories/LabList"
import { LabProfile } from "./pages/laboratories/LabProfile"
import { ResultsList } from "./pages/results/ResultsList"
import { ResultsEntry } from "./pages/results/ResultsEntry"
import { ResultDetail } from "./pages/results/ResultDetail"
import { InterpretationsQueue } from "./pages/interpretations/InterpretationsQueue"
import { InterpretationForm } from "./pages/interpretations/InterpretationForm"
import { BookingList } from "./pages/bookings/BookingList"
import { BookingWizard } from "./pages/bookings/BookingWizard"
import { InvoiceList } from "./pages/billing/InvoiceList"
import { PaymentTerminal } from "./pages/billing/PaymentTerminal"
import { AdminPayments } from "./pages/billing/AdminPayments"
import { AuditLogs } from "./pages/audit/AuditLogs"
import { SettingsDashboard } from "./pages/settings/SettingsDashboard"
import { UserManagement } from "./pages/admin/UserManagement"
import { PackageManagement } from "./pages/admin/PackageManagement"

// Create a client
const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  
  return <>{children}</>
}



export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/mfa-challenge" element={<MFAChallengePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            
            {/* Dashboards (4 Roles) */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/packages" element={<PackageManagement />} />
            <Route path="/admin/advocacy" element={<AdminHealthAdvocacy />} />
            <Route path="/lab/dashboard" element={<LabDashboard />} />
            <Route path="/interpreter/dashboard" element={<InterpreterDashboard />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />

            {/* Modules Placeholders */}
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:id" element={<PatientProfile />} />
            
            <Route path="/laboratories" element={<LabList />} />
            <Route path="/laboratories/:id" element={<LabProfile />} />
            <Route path="/results" element={<ResultsList />} />
            <Route path="/lab/results/enter/:referralCode" element={<ResultsEntry />} />
            
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/bookings/new" element={<BookingWizard />} />
            <Route path="/billing" element={<InvoiceList />} />
            <Route path="/billing/pay/:id" element={<PaymentTerminal />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/interpretations/queue" element={<InterpretationsQueue />} />
            <Route path="/interpreter/editor/:referralCode" element={<InterpretationForm />} />
            
            <Route path="/client/results/:id" element={<ResultDetail />} />
            <Route path="/client/results" element={<ClientResults />} />
            <Route path="/client/bookings/new" element={<NewBooking />} />
            <Route path="/client/bookings" element={<ClientBookings />} />
            <Route path="/client/referrals" element={<ClientReferrals />} />
            <Route path="/client/billing" element={<ClientBilling />} />
            <Route path="/client/journey" element={<PatientJourney />} />
            <Route path="/client/advocacy" element={<ClientHealthAdvocacy />} />
            
            <Route path="/settings" element={<SettingsDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
