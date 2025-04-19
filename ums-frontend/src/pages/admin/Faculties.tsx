import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

// Define the Faculty interface
interface Faculty {
  id: string;
  name: string;
  description: string;
  dean: string;
  location: string;
  established: string;
}

// Sample data
const initialFaculties: Faculty[] = [
  {
    id: "1",
    name: "Faculty of Science",
    description: "Provides education in various scientific disciplines",
    dean: "Dr. ahmed mohamed",
    location: "Block A, Floor 2",
    established: "1990",
  },
  {
    id: "2",
    name: "Faculty of Business",
    description: "Offers programs in business administration and economics",
    dean: "Prof. Sarah yusuf",
    location: "Block B, Floor 1",
    established: "1995",
  },
  {
    id: "3",
    name: "Faculty of Engineering",
    description: "Specializes in engineering disciplines and technology",
    dean: "Dr. xasan ali",
    location: "Block C, Floor 3",
    established: "1992",
  },
];

// Form schema
const facultyFormSchema = z.object({
  name: z.string().min(2, { message: "Faculty name is required" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  dean: z.string().min(2, { message: "Dean name is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  established: z
    .string()
    .regex(/^\d{4}$/, { message: "Year must be a 4-digit number" }),
});

type FacultyFormValues = z.infer<typeof facultyFormSchema>;

const FacultiesPage = () => {
  const [faculties, setFaculties] = useState<Faculty[]>(initialFaculties);
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
      established: "",
    },
  });

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingFaculty(null);
    }
    setIsOpen(open);
  };

  // Handle form submission
  const onSubmit = (data: FacultyFormValues) => {
    if (editingFaculty) {
      // Update existing faculty
      const updatedFaculties = faculties.map((faculty) =>
        faculty.id === editingFaculty.id ? { ...faculty, ...data } : faculty,
      );
      setFaculties(updatedFaculties);
      toast.success("Faculty updated successfully");
    } else {
      // Add new faculty
      const newFaculty: Faculty = {
        id: String(Date.now()),
        name: data.name,
        description: data.description,
        dean: data.dean,
        location: data.location,
        established: data.established,
      };
      setFaculties([...faculties, newFaculty]);
      toast.success("Faculty added successfully");
    }
    handleDialogOpenChange(false);
  };

  // Handle edit faculty
  const handleEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    form.reset({
      name: faculty.name,
      description: faculty.description,
      dean: faculty.dean,
      location: faculty.location,
      established: faculty.established,
    });
    setIsOpen(true);
  };

  // Handle delete faculty
  const handleDelete = (id: string) => {
    const updatedFaculties = faculties.filter((faculty) => faculty.id !== id);
    setFaculties(updatedFaculties);
    toast.success("Faculty deleted successfully");
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
      accessorKey: "established",
      header: "Established",
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
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(faculty.id)}
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

      <DataTable columns={columns} data={faculties} />

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingFaculty ? "Edit Faculty" : "Add New Faculty"}
            </DialogTitle>
            <DialogDescription>
              {editingFaculty
                ? "Update faculty information in the form below."
                : "Fill in the details to create a new faculty."}
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
                name="established"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Established</FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingFaculty ? "Update Faculty" : "Add Faculty"}
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
