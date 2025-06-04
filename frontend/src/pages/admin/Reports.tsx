import { useState } from "react";
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
} from "recharts";
import {
  FileSpreadsheet,
  Download,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
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

// Sample data for enrollment chart
const enrollmentData = [
  { name: "Jan", value: 120 },
  { name: "Feb", value: 145 },
  { name: "Mar", value: 150 },
  { name: "Apr", value: 170 },
  { name: "May", value: 190 },
  { name: "Jun", value: 130 },
  { name: "Jul", value: 110 },
  { name: "Aug", value: 220 },
  { name: "Sep", value: 260 },
  { name: "Oct", value: 240 },
  { name: "Nov", value: 220 },
  { name: "Dec", value: 200 },
];

// Sample data for faculty distribution
const facultyDistributionData = [
  { name: "Science", value: 45 },
  { name: "Engineering", value: 35 },
  { name: "Business", value: 30 },
  { name: "Arts", value: 25 },
  { name: "Medicine", value: 20 },
];

// Sample data for course enrollment
const courseEnrollmentData = [
  { name: "Introduction to Programming", students: 150 },
  { name: "Business Ethics", students: 120 },
  { name: "Organic Chemistry", students: 95 },
  { name: "World History", students: 110 },
  { name: "Calculus I", students: 130 },
];

// Sample data for enrollment by department
interface EnrollmentRecord {
  id: string;
  department: string;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  fullTime: number;
  partTime: number;
}

const enrollmentByDepartment: EnrollmentRecord[] = [
  {
    id: "1",
    department: "Computer Science",
    totalStudents: 456,
    maleStudents: 320,
    femaleStudents: 136,
    fullTime: 400,
    partTime: 56,
  },
  {
    id: "2",
    department: "Business Administration",
    totalStudents: 380,
    maleStudents: 190,
    femaleStudents: 190,
    fullTime: 310,
    partTime: 70,
  },
  {
    id: "3",
    department: "Electrical Engineering",
    totalStudents: 290,
    maleStudents: 230,
    femaleStudents: 60,
    fullTime: 265,
    partTime: 25,
  },
  {
    id: "4",
    department: "Psychology",
    totalStudents: 420,
    maleStudents: 150,
    femaleStudents: 270,
    fullTime: 380,
    partTime: 40,
  },
  {
    id: "5",
    department: "Literature",
    totalStudents: 210,
    maleStudents: 70,
    femaleStudents: 140,
    fullTime: 180,
    partTime: 30,
  },
];

// Define columns for the data table
const columns: ColumnDef<EnrollmentRecord>[] = [
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "totalStudents",
    header: "Total Students",
  },
  {
    accessorKey: "maleStudents",
    header: "Male",
  },
  {
    accessorKey: "femaleStudents",
    header: "Female",
  },
  {
    accessorKey: "fullTime",
    header: "Full Time",
  },
  {
    accessorKey: "partTime",
    header: "Part Time",
  },
];

