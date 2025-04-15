import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { CreditCard, Download, FileText, Plus, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Define the Payment interface
interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "partial";
  type: "tuition" | "accommodation" | "library" | "other";
  semester: string;
  academicYear: string;
  referenceNumber: string;
}

// Mock data
const mockPayments: Payment[] = Array.from({ length: 30 }).map((_, i) => {
  const statuses = ["paid", "pending", "overdue", "partial"] as const;
  const types = ["tuition", "accommodation", "library", "other"] as const;

  // Create random dates
  const today = new Date();
  const randomPastDays = Math.floor(Math.random() * 60);
  const randomFutureDays = Math.floor(Math.random() * 60);

  const paymentDate = new Date(today);
  paymentDate.setDate(today.getDate() - randomPastDays);

  const dueDate = new Date(today);
  const isOverdue = i % 5 === 0;
  if (isOverdue) {
    dueDate.setDate(today.getDate() - Math.floor(Math.random() * 15));
  } else {
    dueDate.setDate(today.getDate() + randomFutureDays);
  }

  // Generate a status based on dates
  let status: Payment["status"];
  if (isOverdue) {
    status = "overdue";
  } else if (i % 4 === 0) {
    status = "paid";
  } else if (i % 6 === 0) {
    status = "partial";
  } else {
    status = "pending";
  }

  return {
    id: `PMT-${1000 + i}`,
    studentId: `ST-${2000 + i}`,
    studentName: [
      "John Smith",
      "Emma Johnson",
      "Michael Williams",
      "Olivia Brown",
      "James Jones",
      "Sophia Miller",
      "Robert Davis",
      "Ava Wilson",
      "William Moore",
      "Isabella Taylor",
      "David Anderson",
      "Mia Thomas",
      "Joseph Jackson",
      "Charlotte White",
      "Charles Harris",
    ][i % 15],
    amount: Math.floor(Math.random() * 5000) + 1000,
    paymentDate: paymentDate.toISOString().split("T")[0],
    dueDate: dueDate.toISOString().split("T")[0],
    status,
    type: types[i % types.length],
    semester: i % 2 === 0 ? "Fall 2023" : "Spring 2024",
    academicYear: "2023-2024",
    referenceNumber: `REF-${Math.floor(Math.random() * 100000)}`,
  };
});

const PaymentsPage = () => {
  useAuthGuard(["financial"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [openAddPaymentDialog, setOpenAddPaymentDialog] = useState(false);

  // Simulate data loading with react-query
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () =>
      new Promise<Payment[]>((resolve) =>
        setTimeout(() => resolve(mockPayments), 1000),
      ),
  });

  // Filter payments based on search and filters
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      !searchTerm ||
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || payment.status === selectedStatus;
    const matchesType = !selectedType || payment.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Define table columns
  const columns: ColumnDef<Payment>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "Payment ID",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "studentName",
      header: "Student",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("studentName")}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.studentId}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span>${row.getValue<number>("amount").toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        const statusMap: Record<
          string,
          {
            label: string;
            variant:
              | "default"
              | "destructive"
              | "outline"
              | "secondary"
              | "success"
              | null
              | undefined;
          }
        > = {
          paid: { label: "Paid", variant: "success" },
          pending: { label: "Pending", variant: "secondary" },
          overdue: { label: "Overdue", variant: "destructive" },
          partial: { label: "Partial", variant: "outline" },
        };
        const badgeVariant = statusMap[status]?.variant || "default";
        const badgeLabel = statusMap[status]?.label || status;

        return (
          <Badge
            variant={badgeVariant === "success" ? "default" : badgeVariant}
          >
            {badgeLabel}
          </Badge>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue<string>("type");
        const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
        return formattedType;
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => row.getValue<string>("dueDate"),
    },
    {
      accessorKey: "paymentDate",
      header: "Payment Date",
      cell: ({ row }) => row.getValue<string>("paymentDate") || "Not paid",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <FileText className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>
          </div>
        );
      },
    },
  ];

  const handleAddPayment = (formData: FormData) => {
    // In a real app, this would send the data to your API
    console.log("New payment added:", Object.fromEntries(formData.entries()));
    setOpenAddPaymentDialog(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments Management"
        description="Manage student payments, fees, and financial transactions"
        action={{
          label: "Add Payment",
          icon: Plus,
          onClick: () => setOpenAddPaymentDialog(true),
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mb-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments by ID, student name, or reference..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={selectedStatus || ""}
              onValueChange={(value) => setSelectedStatus(value || null)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedType || ""}
              onValueChange={(value) => setSelectedType(value || null)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tuition">Tuition</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="md:w-[130px]">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={filteredPayments}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog
        open={openAddPaymentDialog}
        onOpenChange={setOpenAddPaymentDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Payment</DialogTitle>
            <DialogDescription>
              Record a new payment from a student. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <form action={handleAddPayment}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studentId" className="text-right">
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="ST-1234"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select name="type" required>
                  <SelectTrigger className="col-span-3" id="type">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentDate" className="text-right">
                  Payment Date
                </Label>
                <Input
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference" className="text-right">
                  Reference #
                </Label>
                <Input
                  id="reference"
                  name="reference"
                  placeholder="REF-12345"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenAddPaymentDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;
