import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCheck, GraduationCap, Clock, UserPlus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useStudentApplicationStore } from "@/store/useStudentApplicationStore";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Define admission requirements data - keeping this for reference though not displayed anymore
const admissionRequirements = [
  {
    title: "Academic Requirements",
    items: [
      {
        id: "req-1",
        text: "High school diploma or equivalent with minimum GPA of 3.0",
      },
      {
        id: "req-2",
        text: "Completion of required prerequisite courses for specific programs",
      },
      {
        id: "req-3",
        text: "Standardized test scores (SAT/ACT) for undergraduate applicants",
      },
      {
        id: "req-4",
        text: "GRE/GMAT scores for graduate program applicants",
      },
    ],
  },
  {
    title: "Documentation Requirements",
    items: [
      {
        id: "doc-1",
        text: "Official transcripts from all previous academic institutions",
      },
      {
        id: "doc-2",
        text: "Letters of recommendation (2-3 depending on program)",
      },
      {
        id: "doc-3",
        text: "Personal statement or statement of purpose",
      },
      {
        id: "doc-4",
        text: "Valid identification documents",
      },
    ],
  },
  {
    title: "Additional Requirements",
    items: [
      {
        id: "add-1",
        text: "International students: TOEFL/IELTS scores and visa documentation",
      },
      {
        id: "add-2",
        text: "Portfolio for arts, architecture, and design programs",
      },
      {
        id: "add-3",
        text: "Interview for specific programs (medicine, MBA, etc.)",
      },
    ],
  },
];

// Sample stats for admission dashboard - removed "My Courses"
const admissionStats = [
  {
    title: "Total Students",
    value: "543", // chage this qiimaha saxda ah from database
    icon: GraduationCap,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-600",
    trend: { value: 12, isPositive: true },
  },
  {
    title: "Enrolled Students",
    value: "156",
    icon: GraduationCap,
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-600",
  },
  {
    title: "Pending Applications",
    value: "18",
    icon: Clock,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-600",
  },
  //   {
  //     title: "Graded Work",
  //     value: "42",
  //     icon: BookCheck,
  //     iconColor: "text-green-600",
  //     bgColor: "bg-green-600",
  //   },
];

// Sample student data for the table
interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  enrollmentDate: string;
  status: string;
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
];

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
      const status = row.getValue("status") as string;
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
      );
    },
  },
];

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
];

const AdmissionDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { applications, fetchApplications } = useStudentApplicationStore();
  useAuthGuard(["admission"]);

  useEffect(() => {
    // Fetch applications data when dashboard loads
    fetchApplications();
    console.log("admission dashboard loaded");
  }, [fetchApplications]);

  // Count pending applications
  const pendingApplicationsCount = applications.filter(
    (app) => app.status === "pending",
  ).length;

  // Updated stats with real data - removed "My Courses" stats
  const updatedStats = [
    {
      ...admissionStats[0],
    },
    {
      ...admissionStats[1],
      value: pendingApplicationsCount.toString(),
    },
    {
      ...admissionStats[2],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, Back`}
        // description="Manage student applications and admission processes"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {updatedStats.map((stat, idx) => (
          <StatsCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
            bgColor={stat.bgColor}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Recent Applications</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admission/student-admission")}
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 4).map((app) => (
                <div key={app.id} className="rounded-lg border p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{app.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {app.desiredDepartment}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          app.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : app.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {app.status.charAt(0).toUpperCase() +
                          app.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Applied on: {app.applicationDate}
                  </p>
                </div>
              ))}

              {applications.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No applications found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Application Review Session</p>
                    <p className="text-sm text-muted-foreground">
                      Conference Room A
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
                    <p className="font-medium">Admission Committee Meeting</p>
                    <p className="text-sm text-muted-foreground">Board Room</p>
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
                    <p className="font-medium">Orientation Planning</p>
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
                    <p className="font-medium">Student Interviews</p>
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
        </Card> */}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* <Card>
          <CardHeader>
            <CardTitle>Important Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <p className="font-medium">Admission Deadline Extension</p>
                <p className="text-sm text-muted-foreground">
                  Fall semester admission application deadline extended to
                  August 15th. Please inform all prospective students.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Posted on: July 25, 2023
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-medium">
                  Updated Documentation Requirements
                </p>
                <p className="text-sm text-muted-foreground">
                  All international students now required to submit proof of
                  financial support with their applications.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Posted on: July 18, 2023
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-medium">Admission Committee Meeting</p>
                <p className="text-sm text-muted-foreground">
                  Quarterly admission committee meeting scheduled for August
                  5th. Please prepare application summaries.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Posted on: July 10, 2023
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recently Enrolled Students</h2>
        <DataTable columns={columns} data={studentsData} />
      </div>
    </div>
  );
};

export default AdmissionDashboard;
