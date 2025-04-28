"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Filter,
  Grid3x3,
  MoreHorizontal,
  Search,
  Settings,
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define types for our API data
type Subject = {
  id: string;
  name: string;
  code: string | null;
};

type TimetableEntry = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
};

type ClassData = {
  id: string;
  name: string;
  section: string | null;
  academicYear: string | null;
  roomNumber: string | null;
  studentCount: number;
  subjects: Subject[];
  timetable: TimetableEntry[];
};

export default function TeacherClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("grid");
  const [sortBy, setSortBy] = useState<string>("name");
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassData[]>([]);

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

  // Fetch class data
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/teachers/classes");

        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }

        const data = await response.json();
        setClasses(data.classes || []);
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

    if (status === "authenticated" && session?.user?.role === "TEACHER") {
      fetchClasses();
    }
  }, [session, status]);

  // Filter and sort classes
  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.section &&
        cls.section.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cls.academicYear &&
        cls.academicYear.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedClasses = [...filteredClasses].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "students") {
      return b.studentCount - a.studentCount;
    } else if (sortBy === "subjects") {
      return b.subjects.length - a.subjects.length;
    }
    return 0;
  });

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

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
          <p className="text-muted-foreground">
            Manage and view your assigned classes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/teacher/timetable")}
            variant="outline"
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            View Timetable
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search classes..."
            className="pl-8 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ml-auto flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" /> Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Class Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("students")}>
                Student Count
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("subjects")}>
                Subject Count
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="hidden md:block"
          >
            <TabsList>
              <TabsTrigger value="grid">
                <Grid3x3 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path
                    d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1.5 7C1.22386 7 1 7.22386 1 7.5C1 7.77614 1.22386 8 1.5 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H1.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-24 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-9 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : activeTab === "grid" ? (
        sortedClasses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedClasses.map((cls) => (
              <Card key={cls.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Class {cls.name}</CardTitle>
                    <Badge variant="outline">{cls.section || "Main"}</Badge>
                  </div>
                  <CardDescription>
                    Room {cls.roomNumber || "N/A"} •{" "}
                    {cls.academicYear || "Current"} Academic Year
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{cls.studentCount} Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{cls.subjects.length} Subjects</span>
                    </div>
                  </div>

                  {cls.timetable.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Next Classes:</p>
                      {cls.timetable.slice(0, 2).map((entry) => (
                        <div
                          key={entry.id}
                          className="text-sm flex justify-between"
                        >
                          <span>{getDayName(entry.dayOfWeek)}</span>
                          <span className="text-muted-foreground">
                            {formatTime(entry.startTime)} -{" "}
                            {formatTime(entry.endTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No timetable entries
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/teacher/attendance?classId=${cls.id}`)
                          }
                        >
                          <Clock className="h-4 w-4 mr-2" /> Take Attendance
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/teacher/assignments?classId=${cls.id}`
                            )
                          }
                        >
                          <BookOpen className="h-4 w-4 mr-2" /> Assignments
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/teacher/timetable?classId=${cls.id}`)
                          }
                        >
                          <Calendar className="h-4 w-4 mr-2" /> View Timetable
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/teacher/classes/${cls.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No classes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "No classes match your search"
                : "You don't have any assigned classes"}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </div>
        )
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
            <CardDescription>
              {sortedClasses.length} classes found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedClasses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedClasses.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell>
                        <div className="font-medium">Class {cls.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {cls.section || "Main Section"}
                        </div>
                      </TableCell>
                      <TableCell>{cls.studentCount}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cls.subjects.slice(0, 3).map((subject) => (
                            <Badge key={subject.id} variant="outline">
                              {subject.name}
                            </Badge>
                          ))}
                          {cls.subjects.length > 3 && (
                            <Badge variant="outline">
                              +{cls.subjects.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{cls.roomNumber || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/teacher/attendance?classId=${cls.id}`
                              )
                            }
                          >
                            <Clock className="h-4 w-4 mr-1" /> Attendance
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(`/teacher/classes/${cls.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No classes match your search"
                    : "You don't have any assigned classes"}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
