"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  Clock,
  GraduationCap,
  LayoutDashboard,
  LineChart,
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
import { toast } from "@/components/ui/use-toast";

// Define types for our dashboard data
type DashboardData = {
  stats: {
    students: { total: number; change: number };
    teachers: { total: number; change: number };
    classes: { total: number; change: number };
    attendance: { rate: string; change: string };
  };
  events: {
    id: string;
    title: string;
    startDate: string;
    category?: "IMPORTANT" | "REGULAR";
  }[];
  exams: {
    id: string;
    title: string;
    date: string;
  }[];
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      students: { total: 0, change: 0 },
      teachers: { total: 0, change: 0 },
      classes: { total: 0, change: 0 },
      attendance: { rate: "0", change: "0" },
    },
    events: [],
    exams: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Set current date in the format: April 22, 2025
    setCurrentDate(format(new Date(), "MMMM d, yyyy"));

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        console.log("Dashboard API Response:", data);
        console.log("Events data:", data.events);

        // If events is undefined or not an array, set it to empty array
        if (!data.events || !Array.isArray(data.events)) {
          data.events = [];
          console.error("Events data is missing or not an array");
        }

        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Principal Sharma
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            {currentDate}
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
            <Clock className="h-4 w-4" />
            Generate Reports
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
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "Loading..." : dashboardData.stats.students.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading
                    ? ""
                    : dashboardData.stats.students.change > 0
                    ? `+${dashboardData.stats.students.change} from last month`
                    : dashboardData.stats.students.change < 0
                    ? `${dashboardData.stats.students.change} from last month`
                    : "Same as last month"}
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Teachers
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "Loading..." : dashboardData.stats.teachers.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading
                    ? ""
                    : dashboardData.stats.teachers.change > 0
                    ? `+${dashboardData.stats.teachers.change} from last month`
                    : dashboardData.stats.teachers.change < 0
                    ? `${dashboardData.stats.teachers.change} from last month`
                    : "Same as last month"}
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classes</CardTitle>
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "Loading..." : dashboardData.stats.classes.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading
                    ? ""
                    : dashboardData.stats.classes.change > 0
                    ? `+${dashboardData.stats.classes.change} from last month`
                    : dashboardData.stats.classes.change < 0
                    ? `${dashboardData.stats.classes.change} from last month`
                    : "Same as last month"}
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Attendance Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading
                    ? "Loading..."
                    : `${dashboardData.stats.attendance.rate}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading
                    ? ""
                    : parseFloat(dashboardData.stats.attendance.change) > 0
                    ? `+${dashboardData.stats.attendance.change}% from last month`
                    : parseFloat(dashboardData.stats.attendance.change) < 0
                    ? `${dashboardData.stats.attendance.change}% from last month`
                    : "Same as last month"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>
                  Average scores across all classes for the current term
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] w-full bg-gradient-to-r from-purple-100 to-blue-50 rounded-md flex items-center justify-center">
                  <LineChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">
                    Performance Chart
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3 transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  Recent and upcoming school events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-muted-foreground">Loading events...</p>
                  </div>
                ) : dashboardData.events.length === 0 ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-muted-foreground">No upcoming events</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.events.map((event, index) => (
                      <div key={event.id} className="flex items-start gap-4">
                        <div
                          className={`rounded-md p-2 ${
                            index % 3 === 0
                              ? "bg-purple-100 text-purple-600"
                              : index % 3 === 1
                              ? "bg-blue-100 text-blue-600"
                              : "bg-indigo-100 text-indigo-600"
                          }`}
                        >
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {event.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(event.startDate), "MMMM d, yyyy")}
                          </p>
                        </div>
                        {event.category === "IMPORTANT" && (
                          <Badge className="ml-auto">Important</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Exams Section */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
              <CardDescription>
                Currently scheduled and upcoming examinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[100px]">
                  <p className="text-muted-foreground">Loading exams...</p>
                </div>
              ) : dashboardData.exams.length === 0 ? (
                <div className="flex items-center justify-center h-[100px]">
                  <p className="text-muted-foreground">No upcoming exams</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="border rounded-lg p-4 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm">{exam.title}</h3>
                        <Badge variant="outline">Exam</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(exam.date), "MMMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Detailed analytics about school performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-gradient-to-r from-purple-100 to-blue-50 rounded-md flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  Analytics Charts
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-100"
                  >
                    <Avatar>
                      <AvatarImage
                        src={`/placeholder.svg?height=40&width=40`}
                      />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {
                          [
                            "New student registration",
                            "Teacher absence report",
                            "System update",
                            "Fee payment reminder",
                            "Holiday announcement",
                          ][i - 1]
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {
                          [
                            "A new student has been registered in Class 10B",
                            "Mrs. Gupta has reported absence for tomorrow",
                            "System will be updated tonight at 2 AM",
                            "Reminder: Term fees due by April 30",
                            "School will be closed on May 1 for Labor Day",
                          ][i - 1]
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i} hour{i !== 1 ? "s" : ""} ago
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {["New", "Urgent", "Info", "Reminder", "Holiday"][i - 1]}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
