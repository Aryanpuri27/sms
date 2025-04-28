"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  Clock,
  FileText,
  Loader2,
  MoreHorizontal,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

// Define types for our API data
type Student = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  rollNumber: string;
  gender: string | null;
  parentName: string | null;
  parentContact: string | null;
  recentGrades: {
    id: string;
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    subject: string;
    date: string;
  }[];
  recentAttendance: {
    id: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  }[];
};

type ClassDetailsData = {
  class: {
    id: string;
    name: string;
    section: string | null;
    academicYear: string | null;
    roomNumber: string | null;
  };
  students: Student[];
  subjects: {
    id: string;
    name: string;
    code: string | null;
  }[];
  timetable: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    subject: string;
  }[];
  assignments: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    status: string;
    subject: string;
    submissionCount: number;
  }[];
  attendanceSessions: {
    id: string;
    date: string;
    attendanceCount: number;
  }[];
  statistics: {
    attendance: {
      totalAttendances: number;
      totalPresent: number;
      totalAbsent: number;
      totalLate: number;
      presentPercentage: number;
      absentPercentage: number;
      latePercentage: number;
    };
  };
};

export default function ClassDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassDetailsData | null>(null);

  const { data: session, status } = useSession();

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

  // Fetch class details
  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teachers/classes/${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch class details");
        }

        const data = await response.json();
        setClassData(data);
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

    if (
      status === "authenticated" &&
      session?.user?.role === "TEACHER" &&
      params.id
    ) {
      fetchClassDetails();
    }
  }, [params.id, session, status]);

  // Get day name from number
  const getDayName = (day: number): string => {
    const days = [
      "",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days[day] || "";
  };

  // Format time for display
  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-24 mb-1" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-12 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex flex-col p-6 space-y-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex flex-col items-center justify-center h-[400px]">
          <div className="text-xl font-semibold mb-2">Class not found</div>
          <p className="text-muted-foreground mb-4">
            The class you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <Button onClick={() => router.push("/teacher/classes")}>
            View All Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Class {classData.class.name}{" "}
              {classData.class.section && `(${classData.class.section})`}
            </h1>
            <p className="text-muted-foreground">
              Room {classData.class.roomNumber || "N/A"} •{" "}
              {classData.class.academicYear || "Current"} Academic Year
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              router.push(`/teacher/attendance?classId=${classData.class.id}`)
            }
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            Take Attendance
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classData.students.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Enrolled in this class
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classData.subjects.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Taught in this class
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {classData.statistics.attendance.presentPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall present rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classData.assignments.length}
            </div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
                <CardDescription>Subjects taught in this class</CardDescription>
              </CardHeader>
              <CardContent>
                {classData.subjects.length > 0 ? (
                  <div className="grid gap-2">
                    {classData.subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="flex items-center p-2 border rounded-md hover:bg-muted/50"
                      >
                        <BookOpen className="h-4 w-4 text-muted-foreground mr-2" />
                        <div className="font-medium">{subject.name}</div>
                        {subject.code && (
                          <Badge variant="outline" className="ml-auto">
                            {subject.code}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No subjects assigned to this class
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Recent attendance sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {classData.attendanceSessions.length > 0 ? (
                  <div className="space-y-4">
                    {classData.attendanceSessions.slice(0, 5).map((session) => (
                      <div
                        key={session.id}
                        className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50"
                      >
                        <div>
                          <div className="font-medium">
                            {format(new Date(session.date), "MMMM d, yyyy")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.attendanceCount} students marked
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/teacher/attendance?classId=${
                                classData.class.id
                              }&date=${format(
                                new Date(session.date),
                                "yyyy-MM-dd"
                              )}`
                            )
                          }
                        >
                          View
                        </Button>
                      </div>
                    ))}
                    {classData.attendanceSessions.length > 5 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("attendance")}
                      >
                        View All Attendance Records
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No attendance records found
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Timetable</CardTitle>
                <CardDescription>Class schedule</CardDescription>
              </CardHeader>
              <CardContent>
                {classData.timetable.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Subject</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classData.timetable.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{getDayName(entry.dayOfWeek)}</TableCell>
                          <TableCell>
                            {formatTime(entry.startTime)} -{" "}
                            {formatTime(entry.endTime)}
                          </TableCell>
                          <TableCell>{entry.subject}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No timetable entries found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
              <CardDescription>
                {classData.students.length} students enrolled in this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classData.students.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Parent Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classData.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={
                                  student.image ||
                                  "/placeholder.svg?height=40&width=40"
                                }
                                alt={student.name}
                              />
                              <AvatarFallback>
                                {student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>
                          {student.gender || "Not specified"}
                        </TableCell>
                        <TableCell>
                          {student.parentContact ? (
                            <div>
                              <div>{student.parentName || "Parent"}</div>
                              <div className="text-xs text-muted-foreground">
                                {student.parentContact}
                              </div>
                            </div>
                          ) : (
                            "Not provided"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No students enrolled in this class
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Class Timetable</h3>
                <p className="text-muted-foreground">
                  Weekly schedule for Class {classData.class.name}
                </p>
              </div>
              {classData.timetable.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Subject</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classData.timetable
                        .sort((a, b) => {
                          // Sort by day first, then by start time
                          if (a.dayOfWeek !== b.dayOfWeek)
                            return a.dayOfWeek - b.dayOfWeek;
                          return (
                            new Date(a.startTime).getTime() -
                            new Date(b.startTime).getTime()
                          );
                        })
                        .map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{getDayName(entry.dayOfWeek)}</TableCell>
                            <TableCell>{formatTime(entry.startTime)}</TableCell>
                            <TableCell>{formatTime(entry.endTime)}</TableCell>
                            <TableCell>{entry.subject}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground/60" />
                  <p>No timetable entries found for this class</p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/teacher/timetable")}
                  >
                    Go to Timetable
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Class Assignments</CardTitle>
                <CardDescription>
                  Assignments for Class {classData.class.name}
                </CardDescription>
              </div>
              <Button
                onClick={() =>
                  router.push(
                    `/teacher/assignments/add?classId=${classData.class.id}`
                  )
                }
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </CardHeader>
            <CardContent>
              {classData.assignments.length > 0 ? (
                <div className="space-y-4">
                  {classData.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{assignment.title}</div>
                        <Badge>
                          {assignment.status.charAt(0) +
                            assignment.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {assignment.description || "No description provided"}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {assignment.subject}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              Due:{" "}
                              {format(
                                new Date(assignment.dueDate),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {assignment.submissionCount} submissions
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/teacher/assignments/${assignment.id}`)
                          }
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/60" />
                  <p>No assignments created for this class</p>
                  <Button
                    className="mt-4"
                    onClick={() =>
                      router.push(
                        `/teacher/assignments/add?classId=${classData.class.id}`
                      )
                    }
                  >
                    Create Assignment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  Attendance history for Class {classData.class.name}
                </CardDescription>
              </div>
              <Button
                onClick={() =>
                  router.push(
                    `/teacher/attendance?classId=${classData.class.id}`
                  )
                }
              >
                <Clock className="h-4 w-4 mr-2" />
                Take Attendance
              </Button>
            </CardHeader>
            <CardContent>
              {classData.attendanceSessions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Students Present</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classData.attendanceSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {format(new Date(session.date), "MMMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {session.attendanceCount} out of{" "}
                          {classData.students.length}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/teacher/attendance?classId=${
                                  classData.class.id
                                }&date=${format(
                                  new Date(session.date),
                                  "yyyy-MM-dd"
                                )}`
                              )
                            }
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground/60" />
                  <p>No attendance records found for this class</p>
                  <Button
                    className="mt-4"
                    onClick={() =>
                      router.push(
                        `/teacher/attendance?classId=${classData.class.id}`
                      )
                    }
                  >
                    Take Attendance
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
