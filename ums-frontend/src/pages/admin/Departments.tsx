
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the Department interface
interface Department {
  id: string;
  name: string;
  description: string;
  facultyId: string;
  facultyName: string;
  head: string;
  email: string;
  phone: string;
}

// Define the Faculty interface for dropdown selection
interface Faculty {
  id: string;
  name: string;
}

// Sample data
const initialDepartments: Department[] = [
  {
    id: '1',
    name: 'Computer Science',
    description: 'Studies in computer science and information technology',
    facultyId: '1',
    facultyName: 'Faculty of Science',
    head: 'Dr. Alan Turing',
    email: 'cs.dept@university.edu',
    phone: '123-456-7890'
  },
  {
    id: '2',
    name: 'Business Administration',
    description: 'Studies in business and management',
    facultyId: '2',
    facultyName: 'Faculty of Business',
    head: 'Prof. Peter Drucker',
    email: 'business.dept@university.edu',
    phone: '123-456-7891'
  },
  {
    id: '3',
    name: 'Electrical Engineering',
    description: 'Studies in electrical systems and electronics',
    facultyId: '3',
    facultyName: 'Faculty of Engineering',
    head: 'Dr. Nikola Tesla',
    email: 'ee.dept@university.edu',
    phone: '123-456-7892'
  },
];

// Sample faculties for dropdown
const faculties: Faculty[] = [
  { id: '1', name: 'Faculty of Science' },
  { id: '2', name: 'Faculty of Business' },
  { id: '3', name: 'Faculty of Engineering' },
];

// Form schema
const departmentFormSchema = z.object({
  name: z.string().min(2, { message: 'Department name is required' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  facultyId: z.string().min(1, { message: 'Faculty is required' }),
  head: z.string().min(2, { message: 'Department head name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(6, { message: 'Phone number is required' }),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [isOpen, setIsOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Setup form
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: '',
      description: '',
      facultyId: '',
      head: '',
      email: '',
      phone: '',
    },
  });

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingDepartment(null);
    }
    setIsOpen(open);
  };

  // Handle form submission
  const onSubmit = (data: DepartmentFormValues) => {
    const selectedFaculty = faculties.find(faculty => faculty.id === data.facultyId);
    const facultyName = selectedFaculty ? selectedFaculty.name : '';

    if (editingDepartment) {
      // Update existing department
      const updatedDepartments = departments.map(department => 
        department.id === editingDepartment.id 
          ? { 
              ...department, 
              ...data, 
              facultyName
            } 
          : department
      );
      setDepartments(updatedDepartments);
      toast.success('Department updated successfully');
    } else {
      // Add new department
      const newDepartment: Department = {
        id: String(Date.now()),
        ...data,
        facultyName
      };
      setDepartments([...departments, newDepartment]);
      toast.success('Department added successfully');
    }
    handleDialogOpenChange(false);
  };

  // Handle edit department
  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.reset({
      name: department.name,
      description: department.description,
      facultyId: department.facultyId,
      head: department.head,
      email: department.email,
      phone: department.phone,
    });
    setIsOpen(true);
  };

  // Handle delete department
  const handleDelete = (id: string) => {
    const updatedDepartments = departments.filter(department => department.id !== id);
    setDepartments(updatedDepartments);
    toast.success('Department deleted successfully');
  };

  // Define columns
  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'facultyName',
      header: 'Faculty',
    },
    {
      accessorKey: 'head',
      header: 'Department Head',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const department = row.original;
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleEdit(department)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(department.id)}
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
        title="Departments"
        description="Manage university departments"
        action={{
          label: 'Add Department',
          icon: Plus,
          onClick: () => setIsOpen(true),
        }}
      />

      <DataTable columns={columns} data={departments} />

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add New Department'}</DialogTitle>
            <DialogDescription>
              {editingDepartment 
                ? 'Update department information in the form below.' 
                : 'Fill in the details to create a new department.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department name" {...field} />
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
                        placeholder="Enter department description" 
                        className="min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facultyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faculty</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a faculty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {faculties.map((faculty) => (
                          <SelectItem key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="head"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Head</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter department head's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingDepartment ? 'Update Department' : 'Add Department'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsPage;
