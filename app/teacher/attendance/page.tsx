"use client";

import { useEffect, useState } from "react";
import {
  CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreHorizontal,
  Save,
  Search,
  X,
  Clock,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for our API data
type Student = {
  id: string;
  userId: string;
  rollNumber: string;
  name: string;
  email: string;
  image: string | null;
  attendance: {
    id: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  } | null;
};

type ClassInfo = {
  id: string;
  name: string;
  section: string | null;
  roomNumber: string | null;
};

type AttendanceData = {
  [studentId: string]: {
    status: "PRESENT" | "ABSENT" | "LATE" | null;
  };
};

export default function TeacherAttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

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

  // Fetch attendance data when class or date changes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/teachers/attendance");

        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }

        const data = await response.json();
        setClasses(data.classes || []);

        // Select the first class by default if none is selected
        if (data.classes && data.classes.length > 0 && !selectedClass) {
          setSelectedClass(data.classes[0].id);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast({
          title: "Error",
          description: "Failed to load class data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchAttendanceData = async () => {
      if (!selectedClass) return;

      try {
        setLoading(true);

        const formattedDate = format(date, "yyyy-MM-dd");
        const response = await fetch(
          `/api/teachers/attendance?classId=${selectedClass}&date=${formattedDate}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch attendance data");
        }

        const data = await response.json();

        // Set student data
        setStudents(data.students || []);

        // Initialize attendance data
        const initialAttendanceData: AttendanceData = {};
        data.students.forEach((student: Student) => {
          initialAttendanceData[student.id] = {
            status: student.attendance ? student.attendance.status : null,
          };
        });

        setAttendanceData(initialAttendanceData);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        toast({
          title: "Error",
          description: "Failed to load attendance data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "TEACHER") {
      if (!selectedClass) {
        fetchClasses();
      } else {
        fetchAttendanceData();
      }
    }
  }, [selectedClass, date, session, status]);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAttendanceChange = (
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE"
  ) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: { status },
    });
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);

      // Make API call to save attendance
      const response = await fetch("/api/teachers/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: selectedClass,
          date: format(date, "yyyy-MM-dd"),
          attendanceData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save attendance");
      }

      const data = await response.json();

      toast({
        title: "Attendance Saved",
        description: `Attendance for ${getClassName(selectedClass)} on ${format(
          date,
          "PPP"
        )} has been saved.`,
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get class name from ID
  const getClassName = (classId: string): string => {
    const classInfo = classes.find((c) => c.id === classId);
    return classInfo ? `Class ${classInfo.name}` : "Selected Class";
  };

  // Calculate attendance statistics
  const presentCount = Object.values(attendanceData).filter(
    (a) => a.status === "PRESENT"
  ).length;
  const absentCount = Object.values(attendanceData).filter(
    (a) => a.status === "ABSENT"
  ).length;
  const lateCount = Object.values(attendanceData).filter(
    (a) => a.status === "LATE"
  ).length;
  const notMarkedCount = Object.values(attendanceData).filter(
    (a) => a.status === null
  ).length;
  const totalStudents = students.length;
  const attendanceRate =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <div className="flex items-center gap-4">
          {loading && !selectedClass ? (
            <Skeleton className="h-10 w-[200px]" />
          ) : (
            <Select
              value={selectedClass}
              onValueChange={setSelectedClass}
              disabled={loading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.section ? `- ${cls.section}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                disabled={!selectedClass || loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={handleSaveAttendance}
            className="gap-2"
            disabled={
              loading || saving || !selectedClass || students.length === 0
            }
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Attendance
          </Button>
        </div>
      </div>

      {selectedClass ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-600">
                      {presentCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalStudents > 0
                        ? Math.round((presentCount / totalStudents) * 100)
                        : 0}
                      % of students
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-red-600">
                      {absentCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalStudents > 0
                        ? Math.round((absentCount / totalStudents) * 100)
                        : 0}
                      % of students
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Late</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-amber-600">
                      {lateCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalStudents > 0
                        ? Math.round((lateCount / totalStudents) * 100)
                        : 0}
                      % of students
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Not Marked
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-600">
                      {notMarkedCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalStudents > 0
                        ? Math.round((notMarkedCount / totalStudents) * 100)
                        : 0}
                      % of students
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="gap-2">
              <div className="flex items-center justify-between">
                <CardTitle>Students in {getClassName(selectedClass)}</CardTitle>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      className="pl-8 w-[200px] md:w-[300px]"
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
                      <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSearchTerm("")}>
                        All Students
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSearchTerm("present")}
                      >
                        Present
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSearchTerm("absent")}>
                        Absent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSearchTerm("late")}>
                        Late
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSearchTerm("not marked")}
                      >
                        Not Marked
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          const newAttendanceData = { ...attendanceData };
                          students.forEach((student) => {
                            newAttendanceData[student.id] = {
                              status: "PRESENT",
                            };
                          });
                          setAttendanceData(newAttendanceData);
                        }}
                      >
                        Mark All Present
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const newAttendanceData = { ...attendanceData };
                          students.forEach((student) => {
                            newAttendanceData[student.id] = {
                              status: "ABSENT",
                            };
                          });
                          setAttendanceData(newAttendanceData);
                        }}
                      >
                        Mark All Absent
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.print()}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Attendance
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardDescription>
                Attendance for {format(date, "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <Skeleton key={index} className="h-12 w-full" />
                    ))}
                </div>
              ) : students.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No students found in this class
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No students match your search
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Student</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const status = attendanceData[student.id]?.status;
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={
                                    student.image ||
                                    "/placeholder.svg?height=40&width=40"
                                  }
                                />
                                <AvatarFallback>
                                  {student.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {student.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {student.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell className="text-center">
                            <div
                              className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                status === "PRESENT"
                                  ? "bg-green-100 text-green-800"
                                  : status === "ABSENT"
                                  ? "bg-red-100 text-red-800"
                                  : status === "LATE"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-800"
                              )}
                            >
                              {status === "PRESENT"
                                ? "Present"
                                : status === "ABSENT"
                                ? "Absent"
                                : status === "LATE"
                                ? "Late"
                                : "Not Marked"}
                            </div>
                          </TableCell>
                          <TableCell className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant={
                                status === "PRESENT" ? "default" : "outline"
                              }
                              className={
                                status === "PRESENT"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : ""
                              }
                              onClick={() =>
                                handleAttendanceChange(student.id, "PRESENT")
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant={
                                status === "LATE" ? "default" : "outline"
                              }
                              className={
                                status === "LATE"
                                  ? "bg-amber-600 hover:bg-amber-700"
                                  : ""
                              }
                              onClick={() =>
                                handleAttendanceChange(student.id, "LATE")
                              }
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant={
                                status === "ABSENT" ? "default" : "outline"
                              }
                              className={
                                status === "ABSENT"
                                  ? "bg-red-600 hover:bg-red-700"
                                  : ""
                              }
                              onClick={() =>
                                handleAttendanceChange(student.id, "ABSENT")
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p>Loading classes...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="py-8">
                <p className="text-muted-foreground mb-4">
                  You don't have any assigned classes.
                </p>
                <Button onClick={() => router.push("/teacher/dashboard")}>
                  Return to Dashboard
                </Button>
              </div>
            ) : (
              <div className="py-8">
                <p className="text-muted-foreground mb-4">
                  Please select a class to manage attendance.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {classes.map((cls) => (
                    <Button
                      key={cls.id}
                      variant="outline"
                      onClick={() => setSelectedClass(cls.id)}
                    >
                      Class {cls.name} {cls.section && `(${cls.section})`}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
