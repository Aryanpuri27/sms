"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";

export default function StudentAttendancePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">Track your attendance records</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily Record</TabsTrigger>
          <TabsTrigger value="subject">Subject-wise</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall Attendance
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
                <Progress value={95} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  5 days absent this term
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Present Days
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95</div>
                <p className="text-xs text-muted-foreground">
                  Out of 100 working days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Absent Days
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  3 medical, 2 personal
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Late Arrivals
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  All marked as excused
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance</CardTitle>
              <CardDescription>
                Your attendance record for the current academic year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    month: "April 2025",
                    percentage: 98,
                    present: 20,
                    total: 21,
                    status: "Excellent",
                  },
                  {
                    month: "March 2025",
                    percentage: 95,
                    present: 21,
                    total: 22,
                    status: "Good",
                  },
                  {
                    month: "February 2025",
                    percentage: 92,
                    present: 22,
                    total: 24,
                    status: "Good",
                  },
                  {
                    month: "January 2025",
                    percentage: 96,
                    present: 24,
                    total: 25,
                    status: "Excellent",
                  },
                  {
                    month: "December 2024",
                    percentage: 90,
                    present: 18,
                    total: 20,
                    status: "Good",
                  },
                  {
                    month: "November 2024",
                    percentage: 100,
                    present: 22,
                    total: 22,
                    status: "Excellent",
                  },
                ].map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{month.month}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {month.present}/{month.total} days
                        </span>
                        <Badge
                          variant={
                            month.percentage >= 95 ? "default" : "secondary"
                          }
                          className={
                            month.percentage >= 95
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {month.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={month.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>
                  View attendance for a specific date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Daily Attendance Record</CardTitle>
                <CardDescription>
                  {date
                    ? date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Select a date"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {date ? (
                  <div className="space-y-4">
                    <div className="flex items-center p-3 rounded-lg border bg-green-50">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 mr-3">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Overall Status</div>
                        <div className="text-sm text-muted-foreground">
                          Present
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Present
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Class Attendance</h3>
                      <div className="space-y-2">
                        {[
                          {
                            period: "1",
                            time: "8:00 - 8:45",
                            subject: "English",
                            status: "Present",
                            teacher: "Mrs. Gupta",
                          },
                          {
                            period: "2",
                            time: "8:50 - 9:35",
                            subject: "Mathematics",
                            status: "Present",
                            teacher: "Mrs. Sharma",
                          },
                          {
                            period: "3",
                            time: "9:40 - 10:25",
                            subject: "Physics",
                            status: "Present",
                            teacher: "Mr. Verma",
                          },
                          {
                            period: "4",
                            time: "10:40 - 11:25",
                            subject: "Chemistry",
                            status: "Present",
                            teacher: "Mr. Singh",
                          },
                          {
                            period: "5",
                            time: "11:30 - 12:15",
                            subject: "Computer Science",
                            status: "Present",
                            teacher: "Mrs. Patel",
                          },
                          {
                            period: "6",
                            time: "12:20 - 1:05",
                            subject: "Physical Education",
                            status: "Present",
                            teacher: "Mr. Kumar",
                          },
                        ].map((period, index) => (
                          <div
                            key={index}
                            className="flex items-center p-2 rounded-lg border"
                          >
                            <div className="w-12 text-center font-medium">
                              P{period.period}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground w-28">
                              <Clock className="h-3 w-3 mr-1" />
                              {period.time}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">
                                {period.subject}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {period.teacher}
                              </div>
                            </div>
                            <Badge
                              variant={
                                period.status === "Present"
                                  ? "outline"
                                  : "default"
                              }
                              className={
                                period.status === "Present"
                                  ? "text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {period.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <CalendarIcon className="h-10 w-10 mb-2" />
                    <p>Select a date to view attendance details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subject" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Attendance</CardTitle>
              <CardDescription>
                Your attendance record for each subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    subject: "Mathematics",
                    present: 45,
                    total: 48,
                    percentage: 94,
                    teacher: "Mrs. Sharma",
                  },
                  {
                    subject: "Physics",
                    present: 46,
                    total: 48,
                    percentage: 96,
                    teacher: "Mr. Verma",
                  },
                  {
                    subject: "Chemistry",
                    present: 44,
                    total: 48,
                    percentage: 92,
                    teacher: "Mr. Singh",
                  },
                  {
                    subject: "English",
                    present: 47,
                    total: 48,
                    percentage: 98,
                    teacher: "Mrs. Gupta",
                  },
                  {
                    subject: "Computer Science",
                    present: 48,
                    total: 48,
                    percentage: 100,
                    teacher: "Mrs. Patel",
                  },
                  {
                    subject: "Hindi",
                    present: 45,
                    total: 48,
                    percentage: 94,
                    teacher: "Mr. Kumar",
                  },
                  {
                    subject: "History",
                    present: 43,
                    total: 48,
                    percentage: 90,
                    teacher: "Mrs. Reddy",
                  },
                  {
                    subject: "Geography",
                    present: 42,
                    total: 48,
                    percentage: 88,
                    teacher: "Mr. Joshi",
                  },
                ].map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{subject.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          Teacher: {subject.teacher}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {subject.present}/{subject.total} classes
                        </span>
                        <Badge
                          variant={
                            subject.percentage >= 95
                              ? "default"
                              : subject.percentage >= 90
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            subject.percentage >= 95
                              ? "bg-green-100 text-green-800"
                              : subject.percentage >= 90
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {subject.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={subject.percentage}
                      className={`h-2 ${
                        subject.percentage >= 95
                          ? "bg-green-100"
                          : subject.percentage >= 90
                          ? "bg-amber-100"
                          : "bg-red-100"
                      }`}
                    />
                    {subject.percentage < 90 && (
                      <div className="flex items-center text-sm text-red-600 mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Attendance below required minimum (90%)
                      </div>
                    )}
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
