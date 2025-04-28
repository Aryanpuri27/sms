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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, FileText, Megaphone, School, User } from "lucide-react";

export default function StudentAnnouncementsPage() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openAnnouncementDetails = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">
          Stay updated with school announcements
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="school">School</TabsTrigger>
          <TabsTrigger value="class">Class</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>
                All announcements from school and classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    title: "Annual Sports Day",
                    date: "April 20, 2025",
                    category: "School",
                    priority: "High",
                    content:
                      "The Annual Sports Day will be held on April 25, 2025. All students are required to participate in at least one event. Registration for events will begin on April 22, 2025.",
                    author: "Principal Sharma",
                    icon: <School className="h-4 w-4" />,
                    color: "bg-purple-100 text-purple-600",
                  },
                  {
                    id: 2,
                    title: "Mathematics Quiz Competition",
                    date: "April 19, 2025",
                    category: "Class",
                    priority: "Medium",
                    content:
                      "The inter-class Mathematics Quiz Competition will be held on April 24, 2025. Each class should select 3 representatives. Please submit the names to your class teacher by April 22, 2025.",
                    author: "Mrs. Sharma (Mathematics)",
                    icon: <FileText className="h-4 w-4" />,
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    id: 3,
                    title: "Final Exam Schedule",
                    date: "April 18, 2025",
                    category: "Exams",
                    priority: "High",
                    content:
                      "The final examination schedule for the academic year 2024-2025 has been released. The exams will begin on May 15, 2025. Please check the detailed schedule on the school website.",
                    author: "Examination Committee",
                    icon: <FileText className="h-4 w-4" />,
                    color: "bg-red-100 text-red-600",
                  },
                  {
                    id: 4,
                    title: "Science Exhibition",
                    date: "April 17, 2025",
                    category: "School",
                    priority: "Medium",
                    content:
                      "The annual Science Exhibition will be held on April 30, 2025. Students interested in showcasing their science projects should register with their science teachers by April 25, 2025.",
                    author: "Science Department",
                    icon: <School className="h-4 w-4" />,
                    color: "bg-indigo-100 text-indigo-600",
                  },
                  {
                    id: 5,
                    title: "Parent-Teacher Meeting",
                    date: "April 15, 2025",
                    category: "School",
                    priority: "High",
                    content:
                      "The Parent-Teacher Meeting for Class 10 will be held on May 5, 2025, from 9:00 AM to 1:00 PM. All parents are requested to attend to discuss their child's academic progress.",
                    author: "Principal Sharma",
                    icon: <User className="h-4 w-4" />,
                    color: "bg-green-100 text-green-600",
                  },
                  {
                    id: 6,
                    title: "Holiday Notice",
                    date: "April 14, 2025",
                    category: "School",
                    priority: "Low",
                    content:
                      "The school will remain closed on April 26, 2025, on account of a local festival. Regular classes will resume on April 27, 2025.",
                    author: "Administrative Office",
                    icon: <Calendar className="h-4 w-4" />,
                    color: "bg-amber-100 text-amber-600",
                  },
                ].map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-start gap-4 p-3 rounded-lg border"
                  >
                    <div className={`rounded-md ${announcement.color} p-2`}>
                      {announcement.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{announcement.title}</p>
                        <Badge
                          variant={
                            announcement.priority === "High"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {announcement.category} • {announcement.date}
                      </p>
                      <p className="text-sm line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 shrink-0"
                      onClick={() => openAnnouncementDetails(announcement)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="school" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Announcements</CardTitle>
              <CardDescription>
                General announcements for the entire school
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    title: "Annual Sports Day",
                    date: "April 20, 2025",
                    category: "School",
                    priority: "High",
                    content:
                      "The Annual Sports Day will be held on April 25, 2025. All students are required to participate in at least one event. Registration for events will begin on April 22, 2025.",
                    author: "Principal Sharma",
                    icon: <School className="h-4 w-4" />,
                    color: "bg-purple-100 text-purple-600",
                  },
                  {
                    id: 4,
                    title: "Science Exhibition",
                    date: "April 17, 2025",
                    category: "School",
                    priority: "Medium",
                    content:
                      "The annual Science Exhibition will be held on April 30, 2025. Students interested in showcasing their science projects should register with their science teachers by April 25, 2025.",
                    author: "Science Department",
                    icon: <School className="h-4 w-4" />,
                    color: "bg-indigo-100 text-indigo-600",
                  },
                  {
                    id: 5,
                    title: "Parent-Teacher Meeting",
                    date: "April 15, 2025",
                    category: "School",
                    priority: "High",
                    content:
                      "The Parent-Teacher Meeting for Class 10 will be held on May 5, 2025, from 9:00 AM to 1:00 PM. All parents are requested to attend to discuss their child's academic progress.",
                    author: "Principal Sharma",
                    icon: <User className="h-4 w-4" />,
                    color: "bg-green-100 text-green-600",
                  },
                  {
                    id: 6,
                    title: "Holiday Notice",
                    date: "April 14, 2025",
                    category: "School",
                    priority: "Low",
                    content:
                      "The school will remain closed on April 26, 2025, on account of a local festival. Regular classes will resume on April 27, 2025.",
                    author: "Administrative Office",
                    icon: <Calendar className="h-4 w-4" />,
                    color: "bg-amber-100 text-amber-600",
                  },
                ].map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-start gap-4 p-3 rounded-lg border"
                  >
                    <div className={`rounded-md ${announcement.color} p-2`}>
                      {announcement.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{announcement.title}</p>
                        <Badge
                          variant={
                            announcement.priority === "High"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {announcement.category} • {announcement.date}
                      </p>
                      <p className="text-sm line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 shrink-0"
                      onClick={() => openAnnouncementDetails(announcement)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="class" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Announcements</CardTitle>
              <CardDescription>
                Announcements specific to your class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 2,
                    title: "Mathematics Quiz Competition",
                    date: "April 19, 2025",
                    category: "Class",
                    priority: "Medium",
                    content:
                      "The inter-class Mathematics Quiz Competition will be held on April 24, 2025. Each class should select 3 representatives. Please submit the names to your class teacher by April 22, 2025.",
                    author: "Mrs. Sharma (Mathematics)",
                    icon: <FileText className="h-4 w-4" />,
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    id: 7,
                    title: "Class Monitor Selection",
                    date: "April 13, 2025",
                    category: "Class",
                    priority: "Medium",
                    content:
                      "The selection process for the new class monitor will begin next week. Students interested in the position should submit their names to the class teacher by April 20, 2025.",
                    author: "Class Teacher",
                    icon: <User className="h-4 w-4" />,
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    id: 8,
                    title: "Class Photo Session",
                    date: "April 10, 2025",
                    category: "Class",
                    priority: "Low",
                    content:
                      "The annual class photo session will be held on April 23, 2025. All students are requested to wear proper school uniform on that day.",
                    author: "Class Teacher",
                    icon: <User className="h-4 w-4" />,
                    color: "bg-blue-100 text-blue-600",
                  },
                ].map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-start gap-4 p-3 rounded-lg border"
                  >
                    <div className={`rounded-md ${announcement.color} p-2`}>
                      {announcement.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{announcement.title}</p>
                        <Badge
                          variant={
                            announcement.priority === "High"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {announcement.category} • {announcement.date}
                      </p>
                      <p className="text-sm line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 shrink-0"
                      onClick={() => openAnnouncementDetails(announcement)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam Announcements</CardTitle>
              <CardDescription>
                Important information about exams and assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 3,
                    title: "Final Exam Schedule",
                    date: "April 18, 2025",
                    category: "Exams",
                    priority: "High",
                    content:
                      "The final examination schedule for the academic year 2024-2025 has been released. The exams will begin on May 15, 2025. Please check the detailed schedule on the school website.",
                    author: "Examination Committee",
                    icon: <FileText className="h-4 w-4" />,
                    color: "bg-red-100 text-red-600",
                  },
                  {
                    id: 9,
                    title: "Pre-Board Examination",
                    date: "April 8, 2025",
                    category: "Exams",
                    priority: "High",
                    content:
                      "The Pre-Board Examination for Class 10 will be held from May 1 to May 10, 2025. The syllabus will be the same as the final board examination.",
                    author: "Examination Committee",
                    icon: <FileText className="h-4 w-4" />,
                    color: "bg-red-100 text-red-600",
                  },
                  {
                    id: 10,
                    title: "Practical Examination Schedule",
                    date: "April 5, 2025",
                    category: "Exams",
                    priority: "Medium",
                    content:
                      "The practical examinations for Science subjects will be held from May 5 to May 10, 2025. The detailed schedule will be shared with the students next week.",
                    author: "Science Department",
                    icon: <FileText className="h-4 w-4" />,
                    color: "bg-red-100 text-red-600",
                  },
                ].map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-start gap-4 p-3 rounded-lg border"
                  >
                    <div className={`rounded-md ${announcement.color} p-2`}>
                      {announcement.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{announcement.title}</p>
                        <Badge
                          variant={
                            announcement.priority === "High"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {announcement.category} • {announcement.date}
                      </p>
                      <p className="text-sm line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 shrink-0"
                      onClick={() => openAnnouncementDetails(announcement)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Announcement Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              {selectedAnnouncement?.category} • {selectedAnnouncement?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  selectedAnnouncement?.priority === "High"
                    ? "default"
                    : "secondary"
                }
              >
                {selectedAnnouncement?.priority} Priority
              </Badge>
              <p className="text-sm text-muted-foreground">
                Posted by: {selectedAnnouncement?.author}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/20">
              <p className="whitespace-pre-line">
                {selectedAnnouncement?.content}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Megaphone className="h-4 w-4" />
              <p>This announcement was sent to all students in Class 10A</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
