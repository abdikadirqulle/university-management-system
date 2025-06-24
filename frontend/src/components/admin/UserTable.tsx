import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { User, UserRole } from "@/types/auth";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash2, Power, PowerOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onToggleActivation: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  onEditUser,
  onDeleteUser,
  onToggleActivation,
}) => {
  // Define table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as UserRole;
        const roleColorMap: Record<UserRole, string> = {
          admin: "bg-indigo-100 text-indigo-800",
          admission: "bg-blue-100 text-blue-800",
          financial: "bg-green-100 text-green-800",
          student: "bg-amber-100 text-amber-800",
        };
        const roleDisplayMap: Record<UserRole, string> = {
          admin: "Admin",
          admission: "Admission",
          financial: "Financial",
          student: "Student",
        };

        return (
          <span className={`badge-role ${roleColorMap[role]}`}>
            {roleDisplayMap[role]}
          </span>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

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
              <DropdownMenuItem onClick={() => onEditUser(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActivation(user)}>
                {user.isActive ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteUser(user)}
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

  return <DataTable columns={columns} data={users} loading={isLoading} />;
};

export default UserTable;
