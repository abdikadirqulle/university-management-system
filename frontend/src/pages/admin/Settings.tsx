import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Building,
  Settings as SettingsIcon,
  Save,
  Bell,
  Loader2,
} from "lucide-react";
import settingsService, {
  UniversitySettings,
  SystemSettings,
} from "@/services/settingsService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// University settings form schema
const universityFormSchema = z.object({
  name: z.string().min(2, { message: "University name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(5, { message: "Phone is required" }),
  address: z.string().min(5, { message: "Address is required" }),
});

// System settings form schema
const systemFormSchema = z.object({
  theme: z.string(),
  language: z.string(),
  dateFormat: z.string(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

const SettingsPage = () => {
  const queryClient = useQueryClient();

  // Fetch settings data
  const { data: universityData, isLoading: isLoadingUniversity } = useQuery({
    queryKey: ["universitySettings"],
    queryFn: settingsService.getUniversitySettings,
  });

  const { data: systemData, isLoading: isLoadingSystem } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: settingsService.getSystemSettings,
  });

  // University form
  const universityForm = useForm<z.infer<typeof universityFormSchema>>({
    resolver: zodResolver(universityFormSchema),
    values: universityData || {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  // System form
  const systemForm = useForm<z.infer<typeof systemFormSchema>>({
    resolver: zodResolver(systemFormSchema),
    values: systemData || {
      theme: "light",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      emailNotifications: true,
      smsNotifications: false,
    },
  });

  // Update mutations
  const updateUniversityMutation = useMutation({
    mutationFn: settingsService.updateUniversitySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universitySettings"] });
      toast.success("University information saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save university information");
    },
  });

  const updateSystemMutation = useMutation({
    mutationFn: settingsService.updateSystemSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
      toast.success("System settings saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save system settings");
    },
  });

  // Form submission handlers
  const onUniversitySubmit = (data: z.infer<typeof universityFormSchema>) => {
    updateUniversityMutation.mutate(data);
  };

  const onSystemSubmit = (data: z.infer<typeof systemFormSchema>) => {
    updateSystemMutation.mutate(data);
  };

  if (isLoadingUniversity || isLoadingSystem) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your university system settings"
      />

      <Tabs defaultValue="university" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 gap-4">
          <TabsTrigger value="university" className="flex gap-2 items-center">
            <Building className="h-4 w-4" />
            <span>University</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex gap-2 items-center">
            <SettingsIcon className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="university">
          <Card>
            <CardHeader>
              <CardTitle>University Information</CardTitle>
              <CardDescription>
                Manage basic university information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...universityForm}>
                <form
                  onSubmit={universityForm.handleSubmit(onUniversitySubmit)}
                  className="space-y-6"
                >
                  <div className="grid gap-6">
                    <FormField
                      control={universityForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={universityForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={universityForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={universityForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={updateUniversityMutation.isPending}
                  >
                    {updateUniversityMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>
                Configure system-wide settings and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...systemForm}>
                <form
                  onSubmit={systemForm.handleSubmit(onSystemSubmit)}
                  className="space-y-6"
                >
                  <div className="grid gap-6">
                    <FormField
                      control={systemForm.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="so">Somali</SelectItem>
                              <SelectItem value="ar">Arabic</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Format</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select date format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MM/DD/YYYY">
                                MM/DD/YYYY
                              </SelectItem>
                              <SelectItem value="DD/MM/YYYY">
                                DD/MM/YYYY
                              </SelectItem>
                              <SelectItem value="YYYY-MM-DD">
                                YYYY-MM-DD
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={systemForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Email Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications via email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={systemForm.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>SMS Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications via SMS
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={updateSystemMutation.isPending}
                  >
                    {updateSystemMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
