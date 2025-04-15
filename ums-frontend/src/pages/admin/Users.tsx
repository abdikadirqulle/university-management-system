import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import { User } from "@/types/auth";
import { useUserStore } from "@/store/useUserStore";
import { Plus } from "lucide-react";
import { toast } from "sonner";

// Import our new components
import UserTable from "@/components/admin/UserTable";
import UserFormDialog, {
  UserFormValues,
} from "@/components/admin/UserFormDialog";

const UsersPage = () => {
  useAuthGuard(["academic"]);

  const { users, isLoading, fetchUsers, addUser, updateUser, deleteUser } =
    useUserStore();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = () => {
    setDialogMode("add");
    setCurrentUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setDialogMode("edit");
    setCurrentUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      await deleteUser(user.id);
      toast.success("User deleted successfully");
    }
  };

  const handleFormSubmit = async (data: UserFormValues) => {
    try {
      if (dialogMode === "add") {
        await addUser({
          id: String(Date.now()),
          ...data,
        } as User);
        toast.success("User added successfully");
      } else if (dialogMode === "edit" && currentUser) {
        await updateUser(currentUser.id, data);
        toast.success("User updated successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Add, edit, and manage users in the system"
        action={{
          label: "Add User",
          icon: Plus,
          onClick: handleAddUser,
        }}
      />

      <UserTable
        users={users}
        isLoading={isLoading}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />

      <UserFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        dialogMode={dialogMode}
        currentUser={currentUser}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default UsersPage;
