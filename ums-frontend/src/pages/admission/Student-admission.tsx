import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/context/AuthContext";
import { useUserStore } from "@/store/useUserStore";
import { useStudentApplicationStore } from "@/store/useStudentApplicationStore";
import { StudentApplication } from "@/types/admission";
import PageHeader from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Eye,
  MoreHorizontal,
  UserPlus,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import StudentApplicationForm from "@/components/admission/StudentApplicationForm";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define available departments
const departments = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Economics",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "Psychology",
  "Sociology",
  "English Literature",
  "History",
  "Political Science",
];

const StudentAdmission = () => {
  // Auth guard to ensure only admins can access this page
  useAuthGuard(["admission"]);

  const { user } = useAuth();
  const { addUser } = useUserStore();
  const {
    applications,
    isLoading,
    fetchApplications,
    approveApplication,
    rejectApplication,
  } = useStudentApplicationStore();

  // Search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [currentApplication, setCurrentApplication] =
    useState<StudentApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [assignedDepartment, setAssignedDepartment] = useState("");
  const [assignedClass, setAssignedClass] = useState("");
  const [assignedSession, setAssignedSession] = useState("");

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Filter applications based on search term and status
  const filteredApplications = applications.filter((app) => {
    // Check if the application matches the search term
    const searchMatch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.desiredDepartment.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if the application matches the status filter
    const statusMatch = statusFilter === "all" || app.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // Handle viewing an application
  const handleViewApplication = (application: StudentApplication) => {
    setCurrentApplication(application);
    setIsViewDialogOpen(true);
  };

  // Handle approving an application
  const handleApprovePrompt = (application: StudentApplication) => {
    setCurrentApplication(application);
    setAssignedDepartment(application.desiredDepartment);
    setAssignedClass("1st Year"); // Default value
    setAssignedSession(new Date().getFullYear().toString()); // Default to current year
    setIsApproveDialogOpen(true);
  };

  // Handle rejecting an application
  const handleRejectPrompt = (application: StudentApplication) => {
    setCurrentApplication(application);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  // Final approval action
  const handleApproveApplication = async () => {
    if (!currentApplication || !user) return;

    try {
      // Approve the application and get the generated student ID
      const studentId = await approveApplication(
        currentApplication.id,
        user.name,
      );

      // Create a new user with student role
      await addUser({
        id: String(Date.now()),
        name: currentApplication.fullName,
        email: currentApplication.email,
        role: "student",
        department: assignedDepartment,
        studentId: studentId,
      });

      toast.success(
        `Application approved and user account created for ${currentApplication.fullName}`,
      );
      setIsApproveDialogOpen(false);
    } catch (error) {
      toast.error("Failed to approve application");
      console.error(error);
    }
  };

  // Final reject action
  const handleRejectApplication = async () => {
    if (!currentApplication || !user) return;

    try {
      await rejectApplication(
        currentApplication.id,
        user.name,
        rejectionReason,
      );
      toast.success(
        `Application from ${currentApplication.fullName} has been rejected`,
      );
      setIsRejectDialogOpen(false);
    } catch (error) {
      toast.error("Failed to reject application");
      console.error(error);
    }
  };

  // Status badge component
  const StatusBadge = ({
    status,
  }: {
    status: StudentApplication["status"];
  }) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          >
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-200"
          >
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 hover:bg-red-200"
          >
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  // Table columns
  const columns: ColumnDef<StudentApplication>[] = [
    {
      accessorKey: "fullName",
      header: "Full Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "desiredDepartment",
      header: "Desired Department",
    },
    {
      accessorKey: "applicationDate",
      header: "Application Date",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <StatusBadge status={row.getValue("status")} />;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const application = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleViewApplication(application)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              {application.status === "pending" && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleApprovePrompt(application)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRejectPrompt(application)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Admission"
        description="Manage student applications and admissions"
        action={{
          label: "Refresh",
          icon: RefreshCw,
          onClick: fetchApplications,
        }}
      />

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="applications">Review Applications</TabsTrigger>
          <TabsTrigger value="create">New Application</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or department"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(
                  value: "all" | "pending" | "approved" | "rejected",
                ) => setStatusFilter(value)}
              >
                <SelectTrigger id="status-filter" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredApplications}
            loading={isLoading}
          />
        </TabsContent>

        <TabsContent value="create">
          <StudentApplicationForm
            onSuccess={() => {
              toast.success("Application created successfully");
            }}
          />
        </TabsContent>
      </Tabs>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {currentApplication && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </p>
                  <p>{currentApplication.fullName}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p>{currentApplication.email}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Gender
                  </p>
                  <p className="capitalize">{currentApplication.gender}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </p>
                  <p>{currentApplication.dateOfBirth}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Desired Department
                  </p>
                  <p>{currentApplication.desiredDepartment}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Application Date
                  </p>
                  <p>{currentApplication.applicationDate}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <StatusBadge status={currentApplication.status} />
                </div>

                {currentApplication.reviewedBy && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Reviewed By
                    </p>
                    <p>{currentApplication.reviewedBy}</p>
                  </div>
                )}

                {currentApplication.reviewedAt && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Reviewed On
                    </p>
                    <p>{currentApplication.reviewedAt}</p>
                  </div>
                )}

                <div className="col-span-2 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Additional Information
                  </p>
                  <p className="whitespace-pre-wrap">
                    {currentApplication.notes ||
                      "No additional information provided."}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Application Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Approve this application and create a student account
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {currentApplication && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  <p className="font-medium">
                    {currentApplication.fullName} - {currentApplication.email}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={assignedDepartment}
                      onValueChange={setAssignedDepartment}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Select
                      value={assignedClass}
                      onValueChange={setAssignedClass}
                    >
                      <SelectTrigger id="class">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session">Academic Session</Label>
                    <Select
                      value={assignedSession}
                      onValueChange={setAssignedSession}
                    >
                      <SelectTrigger id="session">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2].map((offset) => {
                          const year = new Date().getFullYear() + offset;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}-{year + 1}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApproveApplication}>
              Approve and Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Application Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {currentApplication && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="font-medium">
                    {currentApplication.fullName} - {currentApplication.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Please provide a reason for rejecting this application"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectApplication}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentAdmission;
