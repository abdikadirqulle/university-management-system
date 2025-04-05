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
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Download,
  Edit,
  Plus,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Define interfaces
interface BudgetItem {
  id: string
  category: string
  subcategory: string
  allocated: number
  spent: number
  remaining: number
  fiscalYear: string
  department: string
}

interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  fiscalYear: string
  status: "on-track" | "warning" | "over-budget"
  lastUpdated: string
}

// Mock data
const mockBudgetItems: BudgetItem[] = [
  {
    id: "BUD-1001",
    category: "Academic",
    subcategory: "Faculty Salaries",
    allocated: 1200000,
    spent: 650000,
    remaining: 550000,
    fiscalYear: "2023-2024",
    department: "All Faculties",
  },
  {
    id: "BUD-1002",
    category: "Academic",
    subcategory: "Research Grants",
    allocated: 500000,
    spent: 320000,
    remaining: 180000,
    fiscalYear: "2023-2024",
    department: "Research Office",
  },
  {
    id: "BUD-1003",
    category: "Academic",
    subcategory: "Library Resources",
    allocated: 250000,
    spent: 180000,
    remaining: 70000,
    fiscalYear: "2023-2024",
    department: "Library",
  },
  {
    id: "BUD-1004",
    category: "Administrative",
    subcategory: "admission Salaries",
    allocated: 800000,
    spent: 400000,
    remaining: 400000,
    fiscalYear: "2023-2024",
    department: "HR",
  },
  {
    id: "BUD-1005",
    category: "Administrative",
    subcategory: "Office Supplies",
    allocated: 50000,
    spent: 35000,
    remaining: 15000,
    fiscalYear: "2023-2024",
    department: "All Departments",
  },
  {
    id: "BUD-1006",
    category: "Facilities",
    subcategory: "Maintenance",
    allocated: 300000,
    spent: 210000,
    remaining: 90000,
    fiscalYear: "2023-2024",
    department: "Facilities Management",
  },
  {
    id: "BUD-1007",
    category: "Facilities",
    subcategory: "Utilities",
    allocated: 180000,
    spent: 120000,
    remaining: 60000,
    fiscalYear: "2023-2024",
    department: "Facilities Management",
  },
  {
    id: "BUD-1008",
    category: "Student Services",
    subcategory: "Scholarships",
    allocated: 400000,
    spent: 350000,
    remaining: 50000,
    fiscalYear: "2023-2024",
    department: "Student Affairs",
  },
  {
    id: "BUD-1009",
    category: "Student Services",
    subcategory: "Student Activities",
    allocated: 120000,
    spent: 95000,
    remaining: 25000,
    fiscalYear: "2023-2024",
    department: "Student Affairs",
  },
  {
    id: "BUD-1010",
    category: "Technology",
    subcategory: "IT Infrastructure",
    allocated: 350000,
    spent: 280000,
    remaining: 70000,
    fiscalYear: "2023-2024",
    department: "IT",
  },
]

// Calculate summary from budget items
const calculateBudgetSummary = (items: BudgetItem[]): BudgetSummary => {
  const totalBudget = items.reduce((sum, item) => sum + item.allocated, 0)
  const totalSpent = items.reduce((sum, item) => sum + item.spent, 0)
  const totalRemaining = totalBudget - totalSpent
  const percentageSpent = (totalSpent / totalBudget) * 100

  let status: "on-track" | "warning" | "over-budget" = "on-track"
  if (percentageSpent > 100) {
    status = "over-budget"
  } else if (percentageSpent > 85) {
    status = "warning"
  }

  return {
    totalBudget,
    totalSpent,
    totalRemaining,
    fiscalYear: "2023-2024",
    status,
    lastUpdated: new Date().toISOString().split("T")[0],
  }
}

// Create chart data by category
const getBudgetChartData = (items: BudgetItem[]) => {
  const categoryMap = new Map<string, { allocated: number; spent: number }>()

  items.forEach((item) => {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, { allocated: 0, spent: 0 })
    }

    const current = categoryMap.get(item.category)!
    current.allocated += item.allocated
    current.spent += item.spent
    categoryMap.set(item.category, current)
  })

  return Array.from(categoryMap.entries()).map(([category, values]) => ({
    category,
    allocated: values.allocated,
    spent: values.spent,
  }))
}

