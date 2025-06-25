import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import { api } from "@/services/api";

// Define the form schema
const formSchema = z.object({
  semester: z.string().min(1, "Semester is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  departmentIds: z
    .array(z.string())
    .min(1, "At least one department must be selected"),
});

interface SemesterTransitionDialogProps {
  open: boolean;
  onClose: () => void;
}

const SemesterTransitionDialog: React.FC<SemesterTransitionDialogProps> = ({
  open,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { departments } = useDepartmentStore();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  // Generate semester options (1-8)
  const semesterOptions = Array.from({ length: 8 }, (_, i) =>
    (i + 1).toString(),
  );

  // Generate academic year options
  const currentYear = new Date().getFullYear();
  const academicYearOptions = [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
  ];

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      semester: "",
      academicYear: `${currentYear}-${currentYear + 1}`,
      departmentIds: [],
    },
  });

  // Handle department selection
  const handleDepartmentToggle = (departmentId: string) => {
    setSelectedDepartments((prev) => {
      if (prev.includes(departmentId)) {
        return prev.filter((id) => id !== departmentId);
      } else {
        return [...prev, departmentId];
      }
    });

    // Update form value
    const currentDepts = form.getValues("departmentIds");
    if (currentDepts.includes(departmentId)) {
      form.setValue(
        "departmentIds",
        currentDepts.filter((id) => id !== departmentId),
      );
    } else {
      form.setValue("departmentIds", [...currentDepts, departmentId]);
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const response = await api.post("/academic-calendar/transition", values);

      if (response.data.success) {
        toast.success("Semester transition completed successfully");
        onClose();
      } else {
        toast.error(
          response.data.message || "Failed to process semester transition",
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred during semester transition",
      );
      console.error("Semester transition error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>End-of-Semester Transition</DialogTitle>
          <DialogDescription>
            This will process end-of-semester transitions for all students in
            the selected departments. Pending fees will be forwarded to the next
            semester, and students will be promoted.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Semester Selection */}
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Semester</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {semesterOptions.map((sem) => (
                          <SelectItem key={sem} value={sem}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Academic Year */}
              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {academicYearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Department Selection */}
            <div>
              <FormLabel>Affected Departments</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                {departments.map((department) => (
                  <div
                    key={department.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={department.id}
                      checked={selectedDepartments.includes(department.id)}
                      onCheckedChange={() =>
                        handleDepartmentToggle(department.id)
                      }
                    />
                    <label
                      htmlFor={department.id}
                      className="text-sm cursor-pointer"
                    >
                      {department.name}
                    </label>
                  </div>
                ))}
              </div>
              {form.formState.errors.departmentIds && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.departmentIds.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Process Transition
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SemesterTransitionDialog;
