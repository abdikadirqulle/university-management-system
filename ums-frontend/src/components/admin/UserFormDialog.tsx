import React, { useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@/types/auth"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Form schema for user form
const userFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["academic", "admission", "student", "financial"] as const),
  department: z.string().optional(),
  admissionId: z.string().optional(),
  studentId: z.string().optional(),
})

export type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  dialogMode: "add" | "edit"
  currentUser: User | null
  onSubmit: (data: UserFormValues) => Promise<void>
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  isOpen,
  onOpenChange,
  dialogMode,
  currentUser,
  onSubmit,
}) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "student",
      department: "",
      admissionId: "",
      studentId: "",
    },
  })

  // Reset form when dialog opens/closes or when currentUser changes
  useEffect(() => {
    if (isOpen && dialogMode === "add") {
      form.reset({
        name: "",
        email: "",
        role: "student",
        department: "",
        admissionId: "",
        studentId: "",
      })
    } else if (isOpen && dialogMode === "edit" && currentUser) {
      form.reset({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        department: currentUser.department || "",
        admissionId: currentUser.admissionId || "",
        studentId: currentUser.studentId || "",
      })
    }
  }, [isOpen, dialogMode, currentUser, form])

  const handleSubmit = async (data: UserFormValues) => {
    await onSubmit(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {dialogMode === "add" ? "Add New User" : "Edit User"}
          </DialogTitle>
          <DialogDescription>
            {dialogMode === "add"
              ? "Fill in the details to add a new user to the system."
              : "Update the user details below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
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
                    <Input placeholder="email@university.edu" {...field} />
                  </FormControl>
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
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="academic">Academic (Admin)</SelectItem>
                      <SelectItem value="admission">admission</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="financial">Financial Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(form.watch("role") === "admission" ||
              form.watch("role") === "student") && (
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("role") === "admission" && (
              <FormField
                control={form.control}
                name="admissionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>admission ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., admission001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("role") === "student" && (
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., STU001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {dialogMode === "add" ? "Add User" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UserFormDialog
