import { useState } from "react"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { useQuery } from "@tanstack/react-query"
import PageHeader from "@/components/PageHeader"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Download, FileText } from "lucide-react"

// Mock data for reports
const monthlyRevenueData = [
  { month: "Jan", tuition: 620000, housing: 140000, other: 85000 },
  { month: "Feb", tuition: 120000, housing: 130000, other: 70000 },
  { month: "Mar", tuition: 100000, housing: 135000, other: 90000 },
  { month: "Apr", tuition: 80000, housing: 140000, other: 65000 },
  { month: "May", tuition: 60000, housing: 120000, other: 75000 },
  { month: "Jun", tuition: 50000, housing: 100000, other: 50000 },
  { month: "Jul", tuition: 40000, housing: 80000, other: 45000 },
  { month: "Aug", tuition: 750000, housing: 200000, other: 120000 },
  { month: "Sep", tuition: 800000, housing: 210000, other: 150000 },
  { month: "Oct", tuition: 130000, housing: 150000, other: 85000 },
  { month: "Nov", tuition: 110000, housing: 140000, other: 80000 },
  { month: "Dec", tuition: 90000, housing: 130000, other: 70000 },
]

const revenueBySourceData = [
  { name: "Undergraduate Tuition", value: 2850000 },
  { name: "Graduate Tuition", value: 1250000 },
  { name: "Housing & Dining", value: 1675000 },
  { name: "Research Grants", value: 950000 },
  { name: "Donations", value: 525000 },
  { name: "Other Income", value: 350000 },
]

const monthlyExpensesData = [
  {
    month: "Jan",
    academic: 350000,
    administrative: 180000,
    facilities: 120000,
    student: 90000,
  },
  {
    month: "Feb",
    academic: 340000,
    administrative: 175000,
    facilities: 115000,
    student: 85000,
  },
  {
    month: "Mar",
    academic: 360000,
    administrative: 185000,
    facilities: 125000,
    student: 95000,
  },
  {
    month: "Apr",
    academic: 355000,
    administrative: 178000,
    facilities: 118000,
    student: 88000,
  },
  {
    month: "May",
    academic: 345000,
    administrative: 176000,
    facilities: 116000,
    student: 86000,
  },
  {
    month: "Jun",
    academic: 330000,
    administrative: 170000,
    facilities: 110000,
    student: 80000,
  },
  {
    month: "Jul",
    academic: 320000,
    administrative: 165000,
    facilities: 105000,
    student: 75000,
  },
  {
    month: "Aug",
    academic: 370000,
    administrative: 190000,
    facilities: 130000,
    student: 100000,
  },
  {
    month: "Sep",
    academic: 380000,
    administrative: 195000,
    facilities: 135000,
    student: 105000,
  },
  {
    month: "Oct",
    academic: 365000,
    administrative: 187000,
    facilities: 127000,
    student: 97000,
  },
  {
    month: "Nov",
    academic: 350000,
    administrative: 180000,
    facilities: 120000,
    student: 90000,
  },
  {
    month: "Dec",
    academic: 340000,
    administrative: 175000,
    facilities: 115000,
    student: 85000,
  },
]

const expensesByTypeData = [
  { name: "Faculty Salaries", value: 2500000 },
  { name: "admission Salaries", value: 1800000 },
  { name: "Building Maintenance", value: 800000 },
  { name: "Utilities", value: 500000 },
  { name: "Student Services", value: 700000 },
  { name: "IT Infrastructure", value: 450000 },
  { name: "Research", value: 650000 },
  { name: "Other Expenses", value: 400000 },
]

const financialRatios = [
  { name: "Operating Margin", value: 8.5, target: 10, unit: "%" },
  { name: "Net Tuition per Student", value: 15200, target: 16000, unit: "$" },
  { name: "Financial Aid Ratio", value: 22.4, target: 25, unit: "%" },
  { name: "Debt to Revenue", value: 0.32, target: 0.3, unit: "ratio" },
  { name: "Endowment per Student", value: 32500, target: 35000, unit: "$" },
  { name: "Cash Flow Margin", value: 9.2, target: 12, unit: "%" },
]

const availableYears = ["2023-2024", "2022-2023", "2021-2022", "2020-2021"]

// Colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
]

