"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Filter, Plus, Search } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { FormEvent } from "react";

// Types for our API data
interface Exam {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  classes: ClassInfo[];
  schedulesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ClassInfo {
  id: string;
  name: string;
}

interface ExamSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  exam: {
    id: string;
    name: string;
    status: string;
  };
  subject: {
    id: string;
    name: string;
    code?: string;
  };
  class: {
    id: string;
    name: string;
    roomNumber?: string;
  };
  invigilators: {
    id: string;
    name: string;
    image?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface ExamResult {
  id: string;
  marks: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
  exam: {
    id: string;
    name: string;
  };
  student: {
    id: string;
    rollNumber: string;
    name: string;
    image?: string;
    class?: {
      id: string;
      name: string;
    };
  };
  subject: {
    id: string;
    name: string;
    code?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ExamsPage() {
  const { data: session, status } = useSession();
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [exams, setExams] = useState<Exam[]>([]);
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<
    { id: string; name: string; code?: string }[]
  >([]);

  // New exam form state
  const [newExam, setNewExam] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    classes: [] as string[],
  });

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch all necessary data
  useEffect(() => {
    // First fetch classes and subjects for dropdown menus
    fetchClasses();
    fetchSubjects();

    // Then fetch exam data based on active tab
    fetchExams();
  }, []);

  // Fetch exams when active tab changes or filters change
  useEffect(() => {
    fetchExams();
  }, [activeTab, selectedStatus, selectedClass, searchTerm]);

  // Fetch exam schedules when needed
  useEffect(() => {
    if (activeTab === "schedule") {
      fetchExamSchedules();
    }
  }, [activeTab, selectedExam]);

  // Fetch exam results when needed
  useEffect(() => {
    if (activeTab === "results") {
      fetchExamResults();
    }
  }, [activeTab, selectedExam, selectedClass]);

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }
      const data = await response.json();
      setClasses(data.classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setError("Failed to load classes");
    }
  };

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data = await response.json();
      setSubjects(data.subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to load subjects");
    }
  };

  // Fetch exams based on active tab and filters
  const fetchExams = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const queryParams = new URLSearchParams();

      // Add status filter based on active tab
      if (activeTab === "upcoming") {
        queryParams.append("status", "UPCOMING,SCHEDULED,IN_PROGRESS");
      } else if (activeTab === "completed") {
        queryParams.append("status", "COMPLETED");
      }

      // Add class filter if selected
      if (selectedClass && selectedClass !== "all") {
        queryParams.append("classId", selectedClass);
      }

      // Add custom status filter if selected (overrides tab-based status)
      if (selectedStatus) {
        queryParams.set("status", selectedStatus);
      }

      // Add search term if any
      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      // Make the API call
      const response = await fetch(`/api/exams?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch exams");
      }

      setExams(data.exams || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setError(error instanceof Error ? error.message : "Failed to load exams");
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load exams",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch exam schedules
  const fetchExamSchedules = async () => {
    setIsLoading(true);
    try {
      // Build query params
      const queryParams = new URLSearchParams();

      // Filter by exam if selected
      if (selectedExam && selectedExam !== "all") {
        queryParams.append("examId", selectedExam);
      }

      // Make the API call
      const response = await fetch(
        `/api/exams/schedules?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam schedules");
      }

      const data = await response.json();
      setExamSchedules(data.schedules);
      setError(null);
    } catch (error) {
      console.error("Error fetching exam schedules:", error);
      setError("Failed to load exam schedules");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch exam results
  const fetchExamResults = async () => {
    setIsLoading(true);
    try {
      // Build query params
      const queryParams = new URLSearchParams();

      // Filter by exam if selected
      if (selectedExam && selectedExam !== "all") {
        queryParams.append("examId", selectedExam);
      } else if (!selectedExam || selectedExam === "all") {
        // If no exam is selected or "all" is selected, return early
        setExamResults([]);
        setIsLoading(false);
        return;
      }

      // Filter by class if selected
      if (selectedClass && selectedClass !== "all") {
        queryParams.append("classId", selectedClass);
      }

      // Add search term if any
      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      // Make the API call
      const response = await fetch(
        `/api/exams/results?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam results");
      }

      const data = await response.json();
      setExamResults(data.results);
      setError(null);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      setError("Failed to load exam results");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter exams based on status and class
  const upcomingExams = exams.filter(
    (exam) =>
      (selectedStatus
        ? exam.status === selectedStatus
        : exam.status !== "COMPLETED") &&
      (selectedClass && selectedClass !== "all"
        ? exam.classes.some((cls) => cls.id === selectedClass)
        : true) &&
      (searchTerm
        ? exam.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );

  const completedExams = exams.filter(
    (exam) =>
      exam.status === "COMPLETED" &&
      (selectedClass && selectedClass !== "all"
        ? exam.classes.some((cls) => cls.id === selectedClass)
        : true) &&
      (searchTerm
        ? exam.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );

  // Group schedules by date
  const groupedSchedules = examSchedules.reduce((acc, schedule) => {
    const date = new Date(schedule.startTime).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, ExamSchedule[]>);

  // Handle creating a new exam
  const handleCreateExam = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newExam.name) {
      toast({
        title: "Error",
        description: "Exam name is required",
        variant: "destructive",
      });
      return;
    }

    if (!newExam.startDate || !newExam.endDate) {
      toast({
        title: "Error",
        description: "Start and end dates are required",
        variant: "destructive",
      });
      return;
    }

    const start = new Date(newExam.startDate);
    const end = new Date(newExam.endDate);

    if (start > end) {
      toast({
        title: "Error",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    if (newExam.classes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one class",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExam),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create exam");
      }

      // Add the new exam to the state
      fetchExams();

      toast({
        title: "Success",
        description: "Exam created successfully",
      });

      setCreateDialogOpen(false);

      // Reset form
      setNewExam({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        classes: [],
      });
    } catch (error) {
      console.error("Error creating exam:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the exam",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleClassSelection = (classId: string) => {
    setNewExam((prev) => {
      const isSelected = prev.classes.includes(classId);
      if (isSelected) {
        return {
          ...prev,
          classes: prev.classes.filter((id) => id !== classId),
        };
      } else {
        return {
          ...prev,
          classes: [...prev.classes, classId],
        };
      }
    });
  };

  // Helper function to format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
      return format(start, "MMM d, yyyy");
    } else {
      return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
    }
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Examination Management
          </h1>
          <p className="text-muted-foreground">
            Schedule and manage school examinations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                <Plus className="h-4 w-4" />
                Create New Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Examination</DialogTitle>
                <DialogDescription>
                  Enter the details for the new exam. All fields marked with *
                  are required.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateExam}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name*
                    </Label>
                    <Input
                      id="name"
                      value={newExam.name}
                      onChange={(e) =>
                        setNewExam({ ...newExam, name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newExam.description}
                      onChange={(e) =>
                        setNewExam({ ...newExam, description: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Start Date*</Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${
                              !newExam.startDate && "text-muted-foreground"
                            }`}
                          >
                            {newExam.startDate ? (
                              format(new Date(newExam.startDate), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={new Date(newExam.startDate)}
                            onSelect={(date) =>
                              setNewExam({
                                ...newExam,
                                startDate: date?.toISOString() || "",
                              })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">End Date*</Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${
                              !newExam.endDate && "text-muted-foreground"
                            }`}
                          >
                            {newExam.endDate ? (
                              format(new Date(newExam.endDate), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={new Date(newExam.endDate)}
                            onSelect={(date) =>
                              setNewExam({
                                ...newExam,
                                endDate: date?.toISOString() || "",
                              })
                            }
                            initialFocus
                            disabled={(date) =>
                              new Date(newExam.startDate) > date
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Classes*</Label>
                    <div className="col-span-3">
                      <Select
                        onValueChange={(value) => {
                          if (!newExam.classes.includes(value)) {
                            setNewExam({
                              ...newExam,
                              classes: [...newExam.classes, value],
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select classes" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              Class {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {newExam.classes.map((classId) => {
                          const cls = classes.find((c) => c.id === classId);
                          return (
                            <Badge
                              key={classId}
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              Class {cls?.name}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleClassSelection(classId);
                                }}
                                className="text-xs"
                              >
                                ×
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Exam"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs
        defaultValue="upcoming"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
          <TabsTrigger value="completed">Completed Exams</TabsTrigger>
          <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Upcoming Examinations</CardTitle>
              <CardDescription>
                View and manage upcoming and scheduled exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search exams..."
                      className="w-full pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setSelectedStatus("UPCOMING")}
                      >
                        Upcoming
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setSelectedStatus("SCHEDULED")}
                      >
                        Scheduled
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setSelectedStatus("IN_PROGRESS")}
                      >
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setSelectedStatus("")}>
                        All
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by class" />
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
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading exams...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center py-8 text-red-500">
                  <p>{error}</p>
                </div>
              ) : upcomingExams.length === 0 ? (
                <div className="flex justify-center py-8 text-muted-foreground">
                  <p>No upcoming exams found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Exam Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Classes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingExams.map((exam) => (
                        <TableRow key={exam.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {exam.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>{exam.name}</TableCell>
                          <TableCell>
                            {formatDateRange(exam.startDate, exam.endDate)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {exam.classes.map((cls) => (
                                <Badge
                                  key={cls.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {cls.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                exam.status === "UPCOMING"
                                  ? "default"
                                  : exam.status === "SCHEDULED"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {exam.status.charAt(0) +
                                exam.status
                                  .slice(1)
                                  .toLowerCase()
                                  .replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Open edit dialog (to be implemented)
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedExam(exam.id);
                                  setActiveTab("schedule");
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Completed Examinations</CardTitle>
              <CardDescription>View past examination records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search exams..."
                      className="w-full pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by class" />
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
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading exams...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center py-8 text-red-500">
                  <p>{error}</p>
                </div>
              ) : completedExams.length === 0 ? (
                <div className="flex justify-center py-8 text-muted-foreground">
                  <p>No completed exams found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Exam Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Classes</TableHead>
                        <TableHead>Results</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedExams.map((exam) => (
                        <TableRow key={exam.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {exam.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>{exam.name}</TableCell>
                          <TableCell>
                            {formatDateRange(exam.startDate, exam.endDate)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {exam.classes.map((cls) => (
                                <Badge
                                  key={cls.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {cls.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Published</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedExam(exam.id);
                                  setActiveTab("results");
                                }}
                              >
                                View Results
                              </Button>
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Examination Schedule</CardTitle>
              <CardDescription>
                {selectedExam
                  ? `Schedule for ${
                      exams.find((e) => e.id === selectedExam)?.name ||
                      "Selected Exam"
                    }`
                  : "All exam schedules"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Open create schedule dialog (to be implemented)
                  }}
                >
                  Add Schedule
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading exam schedule...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center py-8 text-red-500">
                  <p>{error}</p>
                </div>
              ) : Object.keys(groupedSchedules).length === 0 ? (
                <div className="flex justify-center py-8 text-muted-foreground">
                  <p>No exam schedules found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedSchedules).map(
                    ([dateString, daySchedules]) => (
                      <div key={dateString} className="space-y-2">
                        <h3 className="text-lg font-semibold">
                          {format(new Date(dateString), "EEEE, MMMM d, yyyy")}
                        </h3>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Classes</TableHead>
                                <TableHead>Invigilators</TableHead>
                                <TableHead>Rooms</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {daySchedules.map((schedule) => (
                                <TableRow
                                  key={schedule.id}
                                  className="hover:bg-muted/50"
                                >
                                  <TableCell>
                                    {format(
                                      new Date(schedule.startTime),
                                      "h:mm a"
                                    )}{" "}
                                    -
                                    {format(
                                      new Date(schedule.endTime),
                                      "h:mm a"
                                    )}
                                  </TableCell>
                                  <TableCell>{schedule.subject.name}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {schedule.class.name}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {schedule.invigilators.length > 0
                                      ? schedule.invigilators
                                          .map((inv) => inv.name)
                                          .join(", ")
                                      : "No invigilators assigned"}
                                  </TableCell>
                                  <TableCell>
                                    {schedule.location ||
                                      schedule.class.roomNumber ||
                                      "Not specified"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Examination Results</CardTitle>
              <CardDescription>
                View and publish examination results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exams</SelectItem>
                      {exams
                        .filter((exam) => exam.status === "COMPLETED")
                        .map((exam) => (
                          <SelectItem key={exam.id} value={exam.id}>
                            {exam.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select class" />
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
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      // Open upload results dialog (to be implemented)
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    Upload Results
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading exam results...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center py-8 text-red-500">
                  <p>{error}</p>
                </div>
              ) : !selectedExam || selectedExam === "all" ? (
                <div className="flex justify-center py-8 text-muted-foreground">
                  <p>Please select an exam to view results</p>
                </div>
              ) : examResults.length === 0 ? (
                <div className="flex justify-center py-8 text-muted-foreground">
                  <p>No results found for the selected criteria</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Roll No.</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Percentile</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examResults.map((result) => {
                        // Calculate percentile based on marks/maxMarks
                        const percentile =
                          (result.marks / result.maxMarks) * 100;

                        return (
                          <TableRow
                            key={result.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              {result.student.rollNumber}
                            </TableCell>
                            <TableCell>{result.student.name}</TableCell>
                            <TableCell>
                              {result.marks}/{result.maxMarks}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  percentile >= 90
                                    ? "default"
                                    : percentile >= 75
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {result.grade ||
                                  (percentile >= 90
                                    ? "A+"
                                    : percentile >= 80
                                    ? "A"
                                    : percentile >= 70
                                    ? "B+"
                                    : percentile >= 60
                                    ? "B"
                                    : percentile >= 50
                                    ? "C"
                                    : percentile >= 40
                                    ? "D"
                                    : "F")}
                              </Badge>
                            </TableCell>
                            <TableCell>{percentile.toFixed(1)}%</TableCell>
                            <TableCell>
                              {result.remarks ||
                                (percentile >= 80
                                  ? "Excellent performance"
                                  : percentile >= 60
                                  ? "Good performance"
                                  : "Needs improvement")}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
