"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Users,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for our dashboard data
type DashboardData = {
  stats: {
    students: number;
    classesToday: number;
    nextClass: {
      id: string;
      time: string;
      class: string;
      subject: string;
      room: string;
    } | null;
    assignments: {
      total: number;
      pendingReview: number;
    };
    attendanceRate: string;
  };
  schedule: {
    id: string;
    time: string;
    class: string;
    subject: string;
    room: string;
    status: "Completed" | "In Progress" | "Next" | "Upcoming";
  }[];
  classes: {
    id: string;
    name: string;
    roomNumber: string;
    students: number;
  }[];
  recentActivities: {
    type: string;
    action: string;
    target: string;
    date: string;
    status?: string;
    score?: string;
    dueDate?: string;
  }[];
};

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      students: 0,
      classesToday: 0,
      nextClass: null,
      assignments: {
        total: 0,
        pendingReview: 0,
      },
      attendanceRate: "0",
    },
    schedule: [],
    classes: [],
    recentActivities: [],
  });
  const [currentDate, setCurrentDate] = useState("");

  const { data: session, status } = useSession();
  const router = useRouter();

  // Set up access control
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "TEACHER") {
        toast({
          title: "Access Denied",
          description: "Only teachers can access this dashboard",
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
        const response = await fetch("/api/teachers/dashboard");
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

  const getNextClassTime = (timeString: string | undefined) => {
    if (!timeString) return "soon";
    const [startTime] = timeString.split(" - ");
    const [hours, minutes] = startTime.split(":").map(Number);
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffMinutes = Math.floor(
      (classTime.getTime() - now.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 0) return "now";
    if (diffMinutes < 60) return `in ${diffMinutes} minutes`;
    return `at ${startTime}`;
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "Teacher"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            {currentDate}
          </Button>
          <Button
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            onClick={() => router.push("/teacher/attendance")}
          >
            <Clock className="h-4 w-4" />
            Take Attendance
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  My Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {dashboardData.stats.students}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across {dashboardData.classes.length} classes
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
                        ? `Next class in ${getNextClassTime(
                            dashboardData.stats.nextClass.time
                          )}`
                        : "No classes scheduled today"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Assignments
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {dashboardData.stats.assignments.total}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData.stats.assignments.pendingReview} pending
                      review
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Attendance Rate
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {dashboardData.stats.attendanceRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last 14 days average
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
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : dashboardData.schedule.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No classes scheduled for today
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
                          <div className="font-medium">
                            Class {schedule.class} • {schedule.subject}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Room {schedule.room}
                          </div>
                        </div>
                        <Badge
                          variant={
                            schedule.status === "Completed"
                              ? "outline"
                              : schedule.status === "In Progress"
                              ? "destructive"
                              : schedule.status === "Next"
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
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Your recent actions and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dashboardData.recentActivities.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No recent activities
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32`}
                          />
                          <AvatarFallback>
                            {activity.type === "attendance"
                              ? "AT"
                              : activity.type === "grade"
                              ? "GR"
                              : "AS"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            You {activity.action} for {activity.target}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(activity.date))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array(6)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-20 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : dashboardData.classes.length === 0 ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                No classes assigned to you
              </div>
            ) : (
              dashboardData.classes.map((cls) => (
                <Card key={cls.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Class {cls.name}</CardTitle>
                      <Badge>Teacher</Badge>
                    </div>
                    <CardDescription>Room {cls.roomNumber}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{cls.students} students</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/teacher/classes/${cls.id}`)
                        }
                      >
                        View Class
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                Your teaching schedule for the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="p-4 text-center">
                  Weekly schedule feature is currently under development.
                  <div className="mt-2">
                    <Button onClick={() => router.push("/teacher/timetable")}>
                      View Timetable
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {dashboardData?.stats.nextClass && (
        <Card>
          <CardHeader>
            <CardTitle>Next Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {dashboardData.stats.nextClass.class}
              </p>
              <p className="text-muted-foreground">
                {dashboardData.stats.nextClass.subject}
              </p>
              <p className="text-sm">
                {getNextClassTime(dashboardData.stats.nextClass.time)}
              </p>
              <p className="text-sm text-muted-foreground">
                Room: {dashboardData.stats.nextClass.room}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to format the next class time
function getNextClassTime(timeString: string): string {
  if (!timeString) return "soon";

  const time = timeString.split(" - ")[0];
  const [hourMin, period] = time.split(" ");
  const [hour, minute] = hourMin.split(":");

  const classTime = new Date();
  classTime.setHours(
    period === "PM" && parseInt(hour) !== 12
      ? parseInt(hour) + 12
      : period === "AM" && parseInt(hour) === 12
      ? 0
      : parseInt(hour),
    parseInt(minute),
    0
  );

  const now = new Date();
  const diffMs = classTime.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins <= 0) {
    return "currently in progress";
  } else if (diffMins < 60) {
    return `${diffMins} minutes`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours} hour${hours > 1 ? "s" : ""}${
      mins > 0 ? ` ${mins} min` : ""
    }`;
  }
}

// Helper function to format dates
function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 1) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  } else if (diffMins < 24 * 60) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (diffMins < 48 * 60) {
    return "yesterday";
  } else {
    return format(date, "MMM d, yyyy");
  }
}
