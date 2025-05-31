import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  Plus,
  HomeIcon,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import dashboardService, { DashboardStats, EnrollmentTrend } from "@/services/dashboardService";
import { toast } from "sonner";

// Define the stats structure
const createStats = (stats: DashboardStats) => [
  {
    title: "Total Students",
    value: stats.totalStudents.toString(),
    icon: GraduationCap,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-600",
    trend: { value: 0, isPositive: true },
  },
  {
    title: "Faculties",
    value: stats.totalFaculties.toString(),
    icon: School,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-600",
    trend: { value: 0, isPositive: true },
  },
  {
    title: "Total Departments",
    value: stats.totalDepartments.toString(),
    icon: HomeIcon,
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-600",
    trend: { value: 0, isPositive: true },
  },
  {
    title: "Courses",
    value: stats.totalCourses.toString(),
    icon: BookOpen,
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-600",
    trend: { value: 0, isPositive: true },
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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculties: 0,
    totalDepartments: 0,
    totalCourses: 0,
  });
  const [enrollmentData, setEnrollmentData] = useState<{ name: string; students: number }[]>(defaultEnrollmentData);

  useAuthGuard(["admin"]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch both stats and enrollment trends in parallel
        const [dashboardStats, trends] = await Promise.all([
          dashboardService.getAdminStats(),
          dashboardService.getEnrollmentTrends()
        ]);
        
        setStats(dashboardStats);
        
        // Transform enrollment trends data for the chart
        if (trends.length > 0) {
          const chartData = trends.map(trend => ({
            name: trend.year.toString(),
            students: trend.students
          }));
          setEnrollmentData(chartData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  // Create stats cards with real data
  const overviewStats = createStats(stats);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, Back!`}
        // description="Academic administration dashboard overview"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          // Show loading skeleton when data is being fetched
          Array(4).fill(0).map((_, idx) => (
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
          overviewStats.map((stat, idx) => (
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
            <CardTitle>Student Enrollment Trends by Year</CardTitle>
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
                    <Bar
                      dataKey="students"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      name="Students"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                  <div
                    className="flex flex-col items-center justify-center"
                    onClick={() => navigate("/admin/courses")}
                  >
                    <BookOpen size={20} />
                    <span className="mt-1 text-sm">Add Course</span>
                  </div>
                </Card>
                <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                  <div
                    className="flex flex-col items-center justify-center"
                    onClick={() => navigate("/admin/departments")}
                  >
                    <GraduationCap size={20} />
                    <span className="mt-1 text-sm">Add Department</span>
                  </div>
                </Card>

                <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                  <div
                    className="flex flex-col items-center justify-center"
                    onClick={() => navigate("/admin/faculties")}
                  >
                    <School size={20} />
                    <span className="mt-1 text-sm">Add Faculty</span>
                  </div>
                </Card>
                <Card className="cursor-pointer border border-dashed p-3 hover:border-primary hover:text-primary">
                  <div
                    className="flex flex-col items-center justify-center"
                    onClick={() => navigate("/admin/students")}
                  >
                    <Users size={20} />
                    <span className="mt-1 text-sm">Manage Students</span>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
