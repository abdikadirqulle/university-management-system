import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Student } from "@/types/student";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onViewStudent?: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  isLoading,
  onEditStudent,
  onDeleteStudent,
  onViewStudent,
}) => {
  // Define table columns
  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "studentId",
      header: "Student ID",
    },
    {
      accessorKey: "fullName",
      header: "Full Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => {
        const department = row.original.department?.name || "Not Assigned";
        return <span>{department}</span>;
      },
    },
    {
      accessorKey: "faculty",
      header: "Faculty",
      cell: ({ row }) => {
        const faculty = row.original.faculty?.name || "Not Assigned";
        return <span>{faculty}</span>;
      },
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        const gender = row.getValue("gender") as string;
        return (
          <Badge variant="outline" className="capitalize">
            {gender}
          </Badge>
        );
      },
    },
    {
      accessorKey: "semester",
      header: "Semester",
    },
    {
      accessorKey: "batch",
      header: "Batch",
      cell: ({ row }) => {
        const batch = row.original.batch || 'N/A';
        return <span>{batch}</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Registration Date",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const student = row.original;

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
              {onViewStudent && (
                <DropdownMenuItem onClick={() => onViewStudent(student)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEditStudent(student)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteStudent(student)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={students} loading={isLoading} />;
};

export default StudentTable;
