import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookCheck,
  GraduationCap,
  Clock,
  UserPlus,
  PlusCircle,
  Users,
} from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useStudentApplicationStore } from "@/store/useStudentApplicationStore";
import { useStudentStore } from "@/store/useStudentStore";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import { useFacultyStore } from "@/store/useFacultyStore";
import dashboardService from "@/services/dashboardService";
import { toast } from "sonner";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useNavigate } from "react-router-dom";

// Create stats cards with real data
const createAdmissionStats = (
  totalStudents: number,
  activeStudents: number,
  maleTotalCount: number,
  femaleTotalCount: number,
  maleActiveCount: number,
  femaleActiveCount: number,
) => [
  {
    title: "Total Students",
    value: totalStudents.toString(),
    icon: Users,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-600",
    trend: { value: 0, isPositive: true },
  },
  //   {
  //     title: "Active Students",
  //     value: activeStudents.toString(),
  //     icon: Users,
  //     iconColor: "text-green-600",
  //     bgColor: "bg-green-600",
  //   },
  {
    title: "Male Students",
    value: `${maleActiveCount}`,
    icon: Users,
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-600",
  },
  {
    title: "Female Students",
    value: `${femaleActiveCount}`,
    icon: GraduationCap,
    iconColor: "text-pink-600",
    bgColor: "bg-pink-600",
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
const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"];

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
  const [departmentStats, setDepartmentStats] = useState<
    { name: string; count: number }[]
  >([]);

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
            const chartData = trends.map((trend) => ({
              name: trend.year.toString(),
              students: trend.students,
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
      const maleTotal = students.filter(
        (student) => student.gender === "male",
      ).length;
      const femaleTotal = students.filter(
        (student) => student.gender === "female",
      ).length;

      const maleActive = students.filter(
        (student) => student.gender === "male" && student.isActive,
      ).length;
      const femaleActive = students.filter(
        (student) => student.gender === "female" && student.isActive,
      ).length;

      setGenderData([
        { name: "Male ", value: maleTotal },
        { name: "Female", value: femaleTotal },
      ]);
    }
  }, [students]);

  // Calculate department statistics
  useEffect(() => {
    if (students.length > 0 && departments.length > 0) {
      const deptCounts = departments.map((dept) => {
        const count = students.filter(
          (student) => student.departmentId === dept.id,
        ).length;
        return { name: dept.name, count };
      });

      // Sort by count in descending order and take top 5
      const sortedDepts = [...deptCounts]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setDepartmentStats(sortedDepts);
    }
  }, [students, departments]);

  // Count pending applications
  const pendingApplications = applications.filter(
    (app) => app.status === "pending",
  ).length;

  // Count active students and gender distribution
  const activeStudents = students.filter((student) => student.isActive).length;
  const maleTotalCount = students.filter(
    (student) => student.gender === "male",
  ).length;
  const femaleTotalCount = students.filter(
    (student) => student.gender === "female",
  ).length;
  const maleActiveCount = students.filter(
    (student) => student.gender === "male" && student.isActive,
  ).length;
  const femaleActiveCount = students.filter(
    (student) => student.gender === "female" && student.isActive,
  ).length;

  // Create stats with real data
  const admissionStats = createAdmissionStats(
    students.length,
    activeStudents,
    maleTotalCount,
    femaleTotalCount,
    maleActiveCount,
    femaleActiveCount,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Dashboard"
        description="Overview of student applications and enrollment"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? // Show loading skeleton when data is being fetched
            Array(3)
              .fill(0)
              .map((_, idx) => (
                <Card key={idx} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-full bg-gray-200 mb-4"></div>
                    <div className="h-4 w-24 bg-gray-200 mb-2"></div>
                    <div className="h-6 w-16 bg-gray-300"></div>
                  </CardContent>
                </Card>
              ))
          : // Show actual stats when data is loaded
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
            ))}
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
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
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
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                <div
                  className="flex flex-col items-center justify-center"
                  onClick={() => navigate("/admission/students")}
                >
                  <GraduationCap size={20} />
                  <span className="mt-1 text-sm text-center">
                    Manage Students
                  </span>
                </div>
              </Card>

              <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                <div
                  className="flex flex-col items-center justify-center"
                  onClick={() => navigate("/admission/student-enrollment")}
                >
                  <Clock size={20} />
                  <span className="mt-1 text-sm text-center">
                    Enrollment Status
                  </span>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6"></div>
    </div>
  );
};

export default AdmissionDashboard;
