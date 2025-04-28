"use client";

import { useEffect, useState } from "react";
import {
  CalendarIcon,
  ChevronDown,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

// Define types for our API data
type Assignment = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: string;
  subject: string;
  subjectId: string;
  classId: string;
  className: string;
  submissionCount: number;
  createdAt: string;
};

type Subject = {
  id: string;
  name: string;
  code: string | null;
};

type ClassInfo = {
  id: string;
  name: string;
  section: string | null;
  roomNumber: string | null;
};

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // New assignment state
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: new Date(),
    subjectId: "",
    classId: "",
  });

  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Set up access control
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "TEACHER") {
        toast({
          title: "Access Denied",
          description: "Only teachers can access this page",
          variant: "destructive",
        });
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Get class ID from URL if provided
  useEffect(() => {
    const classId = searchParams.get("classId");
    if (classId) {
      setSelectedClass(classId);
    }
  }, [searchParams]);

  // Fetch assignments data
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);

        let url = "/api/teachers/assignments";
        if (selectedClass) {
          url += `?classId=${selectedClass}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }

        const data = await response.json();
        setAssignments(data.assignments || []);
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast({
          title: "Error",
          description: "Failed to load assignments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "TEACHER") {
      fetchAssignments();
    }
  }, [session, status, selectedClass]);

  // Filter assignments based on search and tab
  const filteredAssignments = assignments.filter((assignment) => {
    // Filter by search term
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.className.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by tab
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "active" &&
        ["ACTIVE", "UPCOMING"].includes(assignment.status)) ||
      (selectedTab === "past" &&
        ["COMPLETED", "EXPIRED"].includes(assignment.status)) ||
      (selectedTab === "draft" && assignment.status === "DRAFT");

    // Filter by subject if selected
    const matchesSubject =
      !selectedSubject || assignment.subjectId === selectedSubject;

    return matchesSearch && matchesTab && matchesSubject;
  });

  // Sort assignments by due date (nearest first)
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "UPCOMING":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate days remaining until due date
  const getDaysRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Overdue";
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `${diffDays} days left`;
    }
  };

  // Handle creating a new assignment
  const handleCreateAssignment = async () => {
    if (
      !newAssignment.title ||
      !newAssignment.dueDate ||
      !newAssignment.subjectId ||
      !newAssignment.classId
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/teachers/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newAssignment,
          dueDate: newAssignment.dueDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create assignment");
      }

      // Refresh assignments list
      const data = await response.json();
      setAssignments([...assignments, data.assignment]);

      // Reset form and close dialog
      setNewAssignment({
        title: "",
        description: "",
        dueDate: new Date(),
        subjectId: "",
        classId: "",
      });
      setShowNewDialog(false);

      toast({
        title: "Assignment Created",
        description: "Your new assignment has been created successfully",
      });
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            Create and manage assignments for your classes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowNewDialog(true)}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          >
            <Plus className="h-4 w-4" />
            New Assignment
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              className="pl-8 w-full md:w-[280px] bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={selectedClass || "all"}
            onValueChange={(value) =>
              setSelectedClass(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  Class {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedSubject || "all"}
            onValueChange={(value) =>
              setSelectedSubject(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full md:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="w-full">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-72" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-9 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : sortedAssignments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No assignments found</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              {searchTerm || selectedSubject || selectedClass
                ? "Try changing your filters or search term"
                : "Create your first assignment to get started"}
            </p>
            <Button onClick={() => setShowNewDialog(true)}>
              Create Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAssignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="w-full hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      {assignment.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{assignment.subject}</Badge>
                      <Badge variant="outline">
                        Class {assignment.className}
                      </Badge>
                      <Badge
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          getStatusColor(assignment.status)
                        )}
                      >
                        {assignment.status}
                      </Badge>
                    </div>
                    {assignment.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col md:items-end gap-1">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Due: {format(new Date(assignment.dueDate), "PPP")}
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      {getDaysRemaining(assignment.dueDate)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{assignment.submissionCount} submissions</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      Created{" "}
                      {format(new Date(assignment.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/teacher/assignments/${assignment.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/teacher/assignments/${assignment.id}/edit`
                            )
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/teacher/assignments/${assignment.id}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" /> View Submissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={async () => {
                            if (
                              !confirm(
                                "Are you sure you want to delete this assignment?"
                              )
                            ) {
                              return;
                            }
                            try {
                              const response = await fetch(
                                `/api/teachers/assignments/${assignment.id}`,
                                {
                                  method: "DELETE",
                                }
                              );

                              if (!response.ok) {
                                throw new Error("Failed to delete assignment");
                              }

                              // Remove the assignment from the list
                              setAssignments(
                                assignments.filter(
                                  (a) => a.id !== assignment.id
                                )
                              );

                              toast({
                                title: "Success",
                                description: "Assignment deleted successfully",
                              });
                            } catch (error) {
                              console.error(
                                "Error deleting assignment:",
                                error
                              );
                              toast({
                                title: "Error",
                                description: "Failed to delete assignment",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create New Assignment Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment for your students. Fill in the details
              below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                placeholder="Assignment title"
                value={newAssignment.title}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Enter assignment details and instructions"
                value={newAssignment.description}
                onChange={(e) =>
                  setNewAssignment({
                    ...newAssignment,
                    description: e.target.value,
                  })
                }
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="dueDate" className="text-sm font-medium">
                  Due Date *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newAssignment.dueDate ? (
                        format(newAssignment.dueDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newAssignment.dueDate}
                      onSelect={(date) =>
                        date &&
                        setNewAssignment({ ...newAssignment, dueDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject *
                </label>
                <Select
                  value={newAssignment.subjectId}
                  onValueChange={(value) =>
                    setNewAssignment({ ...newAssignment, subjectId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="class" className="text-sm font-medium">
                Class *
              </label>
              <Select
                value={newAssignment.classId}
                onValueChange={(value) =>
                  setNewAssignment({ ...newAssignment, classId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      Class {cls.name} {cls.section && `(${cls.section})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAssignment}
              disabled={creating}
              className="gap-2"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
