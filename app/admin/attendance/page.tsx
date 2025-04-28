"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
  ChevronDown,
  Download,
  Filter,
  Search,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

// Type definitions
interface Student {
  id: string;
  rollNumber: string;
  name: string;
  image?: string | null;
}

interface AttendanceRecord {
  id: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks?: string | null;
  student: Student;
}

interface AttendanceSession {
  id: string;
  date: string;
  className: string;
  classId: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  createdAt: string;
}

interface Class {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
}

export default function AttendancePage() {
  const { data: session, status } = useSession();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState("");
  const [activeTab, setActiveTab] = useState("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [monthlySessions, setMonthlySessions] = useState<AttendanceSession[]>(
    []
  );
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [classTeacher, setClassTeacher] = useState("");
  const [totalStudentsInClass, setTotalStudentsInClass] = useState(0);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes");
        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }
        const data = await response.json();
        setClasses(data.classes);

        // Select first class as default if available
        if (data.classes.length > 0 && !selectedClass) {
          setSelectedClass(data.classes[0].id);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setError("Failed to load classes");
      }
    };

    fetchClasses();
  }, []);

  // Fetch students when class changes
  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/students?classId=${selectedClass}`);
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        setStudents(data.students);
        setTotalStudentsInClass(data.meta.total);

        // Find class teacher
        const classData = classes.find((c) => c.id === selectedClass);
        if (classData) {
          setClassTeacher(classData.teacherName);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to load students");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, classes]);

  // Fetch or initialize attendance data based on active tab
  useEffect(() => {
    if (!selectedClass) return;

    const fetchAttendanceData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "daily") {
          await fetchDailyAttendance();
        } else if (activeTab === "monthly") {
          await fetchMonthlyAttendance();
        } else if (activeTab === "student") {
          await fetchStudentWiseAttendance();
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} attendance:`, error);
        setError(`Failed to load ${activeTab} attendance data`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [activeTab, selectedClass, date]);

  // Fetch daily attendance
  const fetchDailyAttendance = async () => {
    // Format date for API
    const formattedDate = format(date, "yyyy-MM-dd");

    try {
      // First check if there's an existing session for this date and class
      const sessionResponse = await fetch(
        `/api/attendance/sessions?classId=${selectedClass}&startDate=${formattedDate}&endDate=${formattedDate}`
      );

      if (!sessionResponse.ok) {
        throw new Error("Failed to check for existing attendance session");
      }

      const sessionData = await sessionResponse.json();

      if (sessionData.sessions.length > 0) {
        // Session exists, get the attendance records
        const sessionId = sessionData.sessions[0].id;
        setCurrentSession(sessionId);

        const recordsResponse = await fetch(
          `/api/attendance/sessions/${sessionId}`
        );
        if (!recordsResponse.ok) {
          throw new Error("Failed to fetch attendance records");
        }

        const recordsData = await recordsResponse.json();
        setAttendanceRecords(recordsData.records);
      } else {
        // No session exists yet, prepare empty records for all students
        setCurrentSession(null);

        // Initialize empty attendance records for all students
        const emptyRecords = students.map((student) => ({
          id: "",
          status: "PRESENT" as const,
          student: {
            id: student.id,
            rollNumber: student.rollNumber,
            name: student.name,
            image: student.image,
          },
          remarks: "",
        }));

        setAttendanceRecords(emptyRecords);
      }
    } catch (error) {
      console.error("Error fetching daily attendance:", error);
      throw error;
    }
  };

  // Fetch monthly attendance
  const fetchMonthlyAttendance = async () => {
    // Get start and end date for the current month
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");

    try {
      const response = await fetch(
        `/api/attendance/sessions?classId=${selectedClass}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch monthly attendance data");
      }

      const data = await response.json();
      setMonthlySessions(data.sessions);
    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
      throw error;
    }
  };

  // Fetch student-wise attendance
  const fetchStudentWiseAttendance = async () => {
    // Get start and end date for the current month
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");

    try {
      // Fetch all sessions for the month
      const sessionsResponse = await fetch(
        `/api/attendance/sessions?classId=${selectedClass}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );

      if (!sessionsResponse.ok) {
        throw new Error("Failed to fetch attendance sessions");
      }

      const sessionsData = await sessionsResponse.json();

      // Prepare student summary data
      const studentSummary = await Promise.all(
        students.map(async (student) => {
          let presentDays = 0;
          let absentDays = 0;
          let lateDays = 0;
          let totalDays = 0;

          // For each session, fetch detailed records to count student status
          for (const session of sessionsData.sessions) {
            totalDays++;
            const recordsResponse = await fetch(
              `/api/attendance/sessions/${session.id}`
            );
            if (!recordsResponse.ok) continue;

            const recordsData = await recordsResponse.json();
            const studentRecord = recordsData.records.find(
              (record: any) => record.student.id === student.id
            );

            if (studentRecord) {
              if (studentRecord.status === "PRESENT") presentDays++;
              else if (studentRecord.status === "ABSENT") absentDays++;
              else if (studentRecord.status === "LATE") lateDays++;
            }
          }

          return {
            id: student.id,
            name: student.name,
            rollNo: student.rollNumber,
            presentDays,
            absentDays,
            lateDays,
            totalDays,
            attendancePercentage:
              totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
          };
        })
      );

      setStudentAttendance(studentSummary);
    } catch (error) {
      console.error("Error fetching student-wise attendance:", error);
      throw error;
    }
  };

  // Mock data for attendance
  const mockStudents = [
    { id: "STU001", name: "Aarav Sharma", rollNo: "1001", status: "Present" },
    { id: "STU002", name: "Priya Patel", rollNo: "1002", status: "Present" },
    { id: "STU003", name: "Vikram Singh", rollNo: "1003", status: "Absent" },
    { id: "STU004", name: "Ananya Gupta", rollNo: "1004", status: "Present" },
    { id: "STU005", name: "Rohan Verma", rollNo: "1005", status: "Late" },
    { id: "STU006", name: "Neha Reddy", rollNo: "1006", status: "Present" },
    { id: "STU007", name: "Arjun Kumar", rollNo: "1007", status: "Present" },
    { id: "STU008", name: "Ishita Joshi", rollNo: "1008", status: "Absent" },
    { id: "STU009", name: "Rahul Mehta", rollNo: "1009", status: "Present" },
    { id: "STU010", name: "Kavya Sharma", rollNo: "1010", status: "Present" },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock data for monthly attendance
  const monthlyData = [
    { date: "2025-04-01", present: 28, absent: 2, late: 2, total: 32 },
    { date: "2025-04-02", present: 30, absent: 1, late: 1, total: 32 },
    { date: "2025-04-03", present: 29, absent: 3, late: 0, total: 32 },
    { date: "2025-04-04", present: 31, absent: 1, late: 0, total: 32 },
    { date: "2025-04-05", present: 30, absent: 0, late: 2, total: 32 },
    { date: "2025-04-08", present: 28, absent: 2, late: 2, total: 32 },
    { date: "2025-04-09", present: 29, absent: 2, late: 1, total: 32 },
    { date: "2025-04-10", present: 30, absent: 1, late: 1, total: 32 },
    { date: "2025-04-11", present: 31, absent: 1, late: 0, total: 32 },
    { date: "2025-04-12", present: 29, absent: 2, late: 1, total: 32 },
    { date: "2025-04-15", present: 28, absent: 3, late: 1, total: 32 },
    { date: "2025-04-16", present: 30, absent: 1, late: 1, total: 32 },
    { date: "2025-04-17", present: 29, absent: 2, late: 1, total: 32 },
    { date: "2025-04-18", present: 31, absent: 0, late: 1, total: 32 },
    { date: "2025-04-19", present: 30, absent: 1, late: 1, total: 32 },
    { date: "2025-04-22", present: 29, absent: 2, late: 1, total: 32 },
  ];

  // Handler for status change in daily attendance
  const handleStatusChange = (
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  ) => {
    setAttendanceRecords(
      attendanceRecords.map((record) =>
        record.student.id === studentId ? { ...record, status } : record
      )
    );
  };

  // Handler for remarks change in daily attendance
  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceRecords(
      attendanceRecords.map((record) =>
        record.student.id === studentId ? { ...record, remarks } : record
      )
    );
  };

  // Handler for saving attendance
  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      toast({
        title: "Error",
        description: "Please select a class",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Format the data for the API
      const formattedDate = format(date, "yyyy-MM-dd");

      // If we already have a session, update it
      if (currentSession) {
        const response = await fetch(
          `/api/attendance/sessions/${currentSession}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              records: attendanceRecords.map((record) => ({
                id: record.id || undefined,
                studentId: record.student.id,
                status: record.status,
                remarks: record.remarks,
              })),
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update attendance");
        }

        toast({
          title: "Attendance Updated",
          description: `Attendance for Class ${
            classes.find((c) => c.id === selectedClass)?.name
          } on ${format(date, "PP")} has been updated.`,
        });
      } else {
        // Create new session
        const response = await fetch("/api/attendance/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            classId: selectedClass,
            date: formattedDate,
            attendances: attendanceRecords.map((record) => ({
              studentId: record.student.id,
              status: record.status,
              remarks: record.remarks,
            })),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save attendance");
        }

        const data = await response.json();
        setCurrentSession(data.sessionId);

        toast({
          title: "Attendance Saved",
          description: `Attendance for Class ${
            classes.find((c) => c.id === selectedClass)?.name
          } on ${format(date, "PP")} has been saved.`,
        });
      }

      // Refresh data
      fetchDailyAttendance();
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for marking all present
  const handleMarkAllPresent = () => {
    setAttendanceRecords(
      attendanceRecords.map((record) => ({
        ...record,
        status: "PRESENT",
      }))
    );
  };

  // Handler for marking all absent
  const handleMarkAllAbsent = () => {
    setAttendanceRecords(
      attendanceRecords.map((record) => ({
        ...record,
        status: "ABSENT",
      }))
    );
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Attendance Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage student attendance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            onClick={handleSaveAttendance}
            disabled={isLoading || activeTab !== "daily"}
          >
            {isLoading ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  Class {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedClass && (
          <>
            <div className="text-sm text-muted-foreground">
              Class Teacher:{" "}
              <span className="font-medium text-foreground">
                {classTeacher}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Total Students:{" "}
              <span className="font-medium text-foreground">
                {totalStudentsInClass}
              </span>
            </div>
          </>
        )}
      </div>

      <Tabs
        defaultValue="daily"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="student">Student-wise</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                Daily Attendance -{" "}
                {classes.find((c) => c.id === selectedClass)?.name ||
                  "Select Class"}
              </CardTitle>
              <CardDescription>
                Mark attendance for {format(date, "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search students..."
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Mark All <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleMarkAllPresent}>
                        Mark All Present
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleMarkAllAbsent}>
                        Mark All Absent
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <p>Loading attendance data...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-10">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Roll No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10">
                            {selectedClass
                              ? "No students found"
                              : "Please select a class"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendanceRecords
                          .filter((record) =>
                            filteredStudents.some(
                              (student) => student.id === record.student.id
                            )
                          )
                          .map((record) => {
                            const student = record.student;
                            return (
                              <TableRow
                                key={student.id}
                                className="hover:bg-muted/50"
                              >
                                <TableCell className="font-medium">
                                  {student.rollNumber}
                                </TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>
                                  <Select
                                    value={record.status}
                                    onValueChange={(value) =>
                                      handleStatusChange(
                                        student.id,
                                        value as
                                          | "PRESENT"
                                          | "ABSENT"
                                          | "LATE"
                                          | "EXCUSED"
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PRESENT">
                                        Present
                                      </SelectItem>
                                      <SelectItem value="ABSENT">
                                        Absent
                                      </SelectItem>
                                      <SelectItem value="LATE">Late</SelectItem>
                                      <SelectItem value="EXCUSED">
                                        Excused
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    placeholder="Add remarks (optional)"
                                    className="w-full"
                                    value={record.remarks || ""}
                                    onChange={(e) =>
                                      handleRemarksChange(
                                        student.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                Monthly Attendance Report -{" "}
                {classes.find((c) => c.id === selectedClass)?.name ||
                  "Select Class"}
              </CardTitle>
              <CardDescription>
                Attendance summary for {format(date, "MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <p>Loading monthly report...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-10">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : monthlySessions.length === 0 ? (
                <div className="flex justify-center items-center py-10">
                  <p>No attendance data available for this month.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Late</TableHead>
                        <TableHead>Attendance %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlySessions.map((session) => {
                        const attendancePercentage =
                          session.totalStudents > 0
                            ? (session.presentCount / session.totalStudents) *
                              100
                            : 0;

                        return (
                          <TableRow
                            key={session.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell>
                              {format(new Date(session.date), "MMM d, EEE")}
                            </TableCell>
                            <TableCell>{session.presentCount}</TableCell>
                            <TableCell>{session.absentCount}</TableCell>
                            <TableCell>{session.lateCount}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    attendancePercentage >= 95
                                      ? "default"
                                      : attendancePercentage >= 85
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {attendancePercentage.toFixed(1)}%
                                </Badge>
                              </div>
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

        <TabsContent value="student" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                Student-wise Attendance -{" "}
                {classes.find((c) => c.id === selectedClass)?.name ||
                  "Select Class"}
              </CardTitle>
              <CardDescription>
                Individual attendance records for {format(date, "MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search students..."
                      className="w-full pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <p>Loading student attendance data...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-10">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : studentAttendance.length === 0 ? (
                <div className="flex justify-center items-center py-10">
                  <p>No attendance data available for this month.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Roll No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Present Days</TableHead>
                        <TableHead>Absent Days</TableHead>
                        <TableHead>Late Days</TableHead>
                        <TableHead>Attendance %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentAttendance
                        .filter(
                          (student) =>
                            student.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            student.rollNo
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        )
                        .map((student) => (
                          <TableRow
                            key={student.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              {student.rollNo}
                            </TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.presentDays}</TableCell>
                            <TableCell>{student.absentDays}</TableCell>
                            <TableCell>{student.lateDays}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    student.attendancePercentage >= 95
                                      ? "default"
                                      : student.attendancePercentage >= 85
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {student.attendancePercentage.toFixed(1)}%
                                </Badge>
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
      </Tabs>
    </div>
  );
}