const BudgetPage = () => {
  useAuthGuard(["financial"])
  const [openNewBudgetDialog, setOpenNewBudgetDialog] = useState(false)

  // Simulate data loading with react-query
  const { data: budgetItems = [], isLoading } = useQuery({
    queryKey: ["budget-items"],
    queryFn: () =>
      new Promise<BudgetItem[]>((resolve) =>
        setTimeout(() => resolve(mockBudgetItems), 1000)
      ),
  })

  const budgetSummary = calculateBudgetSummary(budgetItems)
  const chartData = getBudgetChartData(budgetItems)

  // Calculate percentage values for progress bars
  const getPercentage = (spent: number, allocated: number) => {
    return Math.min(Math.round((spent / allocated) * 100), 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return "bg-red-500"
    if (percentage > 75) return "bg-amber-500"
    return "bg-emerald-500"
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget Management"
        description="Oversee and manage university financial budgets and allocations"
        action={{
          label: "New Budget Item",
          icon: Plus,
          onClick: () => setOpenNewBudgetDialog(true),
        }}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Total Budget</CardTitle>
            <CardDescription>
              Fiscal Year {budgetSummary.fiscalYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">
              ${budgetSummary.totalBudget.toLocaleString()}
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>
                    Spent: ${budgetSummary.totalSpent.toLocaleString()}
                  </span>
                  <span>
                    {getPercentage(
                      budgetSummary.totalSpent,
                      budgetSummary.totalBudget
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={getPercentage(
                    budgetSummary.totalSpent,
                    budgetSummary.totalBudget
                  )}
                  className={`h-2 ${getProgressColor(
                    getPercentage(
                      budgetSummary.totalSpent,
                      budgetSummary.totalBudget
                    )
                  )}`}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  Remaining:
                  <span className="font-medium">
                    ${budgetSummary.totalRemaining.toLocaleString()}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Updated: {budgetSummary.lastUpdated}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Budget Allocation & Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <RechartsTooltip
                    formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Legend />
                  <Bar dataKey="allocated" name="Allocated" fill="#8884d8" />
                  <Bar dataKey="spent" name="Spent" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget Details</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          <CardDescription>
            Detailed breakdown of budget allocations for{" "}
            {budgetSummary.fiscalYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Categories</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="administrative">Administrative</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="student">Student Services</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Allocated</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    budgetItems.map((item) => {
                      const percentageSpent = getPercentage(
                        item.spent,
                        item.allocated
                      )

                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.subcategory}</TableCell>
                          <TableCell>{item.department}</TableCell>
                          <TableCell className="text-right">
                            ${item.allocated.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${item.spent.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                item.remaining < 0 ? "text-red-500" : ""
                              }
                            >
                              ${item.remaining.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="w-full flex items-center gap-2">
                              <Progress
                                value={percentageSpent}
                                className={`h-2 ${getProgressColor(
                                  percentageSpent
                                )}`}
                              />
                              <span className="text-xs whitespace-nowrap">
                                {percentageSpent}%
                              </span>
                              {percentageSpent > 90 && (
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit budget item</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Other tabs would follow the same pattern but filter by category */}
            <TabsContent value="academic" className="m-0">
              <Table>
                {/* Similar structure but filtered for Academic category */}
                <TableHeader>
                  <TableRow>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Allocated</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetItems
                    .filter((item) => item.category === "Academic")
                    .map((item) => {
                      const percentageSpent = getPercentage(
                        item.spent,
                        item.allocated
                      )

                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.subcategory}</TableCell>
                          <TableCell>{item.department}</TableCell>
                          <TableCell className="text-right">
                            ${item.allocated.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${item.spent.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${item.remaining.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="w-full flex items-center gap-2">
                              <Progress
                                value={percentageSpent}
                                className={`h-2 ${getProgressColor(
                                  percentageSpent
                                )}`}
                              />
                              <span className="text-xs whitespace-nowrap">
                                {percentageSpent}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit budget item</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Other tabs would be implemented with similar content but filtered for each category */}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={openNewBudgetDialog} onOpenChange={setOpenNewBudgetDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Budget Item</DialogTitle>
            <DialogDescription>
              Create a new budget allocation for a department or project.
            </DialogDescription>
          </DialogHeader>
          <form>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="e.g., Academic, Administrative"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subcategory" className="text-right">
                  Subcategory
                </Label>
                <Input
                  id="subcategory"
                  name="subcategory"
                  placeholder="e.g., Faculty Salaries, Research Grants"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="e.g., Computer Science, HR"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="allocated" className="text-right">
                  Amount
                </Label>
                <Input
                  id="allocated"
                  name="allocated"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fiscalYear" className="text-right">
                  Fiscal Year
                </Label>
                <Input
                  id="fiscalYear"
                  name="fiscalYear"
                  placeholder="e.g., 2023-2024"
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenNewBudgetDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Budget Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BudgetPage
