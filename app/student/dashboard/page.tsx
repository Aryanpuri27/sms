"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  LineChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for our dashboard data
type DashboardData = {
  stats: {
    attendance: {
      rate: string;
      totalSessions: number;
      presentCount: number;
    };
    classesToday: number;
    nextClass: {
      id: string;
      time: string;
      subject: string;
      teacher: string;
      room: string;
    } | null;
    pendingAssignments: number;
    averageGrade: string;
  };
  schedule: {
    id: string;
    time: string;
    subject: string;
    teacher: string;
    room: string;
    status: "Completed" | "In Progress" | "Next" | "Upcoming";
  }[];
  assignments: {
    pending: {
      id: string;
      title: string;
      subject: string;
      dueDate: Date;
    }[];
    completed: {
      id: string;
      title: string;
      subject: string;
      submittedAt: Date;
      grade: string | null;
    }[];
  };
  grades: {
    id: string;
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    subject: string;
    date: Date;
  }[];
  events: {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
  }[];
};

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      attendance: {
        rate: "0",
        totalSessions: 0,
        presentCount: 0,
      },
      classesToday: 0,
      nextClass: null,
      pendingAssignments: 0,
      averageGrade: "N/A",
    },
    schedule: [],
    assignments: {
      pending: [],
      completed: [],
    },
    grades: [],
    events: [],
  });
  const [currentDate, setCurrentDate] = useState("");

  const { data: session, status } = useSession();
  const router = useRouter();

  // Set up access control
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "STUDENT") {
        toast({
          title: "Access Denied",
          description: "Only students can access this dashboard",
          variant: "destructive",
        });
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  useEffect(() => {
    // Set current date
    setCurrentDate(format(new Date(), "MMMM d, yyyy"));

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/students/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "Student"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            {currentDate}
          </Button>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {dashboardData.assignments.pending.length}
            </span>
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 w-[500px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Attendance
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {dashboardData.stats.attendance.rate}%
                    </div>
                    <Progress
                      value={parseFloat(dashboardData.stats.attendance.rate)}
                      className="h-2 mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {dashboardData.stats.attendance.totalSessions -
                        dashboardData.stats.attendance.presentCount}{" "}
                      days absent this term
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Classes Today
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {dashboardData.stats.classesToday}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData.stats.nextClass
                        ? `Next class: ${dashboardData.stats.nextClass.subject} (${dashboardData.stats.nextClass.time})`
                        : "No more classes today"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Assignments
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {dashboardData.stats.pendingAssignments}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData.assignments.pending.length > 0
                        ? `${dashboardData.assignments.pending.length} due this week`
                        : "No pending assignments"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Grade
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {dashboardData.stats.averageGrade}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on {dashboardData.grades.length} recent grades
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  Your classes and activities for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.schedule.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center p-3 rounded-lg border"
                      >
                        <div className="w-24 text-sm font-medium">
                          {schedule.time}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{schedule.subject}</div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.teacher} • Room {schedule.room}
                          </div>
                        </div>
                        <Badge
                          variant={
                            schedule.status === "Completed"
                              ? "outline"
                              : schedule.status === "In Progress"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {schedule.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3 transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  School events and important dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.events.map((event) => (
                      <div key={event.id} className="flex items-start gap-4">
                        <div className="rounded-md bg-purple-100 p-2 text-purple-600">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {event.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(event.startDate), "MMMM d, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                        <Badge className="ml-auto">
                          {format(new Date(event.startDate), "MMM d")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Academic Progress</CardTitle>
              <CardDescription>
                Your performance across subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.grades.map((grade) => (
                    <div key={grade.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{grade.subject}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {grade.percentage.toFixed(1)}%
                          </Badge>
                          <span className="text-sm font-medium">
                            {grade.score}/{grade.maxScore}
                          </span>
                        </div>
                      </div>
                      <Progress value={grade.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
              <CardDescription>
                Your class schedule for the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-2 text-left font-medium text-sm">
                          Time
                        </th>
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ].map((day) => (
                          <th
                            key={day}
                            className="p-2 text-left font-medium text-sm"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>{/* Add timetable data here */}</tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
              <CardDescription>
                Assignments that need to be completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.assignments.pending.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{assignment.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {assignment.subject} • Due:{" "}
                          {format(new Date(assignment.dueDate), "MMMM d, yyyy")}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        Pending
                      </Badge>
                      <Button size="sm" variant="outline" className="ml-2">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Assignments</CardTitle>
              <CardDescription>Assignments you have submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.assignments.completed.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{assignment.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {assignment.subject} • Submitted:{" "}
                          {format(
                            new Date(assignment.submittedAt),
                            "MMMM d, yyyy"
                          )}
                        </div>
                      </div>
                      <Badge className="ml-auto">
                        {assignment.grade || "Not Graded"}
                      </Badge>
                      <Button size="sm" variant="outline" className="ml-2">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>
                  Your grades across all subjects
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {dashboardData.stats.averageGrade}
                </div>
                <div className="text-sm text-muted-foreground">GPA</div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {dashboardData.grades.map((grade) => (
                    <div
                      key={grade.id}
                      className="flex items-center p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{grade.subject}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(grade.date), "MMMM d, yyyy")}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">
                            Score
                          </div>
                          <Badge variant="outline">
                            {grade.score}/{grade.maxScore}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">
                            Percentage
                          </div>
                          <Badge>{grade.percentage.toFixed(1)}%</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
