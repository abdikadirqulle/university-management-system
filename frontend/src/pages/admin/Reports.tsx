import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  LineChart,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  TrendingUp,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import ExportButtons from "@/components/ui/ExportButtons";
import { exportService } from "@/services/exportService";
import reportsService, {
  EnrollmentByDepartment,
  ReportFilters,
} from "@/services/reportsService";
import { departmentService } from "@/services/departmentService";
import { Department } from "@/types/department";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Define columns for the enrollment by department data table
const columns: ColumnDef<EnrollmentByDepartment>[] = [
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("department")}</div>
    ),
  },
  {
    accessorKey: "faculty",
    header: "Faculty",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("faculty")}</Badge>
    ),
  },
  {
    accessorKey: "totalStudents",
    header: "Total Students",
    cell: ({ row }) => (
      <div className="text-center font-semibold text-blue-600">
        {row.getValue("totalStudents")}
      </div>
    ),
  },
  {
    accessorKey: "maleStudents",
    header: "Male",
    cell: ({ row }) => (
      <div className="text-center text-blue-500">
        {row.getValue("maleStudents")}
      </div>
    ),
  },
  {
    accessorKey: "femaleStudents",
    header: "Female",
    cell: ({ row }) => (
      <div className="text-center text-pink-500">
        {row.getValue("femaleStudents")}
      </div>
    ),
  },
  {
    accessorKey: "fullTime",
    header: "Full Time",
    cell: ({ row }) => (
      <div className="text-center text-green-600">
        {row.getValue("fullTime")}
      </div>
    ),
  },
  {
    accessorKey: "partTime",
    header: "Part Time",
    cell: ({ row }) => (
      <div className="text-center text-orange-600">
        {row.getValue("partTime")}
      </div>
    ),
  },
];

