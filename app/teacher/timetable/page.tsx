"use client";

import { useState } from "react";
import {
  CalendarIcon,
  Download,
  Filter,
  MoreHorizontal,
  PlusCircle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

export default function TeacherTimetablePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day: "Monday",
    startTime: "08:00",
    endTime: "08:45",
    class: "10A",
    subject: "Mathematics",
    room: "101",
  });

  // Days of the week
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Time slots
  const timeSlots = [
    "08:00 - 08:45",
    "08:50 - 09:35",
    "09:40 - 10:25",
    "10:40 - 11:25",
    "11:30 - 12:15",
    "12:20 - 13:05",
  ];

  // Mock data for timetable
  const [timetable, setTimetable] = useState([
    {
      id: "TT001",
      day: "Monday",
      timeSlot: "08:00 - 08:45",
      class: "10A",
      subject: "Mathematics",
      room: "101",
    },
    {
      id: "TT002",
      day: "Monday",
      timeSlot: "09:40 - 10:25",
      class: "11B",
      subject: "Mathematics",
      room: "203",
    },
    {
      id: "TT003",
      day: "Tuesday",
      timeSlot: "10:40 - 11:25",
      class: "12A",
      subject: "Mathematics",
      room: "301",
    },
    {
      id: "TT004",
      day: "Wednesday",
      timeSlot: "08:00 - 08:45",
      class: "10B",
      subject: "Mathematics",
      room: "102",
    },
    {
      id: "TT005",
      day: "Wednesday",
      timeSlot: "11:30 - 12:15",
      class: "12B",
      subject: "Mathematics",
      room: "302",
    },
    {
      id: "TT006",
      day: "Thursday",
      timeSlot: "09:40 - 10:25",
      class: "10A",
      subject: "Mathematics",
      room: "101",
    },
    {
      id: "TT007",
      day: "Friday",
      timeSlot: "12:20 - 13:05",
      class: "11B",
      subject: "Mathematics",
      room: "203",
    },
  ]);

  const handleAddSchedule = () => {
    const id = `TT${String(timetable.length + 1).padStart(3, "0")}`;
    const timeSlot = `${newSchedule.startTime} - ${newSchedule.endTime}`;
    const newScheduleWithId = {
      ...newSchedule,
      id,
      timeSlot,
    };
    setTimetable([...timetable, newScheduleWithId]);
    setNewSchedule({
      day: "Monday",
      startTime: "08:00",
      endTime: "08:45",
      class: "10A",
      subject: "Mathematics",
      room: "101",
    });
    setOpenAddDialog(false);
    toast({
      title: "Schedule Added",
      description: `New class scheduled for ${newSchedule.day} at ${timeSlot}.`,
    });
  };

  // Function to get class for a specific day and time slot
  const getClassForSlot = (day: string, timeSlot: string) => {
    const scheduleItem = timetable.find(
      (item) => item.day === day && item.timeSlot === timeSlot
    );
    return scheduleItem;
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted-foreground">
            View and manage your teaching schedule
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
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                <PlusCircle className="h-4 w-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Schedule</DialogTitle>
                <DialogDescription>
                  Add a new class to your teaching schedule.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="day" className="text-right">
                    Day
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, day: value })
                    }
                    defaultValue={newSchedule.day}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        startTime: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endTime" className="text-right">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        endTime: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="class" className="text-right">
                    Class
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, class: value })
                    }
                    defaultValue={newSchedule.class}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10A">Class 10A</SelectItem>
                      <SelectItem value="10B">Class 10B</SelectItem>
                      <SelectItem value="11B">Class 11B</SelectItem>
                      <SelectItem value="12A">Class 12A</SelectItem>
                      <SelectItem value="12B">Class 12B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={newSchedule.subject}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        subject: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="room" className="text-right">
                    Room
                  </Label>
                  <Input
                    id="room"
                    value={newSchedule.room}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, room: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddSchedule}>Add Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Your teaching schedule for the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-left font-medium text-sm">Time</th>
                    {days.map((day) => (
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
                  {timeSlots.map((timeSlot, index) => (
                    <tr
                      key={timeSlot}
                      className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}
                    >
                      <td className="p-2 text-sm border-r">{timeSlot}</td>
                      {days.map((day) => {
                        const classDetails = getClassForSlot(day, timeSlot);

                        return (
                          <td
                            key={`${day}-${timeSlot}`}
                            className="p-2 text-sm border-r"
                          >
                            {classDetails ? (
                              <div className="p-1 rounded bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors">
                                <div>
                                  Class {classDetails.class} •{" "}
                                  {classDetails.subject}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Room {classDetails.room}
                                </div>
                              </div>
                            ) : (
                              <div className="p-1 rounded bg-slate-50">
                                Free Period
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Scheduled Classes</CardTitle>
          <CardDescription>
            View and manage your scheduled classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search schedule..."
                  className="w-full pl-8"
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
                  <DropdownMenuItem>Day</DropdownMenuItem>
                  <DropdownMenuItem>Class</DropdownMenuItem>
                  <DropdownMenuItem>Time</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {days.map((day) => {
              const daySchedule = timetable.filter((item) => item.day === day);
              if (daySchedule.length === 0) return null;

              return (
                <div key={day} className="space-y-2">
                  <h3 className="font-medium">{day}</h3>
                  <div className="space-y-2">
                    {daySchedule
                      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                      .map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center p-3 rounded-lg border"
                        >
                          <div className="w-32 text-sm font-medium">
                            {schedule.timeSlot}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              Class {schedule.class} • {schedule.subject}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Room {schedule.room}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit Schedule</DropdownMenuItem>
                              <DropdownMenuItem>Cancel Class</DropdownMenuItem>
                              <DropdownMenuItem>Reschedule</DropdownMenuItem>
                              <DropdownMenuItem>
                                View Class Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
