import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Settings,
  Users,
  School,
  BookCopy,
  BarChart,
  CreditCard,
  UserCog,
  Building,
  BookLock,
  DollarSign,
  UserPlus,
  UsersRound,
  Wallet2Icon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Close } from "@radix-ui/react-toast";

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Role-specific menu items
  const roleMenuItems = {
    academic: [
      {
        title: "Dashboard",
        icon: Home,
        path: "/admin/dashboard",
      },
      {
        title: "Users",
        icon: Users,
        path: "/admin/users",
      },

      {
        title: "Faculties",
        icon: Building,
        path: "/admin/faculties",
      },
      {
        title: "Departments",
        icon: School,
        path: "/admin/departments",
      },
      {
        title: "Courses",
        icon: BookOpen,
        path: "/admin/courses",
      },
      {
        title: "Academic Calendar",
        icon: Calendar,
        path: "/admin/calendar",
      },
      {
        title: "Reports",
        icon: BarChart,
        path: "/admin/reports",
      },
      {
        title: "Settings",
        icon: Settings,
        path: `/admin/settings`,
      },
    ],
    financial: [
      {
        title: "Dashboard",
        icon: Home,
        path: "/financial/dashboard",
      },
      {
        title: "Student Payments",
        icon: CreditCard,
        path: "/financial/payments",
      },
      {
        title: "Budget",
        icon: DollarSign,
        path: "/financial/budget",
      },
      {
        title: "Expenses",
        icon: Wallet2Icon,
        path: "/financial/expenses",
      },

      {
        title: "Reports",
        icon: BarChart,
        path: "/financial/reports",
      },
    ],
    admission: [
      {
        title: "Dashboard",
        icon: Home,
        path: "/admission/dashboard",
      },

      {
        title: "Registration",
        icon: UserPlus,
        path: "/admission/student-enrollment",
      },
      {
        title: "All Students",
        icon: UsersRound,
        path: "/admission/students",
      },
      {
        title: "Student Admission",
        icon: GraduationCap,
        path: "/admission/student-admission",
      },
    ],
    student: [
      {
        title: "Dashboard",
        icon: Home,
        path: "/student/dashboard",
      },
      {
        title: "My Courses",
        icon: BookCopy,
        path: "/student/courses",
      },
      {
        title: "Grades",
        icon: FileText,
        path: "/student/grades",
      },
      {
        title: "Schedule",
        icon: BookLock,
        path: "/student/schedule",
      },
      {
        title: "Payments",
        icon: CreditCard,
        path: "/student/payments",
      },
    ],
  };

  // Get menu items based on user role
  const menuItems = [...roleMenuItems[user.role]];

  const roleLabel = user?.role
    ? {
        academic: "Academic Affairs",
        admission: "admission Officer",
        student: "Student",
        financial: "Financial Officer",
      }[user.role]
    : "";

  const roleBadgeClass = user?.role
    ? {
        academic: "badge-role-admin",
        admission: "badge-role-admission",
        student: "badge-role-student",
        financial: "badge-role-financial",
      }[user.role]
    : "";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <School className="h-8 w-8 " />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">
              Scholar Nexus
            </h1>
            <span className="text-xs text-sidebar-foreground/70">
              University Management
            </span>
          </div>
        </div>
        <SidebarTrigger className="absolute right-2 top-4 lg:hidden" />
      </SidebarHeader>

      {/* <div className="px-4 py-2">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center uppercase rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.name}
              </p>
              <div className={`badge-role ${roleBadgeClass} mt-1`}>
                {roleLabel}
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <SidebarContent className="px-2">
        <SidebarMenu>
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={index} className="mt-1">
              <SidebarMenuButton asChild data-active={isActive(item.path)}>
                <Link
                  to={item.path}
                  className="flex items-center space-x-3 px-3 py-2"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={logout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
