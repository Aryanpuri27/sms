"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define types for teacher data
interface Teacher {
  id: string;
  userId: string;
  designation?: string | null;
  qualification?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

// Form validation schema
const teacherFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .optional()
    .or(z.literal("")),
  qualification: z.string().optional(),
  designation: z.string().optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
});

type TeacherFormValues = z.infer<typeof teacherFormSchema>;

export default function EditTeacherPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  // Following your guideline for handling params
  const [teacherId, setTeacherId] = useState<string>("");
  useEffect(() => {
    async function fetchParamId() {
      const param = await params;
      setTeacherId(param.id);
    }
    fetchParamId();
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form for editing teacher
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      qualification: "",
      designation: "",
      phoneNumber: "",
      bio: "",
    },
  });

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (status === "authenticated") {
      if (session.user?.role !== "ADMIN") {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive",
        });
        router.push("/unauthorized");
      } else if (teacherId) {
        fetchTeacher();
      } else {
        setError("Teacher ID is missing");
        setIsLoading(false);
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router, teacherId]);

  const fetchTeacher = async () => {
    if (!teacherId) {
      setError("Teacher ID is missing");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teachers/${teacherId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch teacher details");
      }

      const data = await response.json();

      // Populate form with teacher data
      form.reset({
        name: data.user.name,
        email: data.user.email,
        password: "", // Don't populate password for security
        qualification: data.qualification || "",
        designation: data.designation || "",
        phoneNumber: data.phoneNumber || "",
        bio: data.bio || "",
      });
    } catch (error: any) {
      console.error("Error fetching teacher details:", error);
      setError(
        error.message || "An error occurred while fetching teacher details"
      );
      toast({
        title: "Error",
        description: error.message || "Could not load teacher information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: TeacherFormValues) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update teacher");
      }

      toast({
        title: "Success",
        description: "Teacher information updated successfully",
      });

      // Navigate to teacher details page
      router.push(`/admin/teachers/${teacherId}`);
    } catch (error: any) {
      console.error("Error updating teacher:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update teacher",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (status === "loading" || (isLoading && !form.formState.isDirty)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading teacher information...</p>
      </div>
    );
  }

  // Error state
  if (error && !form.formState.isDirty) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-red-500 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push(`/admin/teachers/${teacherId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Teacher Details
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/teachers/${teacherId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teacher Details
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Teacher Information</CardTitle>
          <CardDescription>
            Update teacher details. All changes will be saved to the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Teacher name" {...field} />
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
                          <Input placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password (leave empty to keep current)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Only enter a new password if you want to change it.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="qualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. M.Sc., B.Ed." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Senior Teacher" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biography</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief information about the teacher"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="flex justify-between px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/teachers/${teacherId}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
