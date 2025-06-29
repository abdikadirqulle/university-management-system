import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Faculty, useFacultyStore } from "@/store/useFacultyStore";

// Form schema
const facultyFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Faculty name is required" })
    .regex(
      /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s]*$/,
      { message: "Faculty name should only contain letters and spaces" },
    ),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .optional(),
  dean: z
    .string()
    .min(2, { message: "Dean name is required" })
    .regex(
      /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s]*$/,
      { message: "Dean name should only contain letters and spaces" },
    ),
  location: z
    .string()
    .min(2, { message: "Location is required" })
    .regex(
      /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s]*$/,
      { message: "Location should only contain letters and spaces" },
    )
    .optional(),
  establish: z.coerce
    .number()
    .min(1900, { message: "Year must be valid (after 1900)" })
    .max(new Date().getFullYear(), { message: "Year cannot be in the future" }),
});

type FacultyFormValues = z.infer<typeof facultyFormSchema>;

const FacultiesPage = () => {
  const {
    faculties,
    fetchFaculties,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    isLoading,
  } = useFacultyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Setup form
  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(facultyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      dean: "",
      location: "",
      establish: new Date().getFullYear(),
    },
  });

  // Fetch faculties on component mount
  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingFaculty(null);
    }
    setIsOpen(open);
  };

  // Handle form submission
  const onSubmit = async (data: FacultyFormValues) => {
    try {
      if (editingFaculty) {
        // Update existing faculty
        await updateFaculty(editingFaculty.id, data);
      } else {
        // Add new faculty
        await addFaculty(data);
      }
      handleDialogOpenChange(false);
    } catch (error) {
      toast.error("Failed to save faculty");
      console.error(error);
    }
  };

  // Handle edit faculty
  const handleEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    form.reset({
      name: faculty.name,
      description: faculty.description || "",
      dean: faculty.dean,
      location: faculty.location || "",
      establish: faculty.establish,
    });
    setIsOpen(true);
  };

  // Handle delete faculty
  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this faculty? This action cannot be undone.",
      )
    ) {
      try {
        await deleteFaculty(id);
      } catch (error) {
        toast.error("Failed to delete faculty");
        console.error(error);
      }
    }
  };

  // Define columns
  const columns: ColumnDef<Faculty>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "dean",
      header: "Dean",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "establish",
      header: "Established",
      cell: ({ row }) => row.original.establish || "Unknown",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const faculty = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(faculty)}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(faculty.id)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculties"
        description="Manage university faculties"
        action={{
          label: "Add Faculty",
          icon: Plus,
          onClick: () => setIsOpen(true),
        }}
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading faculties...</span>
          </div>
        ) : (
          <DataTable columns={columns} data={faculties} />
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingFaculty ? "Edit Faculty" : "Add New Faculty"}
            </DialogTitle>
            <DialogDescription>
              {editingFaculty
                ? "Update the faculty details below"
                : "Fill in the faculty details below to add a new faculty"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faculty Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter faculty name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter faculty description"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dean"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dean</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter dean's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter faculty location"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="establish"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Established</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="YYYY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || isLoading}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingFaculty ? "Updating..." : "Adding..."}
                    </>
                  ) : editingFaculty ? (
                    "Update Faculty"
                  ) : (
                    "Add Faculty"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultiesPage;
