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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Define types for student and class data
interface Student {
  id: string;
  name: string;
  email: string;
  image?: string;
  className: string;
  rollNumber?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  address?: string;
  parentName?: string;
  parentContact?: string;
}

interface ClassData {
  id: string;
  name: string;
}

// Form validation schema
const studentFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .optional()
    .or(z.literal("")),
  className: z.string().optional(),
  rollNumber: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Please select a gender.",
  }),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  parentName: z.string().optional(),
  parentContact: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export default function EditStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  // Access the studentId directly from params
  //   const studentId = params.id;/
  const [studentId, setStudentId] = useState<string>("");
  useEffect(() => {
    async function fetchStudentId() {
      const parm = await params;
      setStudentId(parm.id);
    }
    fetchStudentId();
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);

  // Form for editing student
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      className: "",
      rollNumber: "",
      gender: "MALE",
      dateOfBirth: "",
      address: "",
      parentName: "",
      parentContact: "",
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
      } else if (studentId) {
        fetchStudent();
        fetchClasses();
      } else {
        setError("Student ID is missing");
        setIsLoading(false);
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router, studentId]);

  const fetchStudent = async () => {
    if (!studentId) {
      setError("Student ID is missing");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/students/${studentId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch student details");
      }

      const data = await response.json();

      // Populate form with student data
      form.reset({
        name: data.name,
        email: data.email,
        password: "", // Don't populate password for security
        className:
          data.className === "Unassigned" ? "UNASSIGNED" : data.className,
        rollNumber: data.rollNumber || "",
        gender: data.gender as "MALE" | "FEMALE" | "OTHER",
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString().split("T")[0]
          : "",
        address: data.address || "",
        parentName: data.parentName || "",
        parentContact: data.parentContact || "",
      });
    } catch (error: any) {
      console.error("Error fetching student details:", error);
      setError(
        error.message || "An error occurred while fetching student details"
      );
      toast({
        title: "Error",
        description: error.message || "Could not load student information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }
      const data = await response.json();
      setClasses(data.classes);
    } catch (error: any) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Warning",
        description:
          "Could not load class list. You can still edit other student information.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: StudentFormValues) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/students/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update student");
      }

      toast({
        title: "Success",
        description: "Student information updated successfully",
      });

      // Navigate to student details page
      router.push(`/admin/students/${studentId}`);
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
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
        <p>Loading student information...</p>
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
        <Button onClick={() => router.push(`/admin/students/${studentId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Student Details
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
          onClick={() => router.push(`/admin/students/${studentId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Student Details
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Student Information</CardTitle>
          <CardDescription>
            Update student details. All changes will be saved to the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Student name" {...field} />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Academic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="className"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UNASSIGNED">
                              Unassigned
                            </SelectItem>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.name}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rollNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Roll Number" {...field} />
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Residential address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent/Guardian Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Parent name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <CardFooter className="flex justify-between px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/students/${studentId}`)}
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
