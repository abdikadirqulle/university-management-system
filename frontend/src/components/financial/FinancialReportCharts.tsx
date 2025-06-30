import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface FinancialReport {
  totalPayment: number;
  totalPaid: number;
  incomeExpected: number;
  accruedIncome: number;
  deferredIncome: number;
  monthlyPayments: {
    month: string;
    amount: number;
  }[];
  paymentsByType: {
    type: string;
    amount: number;
  }[];
  paymentStatus: {
    status: string;
    count: number;
    amount: number;
  }[];
}

interface FinancialReportChartsProps {
  report: FinancialReport;
}

export function FinancialReportCharts({ report }: FinancialReportChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Payment</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(report.totalPayment)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Income Expected</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(report.incomeExpected)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Accrued Income</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(report.accruedIncome)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Deferred Income</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(report.deferredIncome)}
          </p>
        </Card>
      </div>

      {/* Monthly Payments Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Payment Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.monthlyPayments}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payments by Type */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payments by Type</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.paymentsByType}
                  dataKey="amount"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#2563eb"
                  label={(entry) =>
                    `${entry.type}: ${formatCurrency(entry.amount)}`
                  }
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.paymentStatus}>
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Status: ${label}`}
                />
                <Bar dataKey="amount" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