const FinancialReportsPage = () => {
  useAuthGuard(["financial"])
  const [selectedYear, setSelectedYear] = useState("2023-2024")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Reports"
        description="Analyze and export detailed financial reports for the university"
        action={{
          label: "Download All Reports",
          icon: Download,
          onClick: () => console.log("Download reports"),
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <Tabs defaultValue="revenue" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
              <TabsTrigger value="ratios">Key Ratios</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <FileText className="h-4 w-4" />
                <span className="sr-only">Export current report</span>
              </Button>
            </div>
          </div>

          <TabsContent value="revenue" className="m-0 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Revenue by Month</CardTitle>
                  <CardDescription>
                    Monthly revenue breakdown for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyRevenueData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                        <RechartsTooltip
                          formatter={(value) => [
                            `$${value.toLocaleString()}`,
                            "",
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="tuition" name="Tuition" fill="#8884d8" />
                        <Bar
                          dataKey="housing"
                          name="Housing & Dining"
                          fill="#82ca9d"
                        />
                        <Bar
                          dataKey="other"
                          name="Other Revenue"
                          fill="#ffc658"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Revenue by Source</CardTitle>
                  <CardDescription>
                    Breakdown of revenue sources for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueBySourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {revenueBySourceData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value) => [
                            `$${value.toLocaleString()}`,
                            "",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm md:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                  <CardDescription>
                    Key revenue metrics for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold">$7,600,000</p>
                      <p className="text-sm text-emerald-600">
                        ↑ 8.2% from previous year
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Tuition Revenue
                      </p>
                      <p className="text-2xl font-bold">$4,100,000</p>
                      <p className="text-sm text-emerald-600">
                        ↑ 5.1% from previous year
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Revenue per Student
                      </p>
                      <p className="text-2xl font-bold">$19,500</p>
                      <p className="text-sm text-emerald-600">
                        ↑ 3.8% from previous year
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="m-0 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Monthly Expenses</CardTitle>
                  <CardDescription>
                    Expense breakdown by month for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyExpensesData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                        <RechartsTooltip
                          formatter={(value) => [
                            `$${value.toLocaleString()}`,
                            "",
                          ]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="academic"
                          name="Academic"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="administrative"
                          name="Administrative"
                          stroke="#82ca9d"
                        />
                        <Line
                          type="monotone"
                          dataKey="facilities"
                          name="Facilities"
                          stroke="#ffc658"
                        />
                        <Line
                          type="monotone"
                          dataKey="student"
                          name="Student Services"
                          stroke="#ff8042"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Expenses by Type</CardTitle>
                  <CardDescription>
                    Breakdown of expense categories for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesByTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expensesByTypeData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value) => [
                            `$${value.toLocaleString()}`,
                            "",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm md:col-span-2">
                <CardHeader>
                  <CardTitle>Expense Summary</CardTitle>
                  <CardDescription>
                    Key expense metrics for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Total Expenses
                      </p>
                      <p className="text-2xl font-bold">$6,950,000</p>
                      <p className="text-sm text-red-600">
                        ↑ A6.3% from previous year
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Salaries & Benefits
                      </p>
                      <p className="text-2xl font-bold">$4,300,000</p>
                      <p className="text-sm text-red-600">
                        ↑ 4.8% from previous year
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Expense per Student
                      </p>
                      <p className="text-2xl font-bold">$17,825</p>
                      <p className="text-sm text-red-600">
                        ↑ 3.5% from previous year
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="balance" className="m-0 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Assets</CardTitle>
                  <CardDescription>
                    Summary of university assets for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Cash & Equivalents</span>
                      <span>$12,500,000</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Accounts Receivable</span>
                      <span>$4,200,000</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Investments</span>
                      <span>$35,800,000</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Property & Equipment</span>
                      <span>$124,700,000</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Other Assets</span>
                      <span>$8,300,000</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="font-bold">Total Assets</span>
                      <span className="font-bold">$185,500,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Liabilities & Net Assets</CardTitle>
                  <CardDescription>
                    Summary of university liabilities for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Accounts Payable</span>
                      <span>$3,800,000</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Accrued Liabilities</span>
                      <span>$5,200,000</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Long-term Debt</span>
                      <span>$45,700,000</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Other Liabilities</span>
                      <span>$7,300,000</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Net Assets</span>
                      <span>$123,500,000</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="font-bold">
                        Total Liabilities & Net Assets
                      </span>
                      <span className="font-bold">$185,500,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm md:col-span-2">
                <CardHeader>
                  <CardTitle>Financial Position</CardTitle>
                  <CardDescription>
                    Key financial position metrics for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Current Ratio
                      </p>
                      <p className="text-2xl font-bold">2.8</p>
                      <p className="text-sm text-emerald-600">
                        ↑ 0.2 from previous year
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Debt to Asset Ratio
                      </p>
                      <p className="text-2xl font-bold">0.25</p>
                      <p className="text-sm text-emerald-600">
                        ↓ 0.02 from previous year
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Net Asset Growth
                      </p>
                      <p className="text-2xl font-bold">5.2%</p>
                      <p className="text-sm text-emerald-600">
                        ↑ 0.8% from previous year
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ratios" className="m-0 mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Key Financial Ratios</CardTitle>
                <CardDescription>
                  Performance metrics for {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {financialRatios.map((ratio, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {ratio.name}
                      </h3>
                      <div className="mt-2 flex items-baseline">
                        <p className="text-3xl font-semibold">
                          {ratio.unit === "$"
                            ? `$${ratio.value.toLocaleString()}`
                            : ratio.unit === "ratio"
                            ? ratio.value.toFixed(2)
                            : `${ratio.value}${ratio.unit}`}
                        </p>
                        <p className="ml-2 text-xs text-muted-foreground">
                          Target:{" "}
                          {ratio.unit === "$"
                            ? `$${ratio.target.toLocaleString()}`
                            : ratio.unit === "ratio"
                            ? ratio.target.toFixed(2)
                            : `${ratio.target}${ratio.unit}`}
                        </p>
                      </div>
                      <div className="mt-2">
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full ${
                              ratio.value >= ratio.target
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (ratio.value / ratio.target) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default FinancialReportsPage
