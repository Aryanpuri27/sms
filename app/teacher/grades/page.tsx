"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Download,
  Edit,
  FileText,
  Filter,
  Loader2,
  Plus,
  Search,
  X,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "@radix-ui/react-icons";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for our API data
type Grade = {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  studentImage: string | null;
  subjectId: string;
  subjectName: string;
  examId: string;
  examName: string;
  examDate: string;
  score: number;
  maxScore: number;
  percentage: number;
  remarks: string | null;
  className: string;
  classId: string;
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
};

type Exam = {
  id: string;
  name: string;
  subjectId: string;
  date: string;
  maxScore: number;
};

type Student = {
  id: string;
  name: string;
  rollNumber: string;
  image: string | null;
};

export default function TeacherGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // New grade state
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newGrade, setNewGrade] = useState({
    studentId: "",
    examId: "",
    score: 0,
    remarks: "",
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

  // Fetch grades data
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);

        let url = "/api/teachers/grades";
        const params = new URLSearchParams();

        if (selectedClass) {
          params.append("classId", selectedClass);
        }

        if (selectedSubject) {
          params.append("subjectId", selectedSubject);
        }

        if (selectedExam) {
          params.append("examId", selectedExam);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch grades");
        }

        const data = await response.json();
        setGrades(data.grades || []);
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
        setExams(data.exams || []);
        setStudents(data.students || []);
      } catch (error) {
        console.error("Error fetching grades:", error);
        toast({
          title: "Error",
          description: "Failed to load grades. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "TEACHER") {
      fetchGrades();
    }
  }, [session, status, selectedClass, selectedSubject, selectedExam]);

  // Filter grades based on search
  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.studentRollNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      grade.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.className.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      !selectedSubject || grade.subjectId === selectedSubject;
    const matchesClass = !selectedClass || grade.classId === selectedClass;

    return matchesSearch && matchesSubject && matchesClass;
  });

  // Get letter grade based on percentage
  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  // Handle creating a new grade
  const handleAddGrade = async () => {
    if (!newGrade.studentId || !newGrade.examId || newGrade.score < 0) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Get the selected exam to check max score
    const selectedExamDetails = exams.find(
      (exam) => exam.id === newGrade.examId
    );
    if (!selectedExamDetails) {
      toast({
        title: "Invalid Exam",
        description: "Please select a valid exam",
        variant: "destructive",
      });
      return;
    }

    if (newGrade.score > selectedExamDetails.maxScore) {
      toast({
        title: "Invalid Score",
        description: `Score cannot exceed the maximum score of ${selectedExamDetails.maxScore}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/teachers/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGrade),
      });

      if (!response.ok) {
        throw new Error("Failed to add grade");
      }

      // Refresh grades list
      const data = await response.json();
      setGrades([...grades, data.grade]);

      // Reset form and close dialog
      setNewGrade({
        studentId: "",
        examId: "",
        score: 0,
        remarks: "",
      });
      setShowNewDialog(false);

      toast({
        title: "Grade Added",
        description: "The grade has been added successfully",
      });
    } catch (error) {
      console.error("Error adding grade:", error);
      toast({
        title: "Error",
        description: "Failed to add grade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle bulk import of grades
  const handleBulkImport = () => {
    toast({
      title: "Coming Soon",
      description: "Bulk import feature is coming soon!",
    });
  };

  // Handle export of grades
  const handleExportGrades = () => {
    toast({
      title: "Coming Soon",
      description: "Export feature is coming soon!",
    });
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Grades</h1>
          <p className="text-muted-foreground">
            Manage and record student grades
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Grade
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowNewDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Single Grade
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBulkImport}>
                <FileText className="h-4 w-4 mr-2" />
                Bulk Import
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={handleExportGrades}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students or exams..."
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

          <Select
            value={selectedExam || "all"}
            onValueChange={(value) =>
              setSelectedExam(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Exams" />
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
        </div>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Student Grades</CardTitle>
            <CardDescription>Loading grades...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredGrades.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No grades found</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              {searchTerm || selectedSubject || selectedClass || selectedExam
                ? "Try changing your filters or search term"
                : "Start by adding grades for your students"}
            </p>
            <Button onClick={() => setShowNewDialog(true)}>
              Add First Grade
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Student Grades</CardTitle>
            <CardDescription>
              {filteredGrades.length} grade records found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={
                              grade.studentImage ||
                              "/placeholder.svg?height=40&width=40"
                            }
                          />
                          <AvatarFallback>
                            {grade.studentName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{grade.studentName}</div>
                          <div className="text-xs text-muted-foreground">
                            Roll #{grade.studentRollNumber}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{grade.className}</TableCell>
                    <TableCell>{grade.subjectName}</TableCell>
                    <TableCell>{grade.examName}</TableCell>
                    <TableCell className="text-center">
                      {grade.score} / {grade.maxScore}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          grade.percentage >= 90
                            ? "bg-green-100 text-green-800"
                            : grade.percentage >= 80
                            ? "bg-green-100 text-green-800"
                            : grade.percentage >= 70
                            ? "bg-blue-100 text-blue-800"
                            : grade.percentage >= 60
                            ? "bg-yellow-100 text-yellow-800"
                            : grade.percentage >= 40
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {getLetterGrade(grade.percentage)} ({grade.percentage}%)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(grade.examDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Grade Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Grade</DialogTitle>
            <DialogDescription>
              Record a new grade for a student. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="student" className="text-sm font-medium">
                Student *
              </label>
              <Select
                value={newGrade.studentId}
                onValueChange={(value) =>
                  setNewGrade({ ...newGrade, studentId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} (Roll #{student.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="exam" className="text-sm font-medium">
                Exam *
              </label>
              <Select
                value={newGrade.examId}
                onValueChange={(value) =>
                  setNewGrade({ ...newGrade, examId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} -{" "}
                      {subjects.find((s) => s.id === exam.subjectId)?.name ||
                        "Unknown"}{" "}
                      (Max: {exam.maxScore})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="score" className="text-sm font-medium">
                Score *
              </label>
              <Input
                id="score"
                type="number"
                min="0"
                max={
                  exams.find((e) => e.id === newGrade.examId)?.maxScore || 100
                }
                placeholder="Enter score"
                value={newGrade.score}
                onChange={(e) =>
                  setNewGrade({
                    ...newGrade,
                    score: parseInt(e.target.value) || 0,
                  })
                }
              />
              {newGrade.examId && (
                <p className="text-xs text-muted-foreground">
                  Maximum score:{" "}
                  {exams.find((e) => e.id === newGrade.examId)?.maxScore ||
                    "Unknown"}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="remarks" className="text-sm font-medium">
                Remarks
              </label>
              <Input
                id="remarks"
                placeholder="Optional remarks or feedback"
                value={newGrade.remarks}
                onChange={(e) =>
                  setNewGrade({ ...newGrade, remarks: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddGrade}
              disabled={saving}
              className="gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
