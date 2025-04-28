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
import { FileText, Download, ExternalLink } from "lucide-react";

export default function StudentAssignmentsPage() {
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openAssignmentDetails = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground">
          View and submit your assignments
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
              <CardDescription>
                Assignments that need to be completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    subject: "Mathematics",
                    title: "Algebra Homework",
                    due: "April 24, 2025",
                    status: "Pending",
                    description:
                      "Complete exercises 1-10 from Chapter 5 of the textbook. Show all your work and explain your reasoning for each problem.",
                    teacher: "Mrs. Sharma",
                    maxMarks: 20,
                  },
                  {
                    id: 2,
                    subject: "Physics",
                    title: "Force and Motion Assignment",
                    due: "April 25, 2025",
                    status: "Pending",
                    description:
                      "Design and describe an experiment that demonstrates Newton's Second Law of Motion. Include diagrams, materials needed, and expected results.",
                    teacher: "Mr. Verma",
                    maxMarks: 30,
                  },
                  {
                    id: 3,
                    subject: "English",
                    title: "Essay on Environmental Conservation",
                    due: "April 28, 2025",
                    status: "Pending",
                    description:
                      "Write a 1000-word essay on the importance of environmental conservation. Include at least 5 references from reputable sources.",
                    teacher: "Mrs. Gupta",
                    maxMarks: 50,
                  },
                  {
                    id: 4,
                    subject: "Computer Science",
                    title: "Python Programming Project",
                    due: "April 30, 2025",
                    status: "Pending",
                    description:
                      "Create a simple calculator application using Python. The application should handle basic arithmetic operations and have a user-friendly interface.",
                    teacher: "Mrs. Patel",
                    maxMarks: 40,
                  },
                ].map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {assignment.subject} • Due: {assignment.due}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {assignment.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      onClick={() => openAssignmentDetails(assignment)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Assignments</CardTitle>
              <CardDescription>
                Assignments you have submitted and are awaiting grades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 5,
                    subject: "Biology",
                    title: "Ecosystem Project",
                    submitted: "April 18, 2025",
                    status: "Submitted",
                    description:
                      "Create a detailed diagram of a local ecosystem, identifying at least 10 different species and their interactions.",
                    teacher: "Mrs. Reddy",
                    maxMarks: 30,
                  },
                  {
                    id: 6,
                    subject: "History",
                    title: "Ancient Civilizations Research",
                    submitted: "April 17, 2025",
                    status: "Submitted",
                    description:
                      "Research and write a 1500-word report on an ancient civilization of your choice. Include information about their culture, achievements, and downfall.",
                    teacher: "Mr. Joshi",
                    maxMarks: 50,
                  },
                ].map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {assignment.subject} • Submitted: {assignment.submitted}
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {assignment.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      onClick={() => openAssignmentDetails(assignment)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Graded Assignments</CardTitle>
              <CardDescription>
                Assignments that have been graded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 7,
                    subject: "Chemistry",
                    title: "Periodic Table Quiz",
                    submitted: "April 15, 2025",
                    grade: "A",
                    marks: "18/20",
                    feedback:
                      "Excellent work! You demonstrated a thorough understanding of the periodic table and its elements.",
                    description:
                      "Complete the quiz on the periodic table, identifying elements, their properties, and their positions.",
                    teacher: "Mr. Singh",
                    maxMarks: 20,
                  },
                  {
                    id: 8,
                    subject: "History",
                    title: "Indian Freedom Movement Essay",
                    submitted: "April 12, 2025",
                    grade: "A-",
                    marks: "45/50",
                    feedback:
                      "Very good analysis of the freedom movement. Could have included more details about the economic impact.",
                    description:
                      "Write a comprehensive essay on the Indian Freedom Movement, highlighting key events and figures.",
                    teacher: "Mr. Joshi",
                    maxMarks: 50,
                  },
                  {
                    id: 9,
                    subject: "Mathematics",
                    title: "Trigonometry Problems",
                    submitted: "April 10, 2025",
                    grade: "B+",
                    marks: "16/20",
                    feedback:
                      "Good work on most problems. Review the concepts of inverse trigonometric functions.",
                    description:
                      "Solve the given set of trigonometry problems, showing all steps and working.",
                    teacher: "Mrs. Sharma",
                    maxMarks: 20,
                  },
                  {
                    id: 10,
                    subject: "Computer Science",
                    title: "HTML/CSS Project",
                    submitted: "April 5, 2025",
                    grade: "A+",
                    marks: "40/40",
                    feedback:
                      "Outstanding work! Your website design is both aesthetically pleasing and functionally excellent.",
                    description:
                      "Create a simple website using HTML and CSS on a topic of your choice.",
                    teacher: "Mrs. Patel",
                    maxMarks: 40,
                  },
                ].map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {assignment.subject} • Submitted: {assignment.submitted}
                      </div>
                    </div>
                    <Badge className="ml-auto">
                      Grade: {assignment.grade} ({assignment.marks})
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      onClick={() => openAssignmentDetails(assignment)}
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

      {/* Assignment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.subject} • {selectedAssignment?.teacher}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge
                  variant={
                    selectedAssignment?.status === "Pending"
                      ? "outline"
                      : "default"
                  }
                  className="mt-1"
                >
                  {selectedAssignment?.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {selectedAssignment?.status === "Pending"
                    ? "Due Date"
                    : "Submission Date"}
                </p>
                <p className="text-sm">
                  {selectedAssignment?.due || selectedAssignment?.submitted}
                </p>
              </div>
              {selectedAssignment?.grade && (
                <>
                  <div>
                    <p className="text-sm font-medium">Grade</p>
                    <Badge className="mt-1">{selectedAssignment?.grade}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Marks</p>
                    <p className="text-sm">{selectedAssignment?.marks}</p>
                  </div>
                </>
              )}
            </div>

            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm mt-1">{selectedAssignment?.description}</p>
            </div>

            {selectedAssignment?.feedback && (
              <div>
                <p className="text-sm font-medium">Teacher's Feedback</p>
                <p className="text-sm mt-1">{selectedAssignment?.feedback}</p>
              </div>
            )}

            <div className="border rounded-md p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <p className="text-sm font-medium">Assignment Document</p>
                <Button size="sm" variant="ghost" className="ml-auto gap-1">
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {selectedAssignment?.status === "Pending" && (
                <Button className="gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Submit Assignment
                </Button>
              )}
              {selectedAssignment?.status === "Submitted" && (
                <Button variant="outline" className="gap-1">
                  <ExternalLink className="h-4 w-4" />
                  View Submission
                </Button>
              )}
              {selectedAssignment?.status !== "Pending" && (
                <Button variant="outline" className="gap-1">
                  <Download className="h-4 w-4" />
                  Download Feedback
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
