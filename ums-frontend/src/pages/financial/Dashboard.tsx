
import { useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/PageHeader';
import StatsCard from '@/components/StatsCard';
import {
  Users,
  CreditCard,
  BadgeDollarSign,
  BarChart3,
  BookOpen,
  Building,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Cell
} from 'recharts';

// Mock financial data for demonstration
const mockFinancialStats = {
  totalRevenue: '$1,245,890',
  pendingPayments: '$78,250',
  completedTransactions: 1245,
  outstandingFees: '$125,450',
};

const mockMonthlyRevenue = [
  { month: 'Jan', revenue: 65000 },
  { month: 'Feb', revenue: 59000 },
  { month: 'Mar', revenue: 80000 },
  { month: 'Apr', revenue: 81000 },
  { month: 'May', revenue: 56000 },
  { month: 'Jun', revenue: 55000 },
  { month: 'Jul', revenue: 40000 },
  { month: 'Aug', revenue: 70000 },
  { month: 'Sep', revenue: 90000 },
  { month: 'Oct', revenue: 95000 },
  { month: 'Nov', revenue: 110000 },
  { month: 'Dec', revenue: 120000 },
];

const mockRevenueBySource = [
  { name: 'Tuition Fees', value: 75 },
  { name: 'Research Grants', value: 15 },
  { name: 'Accommodation', value: 7 },
  { name: 'Other Services', value: 3 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const FinancialDashboard = () => {
  // Use auth guard to protect this page
  useAuthGuard(['financial']);

  // Simulate data loading with react-query
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['financial-stats'],
    queryFn: () => new Promise(resolve => setTimeout(() => resolve(mockFinancialStats), 1000)),
  });
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Financial Dashboard" 
        description="Overview of university financial metrics and operations"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isStatsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-10 w-[80px] mb-2" />
                <Skeleton className="h-6 w-[120px]" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Revenue"
              value={stats.totalRevenue}
              icon={BadgeDollarSign}
              iconColor="text-emerald-500"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Pending Payments"
              value={stats.pendingPayments}
              icon={CreditCard}
              iconColor="text-orange-500"
              trend={{ value: 5, isPositive: false }}
            />
            <StatsCard
              title="Transactions"
              value={stats.completedTransactions}
              icon={BarChart3}
              iconColor="text-purple-500"
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Outstanding Fees"
              value={stats.outstandingFees}
              icon={Users}
              iconColor="text-red-500"
              trend={{ value: 3, isPositive: false }}
            />
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
                  <YAxis 
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <RechartsTooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#8884d8" />
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
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockRevenueBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tuition Payment</p>
                    <p className="text-xs text-muted-foreground">John Smith</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$8,250</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <Building className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Accommodation Fee</p>
                    <p className="text-xs text-muted-foreground">Emma Johnson</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$2,800</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Library Fine</p>
                    <p className="text-xs text-muted-foreground">Mike Chen</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$45</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="rounded-md bg-red-50 p-3 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-800">Overdue Payments</p>
                    <p className="text-sm text-red-600">15 students have overdue payments exceeding 30 days</p>
                  </div>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">High Priority</span>
                </div>
              </li>
              <li className="rounded-md bg-amber-50 p-3 border-l-4 border-amber-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-800">Budget Review</p>
                    <p className="text-sm text-amber-600">Quarterly budget review meeting scheduled for 10/15/2023</p>
                  </div>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">Medium Priority</span>
                </div>
              </li>
              <li className="rounded-md bg-blue-50 p-3 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-800">Grant Deadline</p>
                    <p className="text-sm text-blue-600">Research grant application deadline is approaching (7 days remaining)</p>
                  </div>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Information</span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialDashboard;
