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
  DollarSign,
  LineChart as LineChartIcon,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  TrendingUp,
  Filter,
  RefreshCw,
  CreditCard,
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
  CourseEnrollment,
  TuitionFeeIncome,
} from "@/services/reportsService";
import { departmentService } from "@/services/departmentService";
import { Department } from "@/types/department";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Faculty } from "@/types/faculty";
import { facultyService } from "@/services/facultyService";

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

// Define columns for the tuition fee income data table
const tuitionFeeColumns: ColumnDef<TuitionFeeIncome>[] = [
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("department")}</div>
    ),
  },
  {
    accessorKey: "batch",
    header: "Batch",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("batch")}</Badge>,
  },
  {
    accessorKey: "activeStudents",
    header: "Active Students",
    cell: ({ row }) => (
      <div className="text-center font-semibold text-blue-600">
        {row.getValue("activeStudents")}
      </div>
    ),
  },
  {
    accessorKey: "totalTuitionFee",
    header: "Total Tuition Fee",
    cell: ({ row }) => (
      <div className="text-center font-semibold text-green-600">
        ${Number(row.getValue("totalTuitionFee")).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "forwarded",
    header: "Forwarded",
    cell: ({ row }) => (
      <div className="text-center text-orange-600">
        ${Number(row.getValue("forwarded")).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => (
      <div className="text-center text-red-600">
        ${Number(row.getValue("discount")).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "incomeExpected",
    header: "Income Expected",
    cell: ({ row }) => (
      <div className="text-center font-semibold text-purple-600">
        ${Number(row.getValue("incomeExpected")).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "accruedIncome",
    header: "Accrued Income",
    cell: ({ row }) => (
      <div className="text-center text-green-500">
        ${Number(row.getValue("accruedIncome")).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "deferredIncome",
    header: "Deferred Income",
    cell: ({ row }) => (
      <div className="text-center text-yellow-600">
        ${Number(row.getValue("deferredIncome")).toLocaleString()}
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

// Define columns for the course enrollment data table
const courseColumns: ColumnDef<CourseEnrollment>[] = [
  {
    accessorKey: "code",
    header: "Course Code",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium text-blue-600">
        {row.getValue("code")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Course Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("department")}</Badge>
    ),
  },
  {
    accessorKey: "semester",
    header: "Semester",
    cell: ({ row }) => (
      <div className="text-center font-semibold text-green-600">
        {row.getValue("semester")}
      </div>
    ),
  },
  {
    accessorKey: "credits",
    header: "Credits",
    cell: ({ row }) => (
      <div className="text-center text-gray-600">{row.getValue("credits")}</div>
    ),
  },
  {
    accessorKey: "instructor",
    header: "Instructor",
    cell: ({ row }) => (
      <div className="text-sm text-gray-700">{row.getValue("instructor")}</div>
    ),
  },
];

const ReportsPage = () => {
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  // Fetch faculties for filter
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const faculties = await facultyService.getAllFaculties();
        setFaculties(faculties);
      } catch (error) {
        console.error("Error fetching faculties:", error);
      }
    };
    fetchFaculties();
  }, []);

  // Prepare filters
  const filters: ReportFilters = {
    academicYear,
    facultyId: selectedFaculty || undefined,
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
          case "tuitionFeeIncome":
            downloadPromise =
              exportService.exportTuitionFeeIncomePDF(downloadFilters);
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
          case "tuitionFeeIncome":
            downloadPromise =
              exportService.exportTuitionFeeIncomeExcel(downloadFilters);
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
                Faculty
              </label>
              <Select
                value={selectedFaculty || "all"}
                onValueChange={(value) =>
                  setSelectedFaculty(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="border-blue-200">
                  <SelectValue placeholder="All Faculties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading
                    ? "..."
                    : `$${reportsData?.paymentSummary.totalPaid.toLocaleString() || 0}`}
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
            value="financial"
            className="flex items-center gap-2 data-[state=active]:bg-white"
          >
            <DollarSign className="h-4 w-4" />
            Financial
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
              {/* Enrollment by Department Table */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        {selectedFaculty
                          ? `Students by Department - ${faculties.find((f) => f.id === selectedFaculty)?.name}`
                          : "Enrollment by Department"}
                      </CardTitle>
                      <CardDescription>
                        {selectedFaculty
                          ? "Detailed student distribution in selected faculty"
                          : "Student distribution across all departments"}
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

        <TabsContent value="financial" className="space-y-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorComponent />
          ) : (
            <>
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Payments
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {reportsData?.paymentSummary.totalPayments || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Expected
                        </p>
                        <p className="text-xl font-bold text-purple-600">
                          $
                          {reportsData?.tuitionFeeIncome.reduce(
                            (sum, dept) => sum + dept.totalTuitionFee,
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
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Paid
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          $
                          {reportsData?.paymentSummary.totalPaid.toLocaleString() ||
                            0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-xl font-bold text-yellow-600">
                          $
                          {reportsData?.paymentSummary.totalPending.toLocaleString() ||
                            0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tuition Fee Income Chart */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Tuition Fee Income Overview
                      </CardTitle>
                      <CardDescription>
                        Financial overview by department (Active Students Only)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportsData?.tuitionFeeIncome || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="department"
                        stroke="#666"
                        angle={-45}
                        textAnchor="end"
                        height={120}
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                        }}
                        formatter={(value, name) => [
                          `$${Number(value).toLocaleString()}`,
                          name,
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="totalTuitionFee"
                        fill="#3b82f6"
                        name="Total Tuition Fee"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="accruedIncome"
                        fill="#10b981"
                        name="Accrued Income"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="deferredIncome"
                        fill="#f59e0b"
                        name="Deferred Income"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tuition Fee Income Table */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        Tuition Fee Income Details
                      </CardTitle>
                      <CardDescription>
                        Comprehensive financial breakdown by department and
                        batch (Active Students Only)
                      </CardDescription>
                    </div>
                    <ExportButtons
                      onExportPDF={() =>
                        handleDownloadReport(
                          "tuitionFeeIncome",
                          "Tuition Fee Income",
                          "pdf",
                        )
                      }
                      onExportExcel={() =>
                        handleDownloadReport(
                          "tuitionFeeIncome",
                          "Tuition Fee Income",
                          "excel",
                        )
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {reportsData?.tuitionFeeIncome &&
                  reportsData.tuitionFeeIncome.length > 0 ? (
                    <DataTable
                      columns={tuitionFeeColumns}
                      data={reportsData.tuitionFeeIncome}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">💰</div>
                        <h3 className="text-lg font-semibold mb-2">
                          No Financial Data Available
                        </h3>
                        <p className="text-muted-foreground">
                          No tuition fee data found for the selected filters.
                          Try adjusting your search criteria.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorComponent />
          ) : (
            <>
              {/* Course Enrollment Detailed Table */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-orange-600" />
                        Course Enrollment Details
                      </CardTitle>
                      <CardDescription>
                        Comprehensive course enrollment data organized by
                        department
                      </CardDescription>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        {reportsData?.courseEnrollment?.length || 0} Courses
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        {
                          new Set(
                            reportsData?.courseEnrollment?.map(
                              (c) => c.department,
                            ) || [],
                          ).size
                        }{" "}
                        Departments
                      </Badge>
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
                  </div>
                </CardHeader>
                <CardContent>
                  {reportsData?.courseEnrollment &&
                  reportsData.courseEnrollment.length > 0 ? (
                    <div className="space-y-6">
                      {/* Department Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from(
                          new Set(
                            reportsData.courseEnrollment.map(
                              (c) => c.department,
                            ),
                          ),
                        ).map((department) => {
                          const deptCourses =
                            reportsData.courseEnrollment.filter(
                              (c) => c.department === department,
                            );
                          const totalStudents = deptCourses.reduce(
                            (sum, course) => sum + course.students,
                            0,
                          );
                          const totalCourses = deptCourses.length;

                          return (
                            <Card
                              key={department}
                              className="border-l-4 border-l-green-500"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-green-100 rounded-lg">
                                    <Building2 className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {department}
                                    </p>
                                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                                      <span>{totalCourses} courses</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Detailed Data Table */}
                      <div className="border rounded-lg">
                        <DataTable
                          columns={courseColumns}
                          data={reportsData.courseEnrollment}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                        <h3 className="text-lg font-semibold mb-2">
                          No Course Data Available
                        </h3>
                        <p className="text-muted-foreground">
                          No courses found for the selected filters. Try
                          adjusting your search criteria.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