const ReportsPage = () => {
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [semester, setSemester] = useState("1");

  // Function to handle report download
  const handleDownloadReport = async (
    reportIdentifier: string, // e.g., "enrollmentTrends"
    reportTitle: string,     // e.g., "Enrollment Trends"
    fileType: "pdf" | "excel"
  ) => {
    try {
      const filters = { academicYear, semester };
      let downloadPromise;

      if (fileType === "pdf") {
        switch (reportIdentifier) {
          case "enrollmentTrends":
            downloadPromise = exportService.exportEnrollmentTrendsPDF(filters);
            break;
          case "facultyDistribution":
            downloadPromise = exportService.exportFacultyDistributionPDF(filters);
            break;
          case "courseEnrollment":
            downloadPromise = exportService.exportCourseEnrollmentPDF(filters);
            break;
          case "enrollmentByDepartment":
            downloadPromise = exportService.exportEnrollmentByDepartmentPDF(filters);
            break;
          default:
            throw new Error(`Unknown report identifier for PDF export: ${reportIdentifier}`);
        }
      } else if (fileType === "excel") {
        switch (reportIdentifier) {
          case "enrollmentTrends":
            downloadPromise = exportService.exportEnrollmentTrendsExcel(filters);
            break;
          case "facultyDistribution":
            downloadPromise = exportService.exportFacultyDistributionExcel(filters);
            break;
          case "courseEnrollment":
            downloadPromise = exportService.exportCourseEnrollmentExcel(filters);
            break;
          case "enrollmentByDepartment":
            downloadPromise = exportService.exportEnrollmentByDepartmentExcel(filters);
            break;
          default:
            throw new Error(`Unknown report identifier for Excel export: ${reportIdentifier}`);
        }
      }

      if (downloadPromise) {
        await downloadPromise;
        // toast.success(`${reportTitle} ${fileType.toUpperCase()} report downloaded successfully!`);
      } else {
        throw new Error("Could not determine download action.");
      }
    } catch (error: any) {
      console.error(`Error downloading ${reportTitle} ${fileType} report:`, error);
      toast.error(`Failed to download ${reportTitle} ${fileType} report. ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View and generate academic reports"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Select parameters to generate reports
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <label className="text-sm font-medium block mb-2">
                Academic Year
              </label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2022-2023">2022-2023</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-1/2">
              <label className="text-sm font-medium block mb-2">Semester</label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={`${i + 1}`}>
                      Semester {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
            <CardDescription>
              Download reports in different formats
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              // onClick={() => handleDownloadReport("Enrollment")}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Enrollment Report
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              // onClick={() => handleDownloadReport("Student")}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Student Report
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              // onClick={() => handleDownloadReport("Faculty")}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Faculty Report
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              // onClick={() => handleDownloadReport("Course")}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Course Report
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              // onClick={() => handleDownloadReport("Financial")}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Financial Report
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              // onClick={() => handleDownloadReport("Academic")}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Academic Report
            </Button>
            
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrollment">
        <TabsList className="mb-4">
          <TabsTrigger value="enrollment" className="flex items-center gap-2">
            <BarChartIcon className="h-4 w-4" />
            Enrollment
          </TabsTrigger>
          <TabsTrigger value="faculty" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Faculty
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Enrollment Trends</CardTitle>
                  <CardDescription>
                    Monthly student enrollment for {academicYear}
                  </CardDescription>
                </div>
                <ExportButtons 
                  onExportPDF={() => handleDownloadReport("enrollmentTrends", "Enrollment Trends", "pdf")} 
                  onExportExcel={() => handleDownloadReport("enrollmentTrends", "Enrollment Trends", "excel")} 
                />
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart
                width={600}
                height={300}
                data={enrollmentData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Students" />
              </BarChart>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Enrollment by Department</CardTitle>
                <CardDescription>
                  Student distribution across departments for {semester} {academicYear}
                </CardDescription>
              </div>
              <ExportButtons 
                onExportPDF={() => handleDownloadReport("enrollmentByDepartment", "Enrollment by Department", "pdf")} 
                onExportExcel={() => handleDownloadReport("enrollmentByDepartment", "Enrollment by Department", "excel")} 
              />
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={enrollmentByDepartment} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Faculty Distribution</CardTitle>
                  <CardDescription>
                    Distribution of students across faculties
                  </CardDescription>
                </div>
                <ExportButtons 
                  onExportPDF={() => handleDownloadReport("facultyDistribution", "Faculty Distribution", "pdf")} 
                  onExportExcel={() => handleDownloadReport("facultyDistribution", "Faculty Distribution", "excel")} 
                />
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <PieChart
                width={600}
                height={300}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <Pie
                  data={facultyDistributionData}
                  cx={300}
                  cy={150}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Course Enrollment</CardTitle>
                <CardDescription>
                  Top courses by enrollment for {semester} {academicYear}
                </CardDescription>
              </div>
              <ExportButtons 
                onExportPDF={() => handleDownloadReport("courseEnrollment", "Course Enrollment", "pdf")} 
                onExportExcel={() => handleDownloadReport("courseEnrollment", "Course Enrollment", "excel")} 
              />
            </CardHeader>
            <CardContent className="h-80">
              <LineChart
                width={600}
                height={300}
                data={courseEnrollmentData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Students"
                />
              </LineChart>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