// Color palette for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const ReportsPage = () => {
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const depts = await departmentService.getAllDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // Prepare filters
  const filters: ReportFilters = {
    academicYear,
    departmentId: selectedDepartment || undefined,
  };

  // Fetch reports data using React Query
  const {
    data: reportsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["reports", filters],
    queryFn: () => reportsService.getAllReportsData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Function to handle report download
  const handleDownloadReport = async (
    reportIdentifier: string,
    reportTitle: string,
    fileType: "pdf" | "excel",
  ) => {
    try {
      const downloadFilters = { academicYear, semester: "1" }; // Keep semester for backward compatibility
      let downloadPromise;

      if (fileType === "pdf") {
        switch (reportIdentifier) {
          case "enrollmentTrends":
            downloadPromise =
              exportService.exportEnrollmentTrendsPDF(downloadFilters);
            break;
          case "facultyDistribution":
            downloadPromise =
              exportService.exportFacultyDistributionPDF(downloadFilters);
            break;
          case "courseEnrollment":
            downloadPromise =
              exportService.exportCourseEnrollmentPDF(downloadFilters);
            break;
          case "enrollmentByDepartment":
            downloadPromise =
              exportService.exportEnrollmentByDepartmentPDF(downloadFilters);
            break;
          default:
            throw new Error(
              `Unknown report identifier for PDF export: ${reportIdentifier}`,
            );
        }
      } else if (fileType === "excel") {
        switch (reportIdentifier) {
          case "enrollmentTrends":
            downloadPromise =
              exportService.exportEnrollmentTrendsExcel(downloadFilters);
            break;
          case "facultyDistribution":
            downloadPromise =
              exportService.exportFacultyDistributionExcel(downloadFilters);
            break;
          case "courseEnrollment":
            downloadPromise =
              exportService.exportCourseEnrollmentExcel(downloadFilters);
            break;
          case "enrollmentByDepartment":
            downloadPromise =
              exportService.exportEnrollmentByDepartmentExcel(downloadFilters);
            break;
          default:
            throw new Error(
              `Unknown report identifier for Excel export: ${reportIdentifier}`,
            );
        }
      }

      if (downloadPromise) {
        await downloadPromise;
        toast.success(
          `${reportTitle} ${fileType.toUpperCase()} report downloaded successfully!`,
        );
      } else {
        throw new Error("Could not determine download action.");
      }
    } catch (error: unknown) {
      console.error(
        `Error downloading ${reportTitle} ${fileType} report:`,
        error,
      );
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(
        `Failed to download ${reportTitle} ${fileType} report. ${errorMessage}`,
      );
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Failed to load reports</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the reports data. Please try again.
          </p>
          <Button onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Reports"
        description="Comprehensive analytics and insights for university management"
      />
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading
                    ? "..."
                    : reportsData?.enrollmentByDepartment.reduce(
                        (sum, dept) => sum + dept.totalStudents,
                        0,
                      ) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faculties</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading
                    ? "..."
                    : reportsData?.facultyDistribution.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {isLoading
                    ? "..."
                    : reportsData?.enrollmentByDepartment.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold text-orange-600">
                  {isLoading
                    ? "..."
                    : reportsData?.courseEnrollment.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters Section */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Report Filters</CardTitle>
          </div>
          <CardDescription>
            Select parameters to generate customized reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">
                Academic Year
              </label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger className="border-blue-200">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 6 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    const academicYear = `${year}-${year + 1}`;
                    return (
                      <SelectItem key={academicYear} value={academicYear}>
                        {academicYear}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">
                Department
              </label>
              <Select
                value={selectedDepartment || "all"}
                onValueChange={(value) =>
                  setSelectedDepartment(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="border-blue-200">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="enrollment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
          <TabsTrigger
            value="enrollment"
            className="flex items-center gap-2 data-[state=active]:bg-white"
          >
            <BarChartIcon className="h-4 w-4" />
            Enrollment
          </TabsTrigger>
          <TabsTrigger
            value="faculty"
            className="flex items-center gap-2 data-[state=active]:bg-white"
          >
            <PieChartIcon className="h-4 w-4" />
            Faculty
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="flex items-center gap-2 data-[state=active]:bg-white"
          >
            <LineChartIcon className="h-4 w-4" />
            Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="space-y-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorComponent />
          ) : (
            <>
              {/* Enrollment Trends Chart */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Enrollment Trends
                      </CardTitle>
                      <CardDescription>
                        Monthly student enrollment for {academicYear}
                        {selectedDepartment &&
                          ` - ${departments.find((d) => d.id === selectedDepartment)?.name}`}
                      </CardDescription>
                    </div>
                    <ExportButtons
                      onExportPDF={() =>
                        handleDownloadReport(
                          "enrollmentTrends",
                          "Enrollment Trends",
                          "pdf",
                        )
                      }
                      onExportExcel={() =>
                        handleDownloadReport(
                          "enrollmentTrends",
                          "Enrollment Trends",
                          "excel",
                        )
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportsData?.enrollmentTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="students"
                        fill="#3b82f6"
                        name="Students"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Enrollment by Department Table */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        Enrollment by Department
                      </CardTitle>
                      <CardDescription>
                        Detailed student distribution across departments
                      </CardDescription>
                    </div>
                    <ExportButtons
                      onExportPDF={() =>
                        handleDownloadReport(
                          "enrollmentByDepartment",
                          "Enrollment by Department",
                          "pdf",
                        )
                      }
                      onExportExcel={() =>
                        handleDownloadReport(
                          "enrollmentByDepartment",
                          "Enrollment by Department",
                          "excel",
                        )
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={reportsData?.enrollmentByDepartment || []}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="faculty" className="space-y-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorComponent />
          ) : (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      Faculty Distribution
                    </CardTitle>
                    <CardDescription>
                      Distribution of students across faculties
                    </CardDescription>
                  </div>
                  <ExportButtons
                    onExportPDF={() =>
                      handleDownloadReport(
                        "facultyDistribution",
                        "Faculty Distribution",
                        "pdf",
                      )
                    }
                    onExportExcel={() =>
                      handleDownloadReport(
                        "facultyDistribution",
                        "Faculty Distribution",
                        "excel",
                      )
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={reportsData?.facultyDistribution || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {reportsData?.facultyDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorComponent />
          ) : (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-orange-600" />
                      Course Enrollment
                    </CardTitle>
                    <CardDescription>
                      Top courses by enrollment for {academicYear}
                    </CardDescription>
                  </div>
                  <ExportButtons
                    onExportPDF={() =>
                      handleDownloadReport(
                        "courseEnrollment",
                        "Course Enrollment",
                        "pdf",
                      )
                    }
                    onExportExcel={() =>
                      handleDownloadReport(
                        "courseEnrollment",
                        "Course Enrollment",
                        "excel",
                      )
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={reportsData?.courseEnrollment || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="#f97316"
                      strokeWidth={3}
                      activeDot={{ r: 8, fill: "#f97316" }}
                      name="Students"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
