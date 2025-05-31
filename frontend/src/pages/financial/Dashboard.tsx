import { useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/PageHeader";
import {
  Users,
  CreditCard,
  BadgeDollarSign,
  BarChart3,
  BookOpen,
  Building,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { usePaymentStore } from "@/store/usePaymentStore";
import { PaymentStatus } from "@/types/payment";
import { api } from "@/services/api";
import { useStudentStore } from "@/store/useStudentStore";

// Mock data for charts until we have real data
const mockMonthlyRevenue = [
  { month: "Jan", revenue: 65000 },
  { month: "Feb", revenue: 59000 },
  { month: "Mar", revenue: 80000 },
  { month: "Apr", revenue: 81000 },
  { month: "May", revenue: 56000 },
  { month: "Jun", revenue: 55000 },
  { month: "Jul", revenue: 40000 },
  { month: "Aug", revenue: 70000 },
  { month: "Sep", revenue: 90000 },
  { month: "Oct", revenue: 95000 },
  { month: "Nov", revenue: 110000 },
  { month: "Dec", revenue: 120000 },
];

const mockRevenueBySource = [
  { name: "Tuition Fees", value: 75 },
  { name: "Research Grants", value: 15 },
  { name: "Accommodation", value: 7 },
  { name: "Other Services", value: 3 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const FinancialDashboard = () => {
  // Use auth guard to protect this page
  useAuthGuard(["financial", "admin"]);
  const { students, isLoading, fetchStudents } = useStudentStore();


  // Get payment data from store
  const { 
    payments, 
    isLoading: isPaymentsLoading, 
    statistics,
    fetchPayments,
    fetchPaymentStatistics 
  } = usePaymentStore();
  console.log(payments);
  
  // Fetch payment data on component mount
  useEffect(() => {
    fetchPayments();
    fetchPaymentStatistics();
  }, [fetchPayments, fetchPaymentStatistics]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  // Fetch student data
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Dashboard"
        description="Overview of university financial metrics and operations"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isPaymentsLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-[80px] mb-2" />
                  <Skeleton className="h-6 w-[120px]" />
                </CardContent>
              </Card>
            ))
        ) : (
          <>
          
            <Card className="shadow-sm bg-blue-50 dark:bg-blue-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {statistics ? formatCurrency(statistics.paymentsByType.reduce((sum, payment) => 
                    sum + (payment._sum.amount || 0), 0)) : "$0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statistics ? statistics.totalPayments : 0} payments processed
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm bg-green-50 dark:bg-green-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">All Students</CardTitle>
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {students?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total enrolled students
                </p>
              </CardContent>
            </Card>



            
            <Card className="shadow-sm bg-purple-50 dark:bg-purple-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {students?.filter(s => s.is_active === true).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active students
                </p>
              </CardContent>
            </Card>

          <Card className="shadow-sm bg-purple-50 dark:bg-purple-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Highest Payment Type</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {statistics?.paymentsByType?.[0]?.type || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics?.paymentsByType?.[0] ? formatCurrency(statistics.paymentsByType[0]._sum.amount || 0) : "$0.00"}
              </p>
            </CardContent>
          </Card>

            {/* <Card className="shadow-sm bg-red-50 dark:bg-red-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                <BadgeDollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {statistics ? formatCurrency(statistics.totalOverdue) : "$0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payments.filter(p => p.status === PaymentStatus.OVERDUE).length} overdue payments
                </p>
              </CardContent>
            </Card> */}
            
            {/* <Card className="shadow-sm bg-amber-50 dark:bg-amber-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {statistics ? formatCurrency(statistics.totalPending) : "$0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payments.filter(p => p.status === PaymentStatus.PENDING).length} pending payments
                </p>
              </CardContent>
            </Card> */}
            
          
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockMonthlyRevenue}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <RechartsTooltip
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="revenue" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockRevenueBySource}
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
                    {mockRevenueBySource.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isPaymentsLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-10 w-[200px]" />
                    <Skeleton className="h-6 w-[80px]" />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`rounded-full p-2 ${
                        payment.status === PaymentStatus.PAID ? 'bg-green-100' : 
                        payment.status === PaymentStatus.PENDING ? 'bg-amber-100' : 
                        'bg-red-100'
                      }`}>
                        <CreditCard className={`h-4 w-4 ${
                          payment.status === PaymentStatus.PAID ? 'text-green-600' : 
                          payment.status === PaymentStatus.PENDING ? 'text-amber-600' : 
                          'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} Payment</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.student?.fullName || 'Student'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
                {payments.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">No recent transactions</p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {isPaymentsLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-4">
                {payments.filter(p => p.status === PaymentStatus.OVERDUE).length > 0 && (
                  <li className="rounded-md bg-red-50 p-3 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-800">Overdue Payments</p>
                        <p className="text-sm text-red-600">
                          {payments.filter(p => p.status === PaymentStatus.OVERDUE).length} students have overdue payments
                        </p>
                      </div>
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                        High Priority
                      </span>
                    </div>
                  </li>
                )}
                {payments.filter(p => p.status === PaymentStatus.PENDING).length > 0 && (
                  <li className="rounded-md bg-amber-50 p-3 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-amber-800">Pending Payments</p>
                        <p className="text-sm text-amber-600">
                          {payments.filter(p => p.status === PaymentStatus.PENDING).length} pending payments need review
                        </p>
                      </div>
                      <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                        Medium Priority
                      </span>
                    </div>
                  </li>
                )}
                <li className="rounded-md bg-blue-50 p-3 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-800">Payment Summary</p>
                      <p className="text-sm text-blue-600">
                        Total collected: {formatCurrency(statistics?.totalPaid || 0)} from {payments.filter(p => p.status === PaymentStatus.PAID).length} payments
                      </p>
                    </div>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                      Information
                    </span>
                  </div>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialDashboard;