"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  Users,
  X,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Type definitions
type Teacher = {
  id: string;
  name: string;
  email?: string;
  image?: string;
};

type Student = {
  id: string;
  name: string;
  rollNumber?: string;
  email: string;
  image?: string;
  classId?: string;
  className?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
};

type Subject = {
  id: string;
  name: string;
  code?: string;
};

type Class = {
  id: string;
  name: string;
  teacherName: string;
  studentCount: number;
  roomNumber?: string;
  section?: string;
  academicYear?: string;
  teacherId?: string;
  attendance?: number;
};

type ClassDetail = {
  id: string;
  name: string;
  roomNumber?: string;
  section?: string;
  academicYear?: string;
  teacher: Teacher | null;
  students: Student[];
  subjects: Subject[];
  counts: {
    students: number;
    assignments: number;
    timetableEntries: number;
  };
  createdAt: string;
  updatedAt: string;
};

type Assignment = {
  id: string;
  title: string;
  dueDate: string;
  subject: { name: string };
  status: string;
};

type TimetableEntry = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: { name: string };
  teacher: { user: { name: string } };
};

// Form validation schemas
const classSchema = z.object({
  name: z.string().min(1, { message: "Class name is required" }),
  teacherId: z.string().min(1, { message: "Class teacher is required" }),
  roomNumber: z.string().optional(),
  section: z.string().optional(),
  academicYear: z.string().optional(),
});

// Helper functions
const formatTime = (timeString: string) => {
  if (!timeString) return "";
  try {
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return timeString;
  }
};

const getDayName = (day: number) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day] || "Unknown";
};

// Tab components for ClassDetails
const StudentsTab = ({
  classDetails,
  onAssignStudents,
}: {
  classDetails: ClassDetail;
  onAssignStudents: () => void;
}) => {
  if (classDetails.students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p>No students assigned to this class yet.</p>
        <Button variant="link" className="mt-2" onClick={onAssignStudents}>
          Assign Students
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Roll Number</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classDetails.students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.rollNumber}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {student.email}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const AssignmentsTab = ({
  assignments,
  isLoading,
}: {
  assignments: Assignment[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p>No assignments for this class yet.</p>
        <Button variant="link" className="mt-2">
          Create Assignment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{assignment.title}</h3>
              <p className="text-sm text-muted-foreground">
                {assignment.subject.name}
              </p>
            </div>
            <Badge
              variant={
                assignment.status === "COMPLETED"
                  ? "success"
                  : assignment.status === "ACTIVE"
                  ? "default"
                  : "outline"
              }
            >
              {assignment.status}
            </Badge>
          </div>
          <div className="mt-2 text-sm">
            <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

const TimetableTab = ({
  timetable,
  isLoading,
}: {
  timetable: TimetableEntry[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (timetable.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MoreHorizontal className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p>No timetable entries for this class yet.</p>
        <Button variant="link" className="mt-2">
          Create Timetable
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[...Array(7)].map((_, dayIndex) => {
        const dayEntries = timetable.filter(
          (entry) => entry.dayOfWeek === dayIndex
        );
        if (dayEntries.length === 0) return null;

        return (
          <div key={dayIndex} className="space-y-2">
            <h3 className="font-medium">{getDayName(dayIndex)}</h3>
            <div className="space-y-2">
              {dayEntries
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((entry) => (
                  <Card
                    key={entry.id}
                    className="p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{entry.subject.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.teacher.user.name}
                      </p>
                    </div>
                    <div className="text-sm">
                      {formatTime(entry.startTime)} -{" "}
                      {formatTime(entry.endTime)}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Class Details Component
const ViewDetailsSheet = ({
  classId,
  onOpenChange,
  open,
}: {
  classId: string | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const [classDetails, setClassDetails] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [manageStudentsOpen, setManageStudentsOpen] = useState(false);
  const { toast } = useToast();

  // Function to refresh class details
  const refreshClassDetails = useCallback(() => {
    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  useEffect(() => {
    if (classId && open) {
      fetchClassDetails();
    }
  }, [classId, open]);

  useEffect(() => {
    if (classId && open && activeTab === "assignments") {
      fetchAssignments();
    }
  }, [classId, open, activeTab]);

  useEffect(() => {
    if (classId && open && activeTab === "timetable") {
      fetchTimetable();
    }
  }, [classId, open, activeTab]);

  // Listen for events to open the student assignment dialog
  useEffect(() => {
    const handleOpenStudentAssignment = (event: any) => {
      if (event.detail.classId === classId) {
        setManageStudentsOpen(true);
      }
    };

    document.addEventListener(
      "openStudentAssignment",
      handleOpenStudentAssignment
    );
    return () => {
      document.removeEventListener(
        "openStudentAssignment",
        handleOpenStudentAssignment
      );
    };
  }, [classId]);

  const fetchClassDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/classes/${classId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch class details");
      }
      const data = await response.json();
      setClassDetails(data);
    } catch (error) {
      console.error("Error fetching class details:", error);
      toast({
        title: "Error",
        description: "Failed to load class details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const response = await fetch(`/api/classes/${classId}/assignments`);
      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      // Fallback to mock data
      setAssignments([
        {
          id: "a1",
          title: "Mathematics Assignment",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          subject: { name: "Mathematics" },
          status: "ACTIVE",
        },
        {
          id: "a2",
          title: "Science Lab Report",
          dueDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
          subject: { name: "Science" },
          status: "ACTIVE",
        },
      ]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchTimetable = async () => {
    setLoadingTimetable(true);
    try {
      const response = await fetch(`/api/classes/${classId}/timetable`);
      if (!response.ok) {
        throw new Error("Failed to fetch timetable");
      }
      const data = await response.json();
      setTimetable(data.timetableEntries || []);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      // Fallback to mock data
      setTimetable([
        {
          id: "t1",
          dayOfWeek: 1,
          startTime: "09:00:00",
          endTime: "10:00:00",
          subject: { name: "Mathematics" },
          teacher: { user: { name: "Mrs. Sharma" } },
        },
        {
          id: "t2",
          dayOfWeek: 1,
          startTime: "10:00:00",
          endTime: "11:00:00",
          subject: { name: "Science" },
          teacher: { user: { name: "Mr. Verma" } },
        },
        {
          id: "t3",
          dayOfWeek: 2,
          startTime: "09:00:00",
          endTime: "10:00:00",
          subject: { name: "English" },
          teacher: { user: { name: "Mrs. Gupta" } },
        },
      ]);
    } finally {
      setLoadingTimetable(false);
    }
  };

  const handleManageStudents = () => {
    setManageStudentsOpen(true);
  };

  const handleStudentsUpdated = () => {
    // Refresh class details to show updated student list and count
    refreshClassDetails();
    setManageStudentsOpen(false);
  };

  const handleAssignFromTab = () => {
    setManageStudentsOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {loading ? (
                <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
              ) : classDetails ? (
                `Class ${classDetails.name}`
              ) : (
                "Class Details"
              )}
            </SheetTitle>
            <SheetDescription>
              Comprehensive information about the class
            </SheetDescription>
          </SheetHeader>

          {loading ? (
            <div className="flex flex-col space-y-3 py-6">
              <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
            </div>
          ) : classDetails ? (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Room
                  </h4>
                  <p>{classDetails.roomNumber || "Not assigned"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Section
                  </h4>
                  <p>{classDetails.section || "Not assigned"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Academic Year
                  </h4>
                  <p>{classDetails.academicYear || "Not assigned"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Class Teacher
                  </h4>
                  <p>{classDetails.teacher?.name || "Not assigned"}</p>
                </div>
              </div>

              <Tabs
                defaultValue="students"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="students">
                    Students ({classDetails.counts.students})
                  </TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="timetable">Timetable</TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="mt-4">
                  <StudentsTab
                    classDetails={classDetails}
                    onAssignStudents={handleAssignFromTab}
                  />
                </TabsContent>

                <TabsContent value="assignments" className="mt-4">
                  <AssignmentsTab
                    assignments={assignments}
                    isLoading={loadingAssignments}
                  />
                </TabsContent>

                <TabsContent value="timetable" className="mt-4">
                  <TimetableTab
                    timetable={timetable}
                    isLoading={loadingTimetable}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">No class selected</p>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <Button
              onClick={handleManageStudents}
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Assign Students
            </Button>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {classDetails && (
        <ManageStudentsDialog
          open={manageStudentsOpen}
          onOpenChange={setManageStudentsOpen}
          classDetails={classDetails}
          onStudentsUpdated={handleStudentsUpdated}
        />
      )}
    </>
  );
};

// Students Management Dialog
interface ManageStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classDetails: ClassDetail;
  onStudentsUpdated: () => void;
}

const ManageStudentsDialog = ({
  open,
  onOpenChange,
  classDetails,
  onStudentsUpdated,
}: ManageStudentsDialogProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open && classDetails) {
      fetchStudents();
      fetchAssignedStudents();
    }
  }, [open, classDetails]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/students?limit=100");
      const data = await response.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/classes/${classDetails.id}/students`);
      const data = await response.json();
      if (data.students) {
        setAssignedStudents(
          data.students.map((student: Student) => student.id)
        );
      }
    } catch (error) {
      console.error("Error fetching assigned students:", error);
      toast({
        title: "Error",
        description: "Failed to load assigned students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setAssignedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/classes/${classDetails.id}/students`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentIds: assignedStudents }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Students assigned successfully",
        });

        // Call the callback to refresh data in the parent component
        onStudentsUpdated();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to assign students");
      }
    } catch (error) {
      console.error("Error assigning students:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to assign students",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAll = () => {
    if (filteredStudents.length === 0) return;

    if (assignedStudents.length === filteredStudents.length) {
      // Deselect all if all are selected
      setAssignedStudents([]);
    } else {
      // Select all filtered students
      setAssignedStudents(filteredStudents.map((student) => student.id));
    }
  };

  const filteredStudents =
    searchQuery.trim() === ""
      ? students
      : students.filter(
          (student) =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (student.rollNumber &&
              student.rollNumber
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Students for {classDetails?.name}</DialogTitle>
          <DialogDescription>
            Select students to assign to this class
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <h3 className="text-sm font-medium">
                {assignedStudents.length} student(s) selected
              </h3>
              <div className="flex w-full md:w-auto items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredStudents.length === 0}
              >
                {assignedStudents.length === filteredStudents.length &&
                filteredStudents.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Current Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        {searchQuery
                          ? "No students match your search"
                          : "No students found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                            checked={assignedStudents.includes(student.id)}
                            onCheckedChange={() =>
                              handleStudentToggle(student.id)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.rollNumber || "-"}</TableCell>
                        <TableCell>
                          {student.className || "Unassigned"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add the AddClassDialog component before the EditClassDialog component
interface AddClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassAdded: () => void;
}

const AddClassDialog = ({
  open,
  onOpenChange,
  onClassAdded,
}: AddClassDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      teacherId: "",
      roomNumber: "",
      section: "",
      academicYear: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchTeachers();
      form.reset({
        name: "",
        teacherId: "",
        roomNumber: "",
        section: "",
        academicYear: "",
      });
    }
  }, [open, form]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      if (!response.ok) {
        throw new Error("Failed to fetch teachers");
      }
      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "Error",
        description: "Failed to load teachers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof classSchema>) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create class");
      }

      toast({
        title: "Success",
        description: "Class created successfully",
      });

      onOpenChange(false);
      onClassAdded();
    } catch (error) {
      console.error("Error creating class:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create class",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
          <DialogDescription>
            Create a new class and assign a teacher
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Class 9A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Teacher</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. R-101" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. A" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 2023-2024" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  </>
                ) : (
                  "Create Class"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

interface EditClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: Class | null;
  onClassUpdated: () => void;
}

const EditClassDialog = ({
  open,
  onOpenChange,
  classData,
  onClassUpdated,
}: EditClassDialogProps) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form definition
  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: classData?.name || "",
      teacherId: classData?.teacherId || "",
      roomNumber: classData?.roomNumber || "",
      section: classData?.section || "",
      academicYear: classData?.academicYear || "",
    },
  });

  // Reset form when classData changes
  useEffect(() => {
    if (classData && open) {
      form.reset({
        name: classData.name,
        teacherId: classData.teacherId || "",
        roomNumber: classData.roomNumber || "",
        section: classData.section || "",
        academicYear: classData.academicYear || "",
      });

      // Fetch teachers for dropdown
      fetchTeachers();
    }
  }, [classData, open, form]);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/teachers");
      const data = await response.json();
      if (data.teachers) {
        setTeachers(data.teachers);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "Error",
        description: "Failed to load teachers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof classSchema>) => {
    if (!classData) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/classes/${classData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update class");
      }

      toast({
        title: "Success",
        description: "Class updated successfully",
      });

      onOpenChange(false);
      onClassUpdated();
    } catch (error) {
      console.error("Error updating class:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update class",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>
            Update the details for {classData?.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Class 9A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Teacher</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. R-101" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. A" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 2023-2024" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Main ClassesPage component
export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [classToEdit, setClassToEdit] = useState<Class | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/classes");
      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (classId: string) => {
    setSelectedClassId(classId);
    setIsDetailsOpen(true);
  };

  const handleEditClass = (classData: Class) => {
    setClassToEdit(classData);
    setIsEditDialogOpen(true);
  };

  const handleAssignStudents = (classData: Class) => {
    setSelectedClassId(classData.id);
    setIsDetailsOpen(true);

    // This will trigger the ViewDetailsSheet to open the ManageStudentsDialog
    // by setting manageStudentsOpen to true (after a short delay to ensure the sheet is open)
    setTimeout(() => {
      const event = new CustomEvent("openStudentAssignment", {
        detail: { classId: classData.id },
      });
      document.dispatchEvent(event);
    }, 100);
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;

    try {
      const response = await fetch(`/api/classes/${classToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete class");
      }

      toast({
        title: "Success",
        description: `Class ${classToDelete.name} deleted successfully`,
      });

      // Refresh the classes list
      fetchClasses();
      setIsDeleteDialogOpen(false);
      setClassToDelete(null);
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddClass = () => {
    setIsAddDialogOpen(true);
  };

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Classes</h2>
        <div className="flex items-center gap-2">
          <Button className="flex items-center gap-1" onClick={handleAddClass}>
            <Plus className="h-4 w-4" /> Add Class
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex flex-1 items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search classes..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-row gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Academic Year</DropdownMenuItem>
                    <DropdownMenuItem>Section</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Classes</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all" className="mt-4">
            <Card>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Classes Found</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {searchQuery
                      ? `No classes match "${searchQuery}". Try a different search term.`
                      : "There are no classes created yet. Get started by adding a new class."}
                  </p>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Class
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasses.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell
                            className="font-medium cursor-pointer hover:underline"
                            onClick={() => handleOpenDetails(cls.id)}
                          >
                            {cls.name}
                          </TableCell>
                          <TableCell>
                            {cls.teacherName || "Unassigned"}
                          </TableCell>
                          <TableCell>{cls.roomNumber || "N/A"}</TableCell>
                          <TableCell>{cls.studentCount}</TableCell>
                          <TableCell>{cls.section || "N/A"}</TableCell>
                          <TableCell>{cls.academicYear || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleOpenDetails(cls.id)}
                                >
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditClass(cls)}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleAssignStudents(cls)}
                                >
                                  <Users className="mr-2 h-4 w-4" />
                                  Assign Students
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setClassToDelete(cls);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>
          <TabsContent value="active">
            <Card>
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">
                  Active classes view is under development
                </p>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="archived">
            <Card>
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">
                  Archived classes view is under development
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Details Sheet */}
      <ViewDetailsSheet
        classId={selectedClassId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      {/* Edit Class Dialog */}
      <EditClassDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        classData={classToEdit}
        onClassUpdated={fetchClasses}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the class{" "}
              <span className="font-semibold">{classToDelete?.name}</span> and
              remove all associations with students and teachers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClass}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Class Dialog */}
      <AddClassDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onClassAdded={fetchClasses}
      />
    </div>
  );
}
