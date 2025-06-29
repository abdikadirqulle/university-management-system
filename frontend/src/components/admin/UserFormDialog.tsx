import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@/types/auth";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

// Create schema based on mode (add/edit)
const createUserFormSchema = (isEditing: boolean) =>
  z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .refine(
        (value) => !value.includes(" "),
        "Username cannot contain spaces",
      ),
    email: z.string().email("Please enter a valid email"),
    password: isEditing
      ? z.string().min(6, "Password must be at least 6 characters").optional()
      : z.string().min(6, "Password is required"),
    role: z.enum(["admin", "admission", "financial"] as const),
  });

export type UserFormValues = z.infer<ReturnType<typeof createUserFormSchema>>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormValues) => Promise<void>;
  initialData?: Partial<User>;
  isSubmitting?: boolean;
  isLoading?: boolean;
}

export function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting = false,
  isLoading = false,
}: UserFormDialogProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(createUserFormSchema(!!initialData)),
    defaultValues: {
      name: initialData?.name || "",
      username: initialData?.username || "",
      email: initialData?.email || "",
      password: initialData?.password || "",
      role: initialData?.role || "admission",
    },
  });

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    form.setValue("password", newPassword);
    // Copy to clipboard
    navigator.clipboard
      .writeText(newPassword)
      .then(() => {
        toast.success("Password generated and copied to clipboard!");
        // Show the password temporarily
        setShowPassword(true);
      })
      .catch(() => {
        toast.success("Password generated! Please copy it manually.");
      });
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        username: initialData.username || "",
        email: initialData.email || "",
        password: initialData.password || "",
        role: initialData.role || "admission",
      });
    }
  }, [initialData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit User" : "Create New User"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the user's information below."
              : "Fill in the user's information below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {initialData ? "New Password (optional)" : "Password"}
                  </FormLabel>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FormControl>
                        <Input
                          placeholder={
                            initialData
                              ? "Enter new password"
                              : "Enter password"
                          }
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {/* {initialData && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGeneratePassword}
                        title="Generate new password"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )} */}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="admission">Admission</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
