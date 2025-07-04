import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import { User } from "@/types/auth";
import { useUserStore } from "@/store/useUserStore";
import { Plus } from "lucide-react";
import { toast } from "sonner";

// Import our new components
import UserTable from "@/components/admin/UserTable";
import {
  UserFormDialog,
  UserFormValues,
} from "@/components/admin/UserFormDialog";

const UsersPage = () => {
  useAuthGuard(["admin"]);

  const {
    users,
    isLoading,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActivation,
  } = useUserStore();

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

  const handleToggleActivation = async (user: User) => {
    const action = user.isActive ? "deactivate" : "activate";
    if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      try {
        await toggleUserActivation(user.id);
        toast.success(`User ${action}d successfully`);
      } catch (error) {
        toast.error(`Failed to ${action} user`);
      }
    }
  };

  const handleFormSubmit = async (data: UserFormValues) => {
    try {
      // Remove empty strings from data
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== ""),
      );

      if (dialogMode === "add") {
        await addUser({
          id: String(Date.now()),
          ...cleanData,
          isActive: true, // Set default active status for new users
        } as User);
        toast.success("User added successfully");
      } else if (dialogMode === "edit" && currentUser) {
        await updateUser(currentUser.id, cleanData);
        toast.success("User updated successfully");
      }
      setIsDialogOpen(false);
      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to process user. Please try again.";
      toast.error(errorMessage);
      console.error("User operation error:", error);
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
        onToggleActivation={handleToggleActivation}
      />

      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={currentUser}
        isSubmitting={false}
        isLoading={isLoading}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default UsersPage;
