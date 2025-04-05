import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import PageHeader from "@/components/PageHeader"
import StatsCard from "@/components/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookCheck, BookOpen, Clock, GraduationCap } from "lucide-react"
import { DataTable } from "@/components/DataTable"
import { ColumnDef } from "@tanstack/react-table"

// Sample stats for admission dashboard
const admissionStats = [
  {
    title: "My Courses",
    value: "5",
    icon: BookOpen,
    iconColor: "text-blue-600",
  },
  {
    title: "Enrolled Students",
    value: "156",
    icon: GraduationCap,
    iconColor: "text-indigo-600",
  },
  {
    title: "Pending Exams",
    value: "3",
    icon: Clock,
    iconColor: "text-amber-600",
  },
  {
    title: "Graded Work",
    value: "42",
    icon: BookCheck,
    iconColor: "text-green-600",
  },
]

// Sample student data for the table
interface Student {
  id: string
  name: string
  email: string
  course: string
  enrollmentDate: string
  status: string
}

const studentsData: Student[] = [
  {
    id: "STU001",
    name: "John Doe",
    email: "john.doe@university.edu",
    course: "Computer Science 101",
    enrollmentDate: "2023-09-01",
    status: "Active",
  },
  {
    id: "STU002",
    name: "Jane Smith",
    email: "jane.smith@university.edu",
    course: "Computer Science 101",
    enrollmentDate: "2023-09-01",
    status: "Active",
  },
  {
    id: "STU003",
    name: "Bob Johnson",
    email: "bob.johnson@university.edu",
    course: "Data Structures",
    enrollmentDate: "2023-09-05",
    status: "Active",
  },
  {
    id: "STU004",
    name: "Alice Brown",
    email: "alice.brown@university.edu",
    course: "Database Systems",
    enrollmentDate: "2023-09-03",
    status: "Active",
  },
  {
    id: "STU005",
    name: "Charlie Wilson",
    email: "charlie.wilson@university.edu",
    course: "Database Systems",
    enrollmentDate: "2023-09-03",
    status: "On Leave",
  },
]

// Define table columns
const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "id",
    header: "Student ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "course",
    header: "Course",
  },
  {
    accessorKey: "enrollmentDate",
    header: "Enrollment Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            status === "Active"
              ? "bg-green-100 text-green-800"
              : status === "On Leave"
              ? "bg-amber-100 text-amber-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      )
    },
  },
]

const AdmissionDashboard = () => {
  const { user } = useAuth()
  useAuthGuard(["admission"])

  useEffect(() => {
    // This could fetch admission dashboard data from an API
    console.log("admission dashboard loaded")
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name}`}
        description="Manage your courses and student records"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {admissionStats.map((stat, idx) => (
          <StatsCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Computer Science 101</p>
                    <p className="text-sm text-muted-foreground">
                      Lecture Hall A
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Monday</p>
                    <p className="text-sm text-muted-foreground">
                      9:00 AM - 11:00 AM
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Structures</p>
                    <p className="text-sm text-muted-foreground">Lab Room 2</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Tuesday</p>
                    <p className="text-sm text-muted-foreground">
                      1:00 PM - 3:00 PM
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Database Systems</p>
                    <p className="text-sm text-muted-foreground">
                      Lecture Hall C
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Wednesday</p>
                    <p className="text-sm text-muted-foreground">
                      10:00 AM - 12:00 PM
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Office Hours</p>
                    <p className="text-sm text-muted-foreground">
                      Faculty Office 305
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Thursday</p>
                    <p className="text-sm text-muted-foreground">
                      2:00 PM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <p className="font-medium">Midterm Exams</p>
                <p className="text-sm text-muted-foreground">
                  Midterm exams will be held from October 10-15. Please prepare
                  your exam materials by October 1st.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Posted on: September 15, 2023
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-medium">Faculty Meeting</p>
                <p className="text-sm text-muted-foreground">
                  Monthly faculty meeting will be held on September 25th at 3:00
                  PM in the Conference Room.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Posted on: September 10, 2023
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-medium">Grade Submission Deadline</p>
                <p className="text-sm text-muted-foreground">
                  Please submit all pending grades for the previous semester by
                  September 20th.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Posted on: September 5, 2023
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Student Activity</h2>
        <DataTable columns={columns} data={studentsData} />
      </div>
    </div>
  )
}

export default AdmissionDashboard
