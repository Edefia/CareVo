import { StatCard } from "@/components/shared/StatCard"
import { Users, Link as LinkIcon, DollarSign, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"

export function ReferralPartnerDashboard() {
  const referralData = [
    { patientName: "Kwame Mensah", dateReferred: "Oct 12, 2023", package: "Basic Wellness", status: "COMPLETED", commission: "GHS 50.00" },
    { patientName: "Ama Osei", dateReferred: "Oct 14, 2023", package: "Comprehensive", status: "PENDING", commission: "Pending" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Referral Partner Dashboard</h2>
          <p className="text-muted-foreground">Track your referrals and commissions.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Copy Referral Link
          </Button>
          <Button>Register New Patient</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Referrals" value="124" icon={Users} color="blue" />
        <StatCard title="Completed Packages" value="98" icon={CheckCircle} color="green" />
        <StatCard title="Pending Revenue" value="GHS 450" icon={DollarSign} color="amber" />
        <StatCard title="Total Earned" value="GHS 4,500" icon={DollarSign} color="teal" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={[
              { header: "Patient Name", accessorKey: "patientName" },
              { header: "Date Referred", accessorKey: "dateReferred" },
              { header: "Package", accessorKey: "package" },
              { header: "Status", accessorKey: "status" },
              { header: "Commission", accessorKey: "commission" },
            ]}
            data={referralData}
          />
        </CardContent>
      </Card>
    </div>
  )
}
