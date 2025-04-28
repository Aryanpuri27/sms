"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function StudentTimetablePage() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
        <p className="text-muted-foreground">View your weekly class schedule</p>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
              <CardDescription>
                Your class schedule for the week
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  <tbody>
                    {[
                      "8:00 - 8:45",
                      "8:50 - 9:35",
                      "9:40 - 10:25",
                      "10:40 - 11:25",
                      "11:30 - 12:15",
                      "12:20 - 1:05",
                    ].map((time, index) => (
                      <tr
                        key={time}
                        className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}
                      >
                        <td className="p-2 text-sm border-r">{time}</td>
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ].map((day) => {
                          const subjects = [
                            "Mathematics",
                            "English",
                            "Physics",
                            "Chemistry",
                            "Biology",
                            "Computer Science",
                            "Hindi",
                            "History",
                            "Geography",
                            "Physical Education",
                            "Break",
                          ];

                          const subject =
                            subjects[
                              Math.floor(Math.random() * subjects.length)
                            ];
                          const isBreak = subject === "Break";
                          const rooms = [
                            "101",
                            "102",
                            "103",
                            "Lab 1",
                            "Lab 2",
                            "Computer Lab",
                            "Playground",
                          ];
                          const room =
                            rooms[Math.floor(Math.random() * rooms.length)];

                          return (
                            <td
                              key={`${day}-${time}`}
                              className="p-2 text-sm border-r"
                            >
                              <div
                                className={`p-1 rounded ${
                                  isBreak ? "bg-slate-100" : "bg-blue-50"
                                }`}
                              >
                                {subject}
                                {!isBreak && (
                                  <div className="text-xs text-muted-foreground">
                                    {
                                      [
                                        "Mrs. Sharma",
                                        "Mr. Verma",
                                        "Mrs. Gupta",
                                        "Mr. Singh",
                                      ][Math.floor(Math.random() * 4)]
                                    }{" "}
                                    • Room {room}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                Your classes for today (Monday, April 22, 2025)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: "8:00 - 8:45",
                    subject: "English",
                    teacher: "Mrs. Gupta",
                    room: "101",
                    status: "Completed",
                  },
                  {
                    time: "8:50 - 9:35",
                    subject: "Mathematics",
                    teacher: "Mrs. Sharma",
                    room: "101",
                    status: "Completed",
                  },
                  {
                    time: "9:40 - 10:25",
                    subject: "Physics",
                    teacher: "Mr. Verma",
                    room: "Lab 1",
                    status: "Current",
                  },
                  {
                    time: "10:40 - 11:25",
                    subject: "Chemistry",
                    teacher: "Mr. Singh",
                    room: "Lab 2",
                    status: "Upcoming",
                  },
                  {
                    time: "11:30 - 12:15",
                    subject: "Computer Science",
                    teacher: "Mrs. Patel",
                    room: "Computer Lab",
                    status: "Upcoming",
                  },
                  {
                    time: "12:20 - 1:05",
                    subject: "Physical Education",
                    teacher: "Mr. Kumar",
                    room: "Playground",
                    status: "Upcoming",
                  },
                ].map((schedule, index) => (
                  <div
                    key={index}
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
                          : schedule.status === "Current"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {schedule.status}
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
