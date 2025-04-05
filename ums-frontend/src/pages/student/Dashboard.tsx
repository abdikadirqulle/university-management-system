
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import PageHeader from '@/components/PageHeader';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, CreditCard, GraduationCap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Sample stats for student dashboard
const studentStats = [
  {
    title: 'Enrolled Courses',
    value: '5',
    icon: BookOpen,
    iconColor: 'text-blue-600',
  },
  {
    title: 'Upcoming Exams',
    value: '3',
    icon: Calendar,
    iconColor: 'text-indigo-600',
  },
  {
    title: 'Current GPA',
    value: '3.8',
    icon: GraduationCap,
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Payment Status',
    value: 'Paid',
    icon: CreditCard,
    iconColor: 'text-green-600',
  },
];

// Sample course progress data
const courseProgress = [
  {
    id: '1',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    progress: 85,
    grade: 'A-',
  },
  {
    id: '2',
    code: 'MTH201',
    name: 'Calculus II',
    progress: 72,
    grade: 'B+',
  },
  {
    id: '3',
    code: 'PHY105',
    name: 'Physics for Scientists',
    progress: 90,
    grade: 'A',
  },
  {
    id: '4',
    code: 'ENG150',
    name: 'Engineering Mechanics',
    progress: 65,
    grade: 'B',
  },
  {
    id: '5',
    code: 'BUS200',
    name: 'Business Economics',
    progress: 78,
    grade: 'B+',
  },
];

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return 'text-emerald-600';
  if (grade.startsWith('B')) return 'text-blue-600';
  if (grade.startsWith('C')) return 'text-amber-600';
  return 'text-red-600';
};

const StudentDashboard = () => {
  const { user } = useAuth();
  useAuthGuard(['student']);
  
  useEffect(() => {
    // This could fetch student dashboard data from an API
    console.log('Student dashboard loaded');
  }, []);
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Welcome, ${user?.name}`}
        description="View your courses, grades, and upcoming events"
      />
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {studentStats.map((stat, idx) => (
          <StatsCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseProgress.map((course) => (
                <div key={course.id} className="space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{course.code}: {course.name}</p>
                    </div>
                    <div className={getGradeColor(course.grade)}>
                      <p className="font-medium">{course.grade}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={course.progress} className="h-2" />
                    <span className="text-sm font-medium">{course.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">CS101 Midterm Exam</p>
                    <p className="text-xs text-muted-foreground">Hall A, Building 2</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Oct 12, 2023</p>
                    <p className="text-xs text-muted-foreground">9:00 AM - 11:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">MTH201 Assignment Due</p>
                    <p className="text-xs text-muted-foreground">Submit online</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Oct 15, 2023</p>
                    <p className="text-xs text-muted-foreground">11:59 PM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">PHY105 Lab Session</p>
                    <p className="text-xs text-muted-foreground">Lab Room 3</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Oct 18, 2023</p>
                    <p className="text-xs text-muted-foreground">2:00 PM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tuition Fee</span>
                  <span className="font-medium">$8,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Library Fee</span>
                  <span className="font-medium">$150</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Technology Fee</span>
                  <span className="font-medium">$350</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>$9,000</span>
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center text-green-700">
                  <p className="font-medium">Payment Completed</p>
                  <p className="text-xs">Last payment: September 1, 2023</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
