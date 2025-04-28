"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";

// Define types
interface Teacher {
  id: string;
  userId: string;
  user: {
    name: string;
  };
  classes: {
    id: string;
    name: string;
  }[];
}

interface Class {
  id: string;
  name: string;
  roomNumber?: string | null;
  section?: string | null;
  academicYear?: string | null;
  teacherId?: string | null;
}

export default function ManageTeacherClassesPage({
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(
    new Set()
  );
  const [currentAssignedClassIds, setCurrentAssignedClassIds] = useState<
    Set<string>
  >(new Set());

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
        fetchAllClasses();
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router, teacherId]);

  const fetchTeacherDetails = async () => {
    if (!teacherId) return;

    try {
      const response = await fetch(`/api/teachers/${teacherId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch teacher details");
      }

      const data = await response.json();
      setTeacher(data);

      // Initialize the sets of selected and current assigned class IDs
      const assignedClassIds = new Set(
        data.classes.map((cls: { id: string }) => cls.id)
      ) as Set<string>;
      setSelectedClassIds(new Set(assignedClassIds));
      setCurrentAssignedClassIds(new Set(assignedClassIds));
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

  const fetchAllClasses = async () => {
    try {
      const response = await fetch(`/api/classes`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch classes");
      }

      const data = await response.json();
      setAllClasses(data.classes);
    } catch (error: any) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: error.message || "Could not load classes",
        variant: "destructive",
      });
    }
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClassIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const hasChanges = () => {
    if (selectedClassIds.size !== currentAssignedClassIds.size) return true;

    for (const id of selectedClassIds) {
      if (!currentAssignedClassIds.has(id)) return true;
    }

    return false;
  };

  const saveChanges = async () => {
    if (!teacherId || !hasChanges()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/teachers/${teacherId}/classes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classIds: Array.from(selectedClassIds),
        }),
      });

      const data = await response.json();

      if (response.status === 409 && data.conflictingClasses) {
        // Handle conflict error - some classes are already assigned to other teachers
        const conflictingClasses = data.conflictingClasses as Class[];
        const conflictingClassNames = conflictingClasses
          .map((cls: Class) => cls.name)
          .join(", ");

        // Automatically unselect the conflicting classes
        const updatedSelection = new Set(selectedClassIds);
        conflictingClasses.forEach((cls: Class) => {
          updatedSelection.delete(cls.id);
        });
        setSelectedClassIds(updatedSelection);

        toast({
          title: "Class Assignment Conflict",
          description: `Some classes are already assigned to other teachers: ${conflictingClassNames}. These classes have been unselected.`,
          variant: "destructive",
        });

        return; // Exit early
      } else if (!response.ok) {
        // Handle other errors
        throw new Error(data.error || "Failed to update class assignments");
      }

      // Update the current assigned classes to match the selection
      setCurrentAssignedClassIds(new Set(selectedClassIds));

      toast({
        title: "Success",
        description: "Class assignments updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating class assignments:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update class assignments",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetChanges = () => {
    setSelectedClassIds(new Set(currentAssignedClassIds));
  };

  // Filter classes based on search term
  const filteredClasses = searchTerm
    ? allClasses.filter(
        (cls) =>
          cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.academicYear?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allClasses;

  // Loading state
  if (status === "loading" || (isLoading && !teacher)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
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
          onClick={() => router.push(`/admin/teachers/${teacherId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teacher Details
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetChanges}
            disabled={!hasChanges() || isSaving}
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={saveChanges} disabled={!hasChanges() || isSaving}>
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {teacher && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Classes for {teacher.user.name}</CardTitle>
            <CardDescription>
              Assign or remove classes for this teacher. Changes will not be
              saved until you click "Save Changes".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 w-full max-w-sm">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search classes..."
                    className="w-full pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Class Name</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          {searchTerm
                            ? "No matching classes found"
                            : "No classes available"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClasses.map((cls) => {
                        const isAssigned = selectedClassIds.has(cls.id);
                        const hasOtherTeacher =
                          cls.teacherId && cls.teacherId !== teacherId;

                        return (
                          <TableRow key={cls.id} className="hover:bg-muted/50">
                            <TableCell>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded-sm border border-primary"
                                checked={isAssigned}
                                onChange={() => handleClassToggle(cls.id)}
                                disabled={Boolean(hasOtherTeacher)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {cls.name}
                            </TableCell>
                            <TableCell>{cls.section || "-"}</TableCell>
                            <TableCell>{cls.roomNumber || "-"}</TableCell>
                            <TableCell>{cls.academicYear || "-"}</TableCell>
                            <TableCell>
                              {hasOtherTeacher ? (
                                <Badge variant="destructive">
                                  Assigned to another teacher
                                </Badge>
                              ) : isAssigned ? (
                                <Badge variant="default">Assigned</Badge>
                              ) : (
                                <Badge variant="outline">Not Assigned</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedClassIds.size} classes selected
            </div>
            {hasChanges() && (
              <div className="text-sm text-blue-500">
                You have unsaved changes
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
