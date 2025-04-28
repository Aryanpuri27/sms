"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Mail,
  MapPin,
  Phone,
  School,
  User,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define the student data type
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
  createdAt: string;
}

export default function StudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
      } else {
        fetchStudentDetails();
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router, params.id]);

  const fetchStudentDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/students/${params.id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch student details");
      }

      const data = await response.json();
      setStudent(data);
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

  const handleDeleteStudent = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete student");
      }

      toast({
        title: "Success",
        description: "Student has been deleted successfully",
      });

      // Navigate back to the students list
      router.push("/admin/students");
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading student information...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-red-500 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push("/admin/students")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Students List
        </Button>
      </div>
    );
  }

  // If student not found
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
          <p>The requested student information could not be found.</p>
        </div>
        <Button onClick={() => router.push("/admin/students")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Students List
        </Button>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header with navigation and actions */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/students")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/students/edit/${params.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Student
          </Button>
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Delete Student
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete{" "}
                  {student.name}'s account and remove their data from our
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteStudent}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Student profile header */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={student.image || "/placeholder.svg?height=96&width=96"}
                />
                <AvatarFallback className="text-2xl">
                  {student.name?.[0] || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{student.name}</h1>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2 items-center justify-center md:justify-start">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-3 py-1 rounded-full">
                    {student.rollNumber
                      ? `Roll No: ${student.rollNumber}`
                      : "No Roll Number"}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 px-3 py-1 rounded-full">
                    {student.className}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1 rounded-full">
                    Student
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <p>{student.email}</p>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <p>{student.gender}</p>
                    </div>
                    {student.dateOfBirth && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <p>Born: {formatDate(student.dateOfBirth)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed information tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Student's personal and demographic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Full Name
                  </h3>
                  <p className="mt-1 text-lg">{student.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                  <p className="mt-1 text-lg">{student.gender}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Email Address
                  </h3>
                  <p className="mt-1 text-lg">{student.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </h3>
                  <p className="mt-1 text-lg">
                    {formatDate(student.dateOfBirth)}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 text-lg">
                  {student.address || "No address provided"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Parent/Guardian Name
                  </h3>
                  <p className="mt-1 text-lg">
                    {student.parentName || "Not provided"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Parent/Guardian Contact
                  </h3>
                  <p className="mt-1 text-lg">
                    {student.parentContact || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Information Tab */}
        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>
                Student's class, enrollment and academic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Student ID
                  </h3>
                  <p className="mt-1 text-lg">{student.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Roll Number
                  </h3>
                  <p className="mt-1 text-lg">
                    {student.rollNumber || "Not assigned"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Class</h3>
                  <p className="mt-1 text-lg">{student.className}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Registration Date
                  </h3>
                  <p className="mt-1 text-lg">
                    {formatDate(student.createdAt)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  Academic Records
                </h3>
                <div className="text-blue-600">
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() =>
                      router.push(`/admin/students/${student.id}/attendance`)
                    }
                  >
                    View Attendance Records
                  </Button>
                  <Separator className="my-2" />
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() =>
                      router.push(`/admin/students/${student.id}/grades`)
                    }
                  >
                    View Grade Reports
                  </Button>
                  <Separator className="my-2" />
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() =>
                      router.push(`/admin/students/${student.id}/assignments`)
                    }
                  >
                    View Assignments
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Information Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Student and parent/guardian contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium flex items-center text-gray-700">
                    <UserCircle className="h-5 w-5 mr-2" />
                    Student Contact
                  </h3>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="text-base">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-base">
                          {student.address || "No address provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-2" />
                    Parent/Guardian Contact
                  </h3>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="text-base">
                          {student.parentName || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Contact Number</p>
                        <p className="text-base">
                          {student.parentContact || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium flex items-center text-gray-700">
                    <School className="h-5 w-5 mr-2" />
                    Class Information
                  </h3>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Class</p>
                        <p className="text-base">{student.className}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.print()}
              >
                Print Contact Information
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
