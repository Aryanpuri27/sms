"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, PencilLine, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

// Define types for teacher data
interface Teacher {
  id: string;
  userId: string;
  designation?: string | null;
  qualification?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  classes: {
    id: string;
    name: string;
  }[];
}

export default function TeacherDetailsPage({
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

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin before loading
  useEffect(() => {
    if (status === "authenticated") {
      if (session.user?.role !== "ADMIN") {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive",
        });
        router.push("/unauthorized");
      } else if (teacherId) {
        fetchTeacherDetails();
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router, teacherId]);

  const fetchTeacherDetails = async () => {
    if (!teacherId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teachers/${teacherId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch teacher details");
      }

      const data = await response.json();
      setTeacher(data);
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

  // Loading state
  if (status === "loading" || (isLoading && !teacher)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading teacher information...</p>
      </div>
    );
  }

  // Error state
  if (error && !teacher) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-red-500 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push("/admin/teachers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Teachers List
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/teachers")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teachers
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/teachers/edit/${teacherId}`)}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Edit Teacher
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/teachers/classes/${teacherId}`)}
          >
            <UserCog className="mr-2 h-4 w-4" />
            Manage Classes
          </Button>
        </div>
      </div>

      {teacher && (
        <>
          {/* Teacher Profile Card */}
          <div className="grid gap-6 md:grid-cols-[300px_1fr] mb-6">
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage
                    src={
                      teacher.user.image ||
                      `/placeholder.svg?height=128&width=128`
                    }
                    alt={teacher.user.name}
                  />
                  <AvatarFallback className="text-3xl">
                    {teacher.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{teacher.user.name}</h2>
                <p className="text-muted-foreground">
                  {teacher.designation || "Teacher"}
                </p>

                <div className="mt-4 w-full">
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <span className="text-sm text-muted-foreground">
                      Email:
                    </span>
                    <span className="text-sm font-medium text-right">
                      {teacher.user.email}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <span className="text-sm text-muted-foreground">
                      Phone:
                    </span>
                    <span className="text-sm font-medium text-right">
                      {teacher.phoneNumber || "Not provided"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-sm text-muted-foreground">
                      Classes:
                    </span>
                    <span className="text-sm font-medium text-right">
                      {teacher.classes.length > 0
                        ? teacher.classes.length
                        : "None assigned"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Detailed information about {teacher.user.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile">
                  <TabsList className="mb-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="classes">Classes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Qualification</h3>
                      <p className="text-muted-foreground">
                        {teacher.qualification ||
                          "No qualification information provided"}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Biography</h3>
                      <p className="text-muted-foreground">
                        {teacher.bio || "No biography information provided"}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">
                        Account Information
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            User ID
                          </p>
                          <p className="font-medium">{teacher.userId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Teacher ID
                          </p>
                          <p className="font-medium">{teacher.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Created On
                          </p>
                          <p className="font-medium">
                            {new Date(teacher.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Last Updated
                          </p>
                          <p className="font-medium">
                            {new Date(teacher.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="classes">
                    {teacher.classes.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">
                          No classes have been assigned to this teacher yet.
                        </p>
                        <Button
                          className="mt-4"
                          variant="outline"
                          onClick={() =>
                            router.push(`/admin/teachers/classes/${teacherId}`)
                          }
                        >
                          Assign Classes
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teacher.classes.map((cls) => (
                            <Card key={cls.id}>
                              <CardHeader className="py-4">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-lg">
                                    {cls.name}
                                  </CardTitle>
                                  <Badge variant="secondary">Active</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="py-2">
                                <div className="flex justify-between">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      router.push(`/admin/classes/${cls.id}`)
                                    }
                                  >
                                    View Class
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
