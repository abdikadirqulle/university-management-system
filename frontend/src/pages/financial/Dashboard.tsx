import { useEffect, useMemo } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/PageHeader";
import { Users, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { usePaymentStore } from "@/store/usePaymentStore";
import { PaymentStatus } from "@/types/payment";
import { useStudentStore } from "@/store/useStudentStore";

const FinancialDashboard = () => {
  // Use auth guard to protect this page
  useAuthGuard(["financial", "admin"]);
  const { students, fetchStudents } = useStudentStore();

  // Get payment data from store
  const {
    payments,
    isLoading: isPaymentsLoading,
    statistics,
    fetchPayments,
    fetchPaymentStatistics,
  } = usePaymentStore();
  console.log(payments);

  // Process payments data for the chart
  const monthlyStudentPayments = useMemo(() => {
    // Get current year's payments only
    const currentYear = new Date().getFullYear();
    const currentYearPayments = payments.filter(
      (payment) => new Date(payment.paymentDate).getFullYear() === currentYear,
    );

    // Create an array for all months (0-11)
    const monthsData = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthDate = new Date(currentYear, monthIndex);
      return {
        month: monthDate.toLocaleString("default", { month: "short" }),
        payments: 0,
      };
    });

    // Aggregate payments by month
    currentYearPayments.forEach((payment) => {
      const paymentDate = new Date(payment.paymentDate);
      const monthIndex = paymentDate.getMonth();
      monthsData[monthIndex].payments += payment.amount;
    });

    return monthsData;
  }, [payments]);

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

  // Real data for charts
  //   const monthlyStudentPayments = payments.map((payment) => ({
  //     month: new Date(payment.paymentDate).toLocaleString("default", {
  //       month: "short",
  //     }),
  //     payments: payment.amount,
  //   }));

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
                <CardTitle className="text-sm font-medium">
                  Total Payments
                </CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {statistics
                    ? formatCurrency(
                        statistics.paymentsByType.reduce(
                          (sum, payment) => sum + (payment._sum.amount || 0),
                          0,
                        ),
                      )
                    : "$0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statistics ? statistics.totalPayments : 0} payments processed
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm bg-green-50 dark:bg-green-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  All Students
                </CardTitle>
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
                <CardTitle className="text-sm font-medium">
                  Active Students
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {students.filter((s) => s.isActive === true).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active students
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm bg-purple-50 dark:bg-purple-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Active Scholarship
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {
                    students.filter(
                      (s) =>
                        s.isActive === true &&
                        s.studentAccount[0]?.scholarship > 0,
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Total active scholarship
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Payment Statistics */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Student Payment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStudentPayments}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="payments" fill="#8884d8">
                  <Cell cursor="pointer" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isPaymentsLoading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-10 w-[200px]" />
                      <Skeleton className="h-6 w-[80px]" />
                    </div>
                  ))}
              </div>
            ) : (
              <ul className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`rounded-full p-2 ${
                          payment.status === PaymentStatus.PAID
                            ? "bg-green-100"
                            : payment.status === PaymentStatus.PENDING
                              ? "bg-amber-100"
                              : "bg-red-100"
                        }`}
                      >
                        <CreditCard
                          className={`h-4 w-4 ${
                            payment.status === PaymentStatus.PAID
                              ? "text-green-600"
                              : payment.status === PaymentStatus.PENDING
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {payment.type.charAt(0).toUpperCase() +
                            payment.type.slice(1)}{" "}
                          Payment
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.student?.fullName || "Student"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
                {payments.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    No recent transactions
                  </p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialDashboard;
