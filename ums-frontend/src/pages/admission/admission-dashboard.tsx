import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCheck, GraduationCap, Clock, UserPlus, PlusCircle } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useStudentApplicationStore } from "@/store/useStudentApplicationStore";
import { useStudentStore } from "@/store/useStudentStore";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import { useFacultyStore } from "@/store/useFacultyStore";
import dashboardService from "@/services/dashboardService";
import { toast } from "sonner";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

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

// Create stats cards with real data
const createAdmissionStats = (totalStudents: number, enrolledStudents: number, pendingApplications: number) => [
  {
    title: "Total Students",
    value: totalStudents.toString(),
    icon: GraduationCap,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-600",
    trend: { value: 0, isPositive: true },
  },
  {
    title: "Enrolled Students",
    value: enrolledStudents.toString(),
    icon: GraduationCap,
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-600",
  },
  {
    title: "Pending Applications",
    value: pendingApplications.toString(),
    icon: Clock,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-600",
  },
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

// Default enrollment data (will be replaced with real data)
const defaultEnrollmentData = [
  { name: "2020", students: 0 },
  { name: "2021", students: 0 },
  { name: "2022", students: 0 },
  { name: "2023", students: 0 },
  { name: "2024", students: 0 },
];

// Default gender distribution data
const defaultGenderData = [
  { name: "Male", value: 0 },
  { name: "Female", value: 0 },
];

// Colors for the pie chart
const COLORS = ["#0088FE", "#FF8042"];

const AdmissionDashboard = () => {
  useAuthGuard(["admission"]);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { applications, fetchApplications } = useStudentApplicationStore();
  const { students, fetchStudents } = useStudentStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { faculties, fetchFaculties } = useFacultyStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState(defaultEnrollmentData);
  const [genderData, setGenderData] = useState(defaultGenderData);
  const [departmentStats, setDepartmentStats] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchApplications(),
          fetchStudents(),
          fetchDepartments(),
          fetchFaculties(),
        ]);
        
        // Get enrollment trends
        try {
          const trends = await dashboardService.getEnrollmentTrends();
          if (trends.length > 0) {
            const chartData = trends.map(trend => ({
              name: trend.year.toString(),
              students: trend.students
            }));
            setEnrollmentData(chartData);
          }
        } catch (error) {
          console.error("Error fetching enrollment trends:", error);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [fetchApplications, fetchStudents, fetchDepartments, fetchFaculties]);

  // Calculate gender distribution
  useEffect(() => {
    if (students.length > 0) {
      const maleCount = students.filter(student => student.gender === 'male').length;
      const femaleCount = students.filter(student => student.gender === 'female').length;
      
      setGenderData([
        { name: "Male", value: maleCount },
        { name: "Female", value: femaleCount },
      ]);
    }
  }, [students]);

  // Calculate department statistics
  useEffect(() => {
    if (students.length > 0 && departments.length > 0) {
      const deptCounts = departments.map(dept => {
        const count = students.filter(student => student.departmentId === dept.id).length;
        return { name: dept.name, count };
      });
      
      // Sort by count in descending order and take top 5
      const sortedDepts = [...deptCounts].sort((a, b) => b.count - a.count).slice(0, 5);
      setDepartmentStats(sortedDepts);
    }
  }, [students, departments]);

  // Count pending applications
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  
  // Create stats with real data
  const admissionStats = createAdmissionStats(
    students.length,
    students.length - pendingApplications, // Enrolled = Total - Pending
    pendingApplications
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Dashboard"
        description="Overview of student applications and enrollment"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Show loading skeleton when data is being fetched
          Array(3).fill(0).map((_, idx) => (
            <Card key={idx} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-full bg-gray-200 mb-4"></div>
                <div className="h-4 w-24 bg-gray-200 mb-2"></div>
                <div className="h-6 w-16 bg-gray-300"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Show actual stats when data is loaded
          admissionStats.map((stat, idx) => (
            <StatsCard
              key={idx}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              iconColor={stat.iconColor}
              bgColor={stat.bgColor}
            />
          ))
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trends by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="animate-pulse h-4/5 w-4/5 bg-gray-200 rounded-md"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="students"
                      name="Students"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="animate-pulse h-4/5 w-4/5 bg-gray-200 rounded-md"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Students by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="animate-pulse h-4/5 w-4/5 bg-gray-200 rounded-md"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentStats}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Students" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeleton
                Array(3).fill(0).map((_, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))
              ) : (
                // Actual data
                applications
                  .filter((app) => app.status === "pending")
                  .slice(0, 3)
                  .map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between border-b pb-3"
                    >
                      <div>
                        <p className="font-medium">{app.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.desiredDepartment}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/admission/student-admission")}
                      >
                        Review
                      </Button>
                    </div>
                  ))
              )}

              {!isLoading && applications.filter((app) => app.status === "pending")
                .length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No pending applications
                </p>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/admission/student-admission")}
              >
                View All Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                <div
                  className="flex flex-col items-center justify-center"
                  onClick={() => navigate("/admission/student-admission")}
                >
                  <UserPlus size={20} />
                  <span className="mt-1 text-sm">Review Applications</span>
                </div>
              </Card>
              <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                <div
                  className="flex flex-col items-center justify-center"
                  onClick={() => navigate("/admission/student-list")}
                >
                  <GraduationCap size={20} />
                  <span className="mt-1 text-sm">Manage Students</span>
                </div>
              </Card>
              <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                <div
                  className="flex flex-col items-center justify-center"
                  onClick={() => navigate("/admission/registration-form")}
                >
                  <PlusCircle size={20} />
                  <span className="mt-1 text-sm">New Registration</span>
                </div>
              </Card>
              <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                <div
                  className="flex flex-col items-center justify-center"
                  onClick={() => navigate("/admission/student-enrollment")}
                >
                  <Clock size={20} />
                  <span className="mt-1 text-sm">Enrollment Status</span>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdmissionDashboard;
