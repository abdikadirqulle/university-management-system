import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import StudentLoginPage from "./pages/auth/StudentLoginPage";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/Users";
import FacultiesPage from "./pages/admin/Faculties";
import CoursesPage from "./pages/admin/Courses";
import DepartmentsPage from "./pages/admin/Departments";
import ReportsPage from "./pages/admin/Reports";
import SettingsPage from "./pages/admin/Settings";
import AcademicCalendarPage from "./pages/admin/academic-calendar";

// admission Pages
import AdmissionDashboard from "./pages/admission/admission-dashboard";
import StudentEnrollment from "./pages/admission/Student-enrollment";
import StudentList from "./pages/admission/Students-list";

// Financial Admin Pages
import FinancialDashboard from "./pages/financial/Dashboard";
import PaymentsPage from "./pages/financial/Payments";
import FinancialReportsPage from "./pages/financial/Reports";
import FinancialStudentsPage from "./pages/financial/Students";

// Not Found
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

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
              <Route
                path="/auth/student-login"
                element={<StudentLoginPage />}
              />
              {/* Root redirect to login */}
              <Route path="/" element={<LoginPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="students" element={<StudentList />} />
              <Route
                path="student-enrollment"
                element={<StudentEnrollment />}
              />

              <Route path="faculties" element={<FacultiesPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route
                path="academic-calendar"
                element={<AcademicCalendarPage />}
              />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* admission routes */}
            <Route path="/admission" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdmissionDashboard />} />
              <Route
                path="student-enrollment"
                element={<StudentEnrollment />}
              />
              <Route path="students" element={<StudentList />} />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Financial Admin routes */}
            <Route path="/financial" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FinancialDashboard />} />
              <Route path="students" element={<FinancialStudentsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              {/* <Route path="reports" element={<FinancialReportsPage />} /> */}

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
