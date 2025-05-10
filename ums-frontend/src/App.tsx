import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { Analytics } from "@vercel/analytics/react";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/Users";
import FacultiesPage from "./pages/admin/Faculties";
import CoursesPage from "./pages/admin/Courses";
import DepartmentsPage from "./pages/admin/Departments";
import ReportsPage from "./pages/admin/Reports";
import SettingsPage from "./pages/admin/Settings";
import CalendarPage from "./pages/admin/Calendar";

// admission Pages
import AdmissionDashboard from "./pages/admission/Dashboard";
import StudentEnrollment from "./pages/admission/StudentEnrollment";
import StudentAdmission from "./pages/admission/StudentAdmission";
import StudentManager from "./pages/admission/StudentList";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";

// Financial Admin Pages
import FinancialDashboard from "./pages/financial/Dashboard";
import PaymentsPage from "./pages/financial/Payments";
import FinancialReportsPage from "./pages/financial/Reports";

// Not Found
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Students from "./pages/admin/Students";
import RegistrationForm from "./pages/admission/RegistrationForm";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Analytics />
      <Sonner position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              {/* Root redirect to login */}

              <Route path="/" element={<LoginPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AppLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="students" element={<Students />} />
              <Route path="faculties" element={<FacultiesPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="calendar" element={<CalendarPage />} />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* admission routes */}
            <Route path="/admission" element={<AppLayout />}>
              <Route path="dashboard" element={<AdmissionDashboard />} />
              <Route
                path="student-enrollment"
                element={<StudentEnrollment />}
              />
              <Route path="student-admission" element={<StudentAdmission />} />
              <Route path="registration" element={<RegistrationForm />} />
              <Route path="students" element={<StudentManager />} />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Student routes */}
            <Route path="/student" element={<AppLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              {/* Add other student routes as needed */}

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Financial Admin routes */}
            <Route path="/financial" element={<AppLayout />}>
              <Route path="dashboard" element={<FinancialDashboard />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="reports" element={<FinancialReportsPage />} />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
