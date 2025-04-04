import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import PageHeader from "@/components/PageHeader"
import StatsCard from "@/components/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Users, GraduationCap, School, BookOpen, Plus } from "lucide-react"

// Sample data for the dashboard
const overviewStats = [
  {
    title: "Total Students",
    value: "12,543",
    icon: GraduationCap,
    iconColor: "text-blue-600",
    trend: { value: 12, isPositive: true },
  },
  {
    title: "Total admission",
    value: "842",
    icon: Users,
    iconColor: "text-indigo-600",
    trend: { value: 5, isPositive: true },
  },
  {
    title: "Faculties",
    value: "8",
    icon: School,
    iconColor: "text-purple-600",
    trend: { value: 0, isPositive: true },
  },
  {
    title: "Courses",
    value: "384",
    icon: BookOpen,
    iconColor: "text-emerald-600",
    trend: { value: 3, isPositive: true },
  },
]

const enrollmentData = [
  { name: "Jan", students: 2500 },
  { name: "Feb", students: 3200 },
  { name: "Mar", students: 3000 },
  { name: "Apr", students: 4000 },
  { name: "May", students: 3800 },
  { name: "Jun", students: 3500 },
  { name: "Jul", students: 3300 },
  { name: "Aug", students: 4200 },
  { name: "Sep", students: 5000 },
  { name: "Oct", students: 4800 },
  { name: "Nov", students: 4600 },
  { name: "Dec", students: 4400 },
]

const Dashboard = () => {
  const { user } = useAuth()
  useAuthGuard(["academic"])

  useEffect(() => {
    // This could fetch dashboard data from an API
    console.log("Admin dashboard loaded")
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name}`}
        description="Academic administration dashboard overview"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, idx) => (
          <StatsCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Enrollment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar
                    dataKey="students"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="rounded-lg border p-3">
                  <p className="font-semibold">New Faculty Orientation</p>
                  <p className="text-sm text-muted-foreground">
                    Orientation for new faculty members will be held on Oct 15th
                    at 9:00 AM.
                  </p>
                </li>
                <li className="rounded-lg border p-3">
                  <p className="font-semibold">Fall Semester Registration</p>
                  <p className="text-sm text-muted-foreground">
                    Registration for Fall 2023 semester starts on August 1st.
                  </p>
                </li>
                <li className="rounded-lg border p-3">
                  <p className="font-semibold">System Maintenance</p>
                  <p className="text-sm text-muted-foreground">
                    Scheduled maintenance on July 15th from 11:00 PM to 2:00 AM.
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                  <div className="flex flex-col items-center justify-center">
                    <Users size={20} />
                    <span className="mt-1 text-sm">Add admission</span>
                  </div>
                </Card>
                <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                  <div className="flex flex-col items-center justify-center">
                    <GraduationCap size={20} />
                    <span className="mt-1 text-sm">Add Student</span>
                  </div>
                </Card>
                <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                  <div className="flex flex-col items-center justify-center">
                    <BookOpen size={20} />
                    <span className="mt-1 text-sm">Add Course</span>
                  </div>
                </Card>
                <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                  <div className="flex flex-col items-center justify-center">
                    <School size={20} />
                    <span className="mt-1 text-sm">Add Faculty</span>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
