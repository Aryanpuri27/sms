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
import { Progress } from "@/components/ui/progress";
import { LineChart, BarChart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudentGradesPage() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grades</h1>
          <p className="text-muted-foreground">
            View your academic performance
          </p>
        </div>
        <div>
          <Select defaultValue="current">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Term (2025)</SelectItem>
              <SelectItem value="previous">Previous Term (2024)</SelectItem>
              <SelectItem value="all">All Terms</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall GPA
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.8</div>
                <p className="text-xs text-muted-foreground">
                  +0.2 from last term
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Class Rank
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 / 45</div>
                <p className="text-xs text-muted-foreground">
                  Top 7% of the class
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Highest Grade
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">A+</div>
                <p className="text-xs text-muted-foreground">
                  Computer Science
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Areas for Improvement
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">B</div>
                <p className="text-xs text-muted-foreground">Geography</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>
                  Your grades across all subjects
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">A-</div>
                <div className="text-sm text-muted-foreground">Average</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-gradient-to-r from-purple-100 to-blue-50 rounded-md flex items-center justify-center">
                <LineChart className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  Performance Chart
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    subject: "Mathematics",
                    currentGrade: "A",
                    previousGrade: "A-",
                    teacher: "Mrs. Sharma",
                    trend: "up",
                  },
                  {
                    subject: "Physics",
                    currentGrade: "A-",
                    previousGrade: "B+",
                    teacher: "Mr. Verma",
                    trend: "up",
                  },
                  {
                    subject: "Chemistry",
                    currentGrade: "B+",
                    previousGrade: "B+",
                    teacher: "Mr. Singh",
                    trend: "stable",
                  },
                  {
                    subject: "English",
                    currentGrade: "A",
                    previousGrade: "A",
                    teacher: "Mrs. Gupta",
                    trend: "stable",
                  },
                  {
                    subject: "Computer Science",
                    currentGrade: "A+",
                    previousGrade: "A",
                    teacher: "Mrs. Patel",
                    trend: "up",
                  },
                  {
                    subject: "Hindi",
                    currentGrade: "B+",
                    previousGrade: "A-",
                    teacher: "Mr. Kumar",
                    trend: "down",
                  },
                  {
                    subject: "History",
                    currentGrade: "A-",
                    previousGrade: "B+",
                    teacher: "Mrs. Reddy",
                    trend: "up",
                  },
                  {
                    subject: "Geography",
                    currentGrade: "B",
                    previousGrade: "B",
                    teacher: "Mr. Joshi",
                    trend: "stable",
                  },
                ].map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{subject.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        Teacher: {subject.teacher}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">
                          Previous
                        </div>
                        <Badge variant="outline">{subject.previousGrade}</Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">
                          Current
                        </div>
                        <Badge>{subject.currentGrade}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
              <CardDescription>
                Detailed breakdown of your performance in each subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    subject: "Mathematics",
                    grade: "A",
                    progress: 92,
                    teacher: "Mrs. Sharma",
                    assignments: { completed: 12, total: 15 },
                    tests: { completed: 4, total: 5 },
                  },
                  {
                    subject: "Physics",
                    grade: "A-",
                    progress: 88,
                    teacher: "Mr. Verma",
                    assignments: { completed: 10, total: 12 },
                    tests: { completed: 3, total: 4 },
                  },
                  {
                    subject: "Chemistry",
                    grade: "B+",
                    progress: 85,
                    teacher: "Mr. Singh",
                    assignments: { completed: 8, total: 10 },
                    tests: { completed: 3, total: 4 },
                  },
                  {
                    subject: "English",
                    grade: "A",
                    progress: 90,
                    teacher: "Mrs. Gupta",
                    assignments: { completed: 7, total: 8 },
                    tests: { completed: 2, total: 3 },
                  },
                  {
                    subject: "Computer Science",
                    grade: "A+",
                    progress: 95,
                    teacher: "Mrs. Patel",
                    assignments: { completed: 6, total: 6 },
                    tests: { completed: 2, total: 2 },
                  },
                ].map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-lg">
                          {subject.subject}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Teacher: {subject.teacher}
                        </div>
                      </div>
                      <Badge className="text-lg py-1">{subject.grade}</Badge>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="bg-muted/20 p-2 rounded-md">
                        <div className="text-sm font-medium">Overall</div>
                        <div className="text-lg font-bold">
                          {subject.progress}%
                        </div>
                      </div>
                      <div className="bg-muted/20 p-2 rounded-md">
                        <div className="text-sm font-medium">Assignments</div>
                        <div className="text-lg font-bold">
                          {subject.assignments.completed}/
                          {subject.assignments.total}
                        </div>
                      </div>
                      <div className="bg-muted/20 p-2 rounded-md">
                        <div className="text-sm font-medium">Tests</div>
                        <div className="text-lg font-bold">
                          {subject.tests.completed}/{subject.tests.total}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam Results</CardTitle>
              <CardDescription>
                Your performance in recent examinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Mid-Term Examination",
                    date: "February 15, 2025",
                    overallGrade: "A-",
                    percentage: "87%",
                    subjects: [
                      { name: "Mathematics", marks: "45/50", grade: "A" },
                      { name: "Physics", marks: "42/50", grade: "A-" },
                      { name: "Chemistry", marks: "40/50", grade: "B+" },
                      { name: "English", marks: "44/50", grade: "A" },
                      { name: "Computer Science", marks: "48/50", grade: "A+" },
                    ],
                  },
                  {
                    name: "Unit Test 3",
                    date: "January 20, 2025",
                    overallGrade: "B+",
                    percentage: "84%",
                    subjects: [
                      { name: "Mathematics", marks: "18/20", grade: "A" },
                      { name: "Physics", marks: "16/20", grade: "B+" },
                      { name: "Chemistry", marks: "17/20", grade: "A-" },
                      { name: "English", marks: "16/20", grade: "B+" },
                      { name: "Computer Science", marks: "19/20", grade: "A+" },
                    ],
                  },
                  {
                    name: "Unit Test 2",
                    date: "December 10, 2024",
                    overallGrade: "A",
                    percentage: "90%",
                    subjects: [
                      { name: "Mathematics", marks: "19/20", grade: "A+" },
                      { name: "Physics", marks: "18/20", grade: "A" },
                      { name: "Chemistry", marks: "17/20", grade: "A-" },
                      { name: "English", marks: "18/20", grade: "A" },
                      { name: "Computer Science", marks: "18/20", grade: "A" },
                    ],
                  },
                ].map((exam, index) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{exam.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Date: {exam.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">
                              Grade
                            </div>
                            <Badge className="text-lg">
                              {exam.overallGrade}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">
                              Percentage
                            </div>
                            <div className="font-bold">{exam.percentage}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium">
                              Subject
                            </th>
                            <th className="text-center py-2 font-medium">
                              Marks
                            </th>
                            <th className="text-center py-2 font-medium">
                              Grade
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {exam.subjects.map((subject, subIndex) => (
                            <tr
                              key={subIndex}
                              className="border-b last:border-0"
                            >
                              <td className="py-2">{subject.name}</td>
                              <td className="text-center py-2">
                                {subject.marks}
                              </td>
                              <td className="text-center py-2">
                                <Badge variant="outline">{subject.grade}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Progress</CardTitle>
              <CardDescription>
                Track your improvement over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-gradient-to-r from-blue-100 to-purple-50 rounded-md flex items-center justify-center">
                <BarChart className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  Progress Chart
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium">Term-wise GPA</h3>
                    <div className="mt-2 space-y-2">
                      {[
                        { term: "Term 1 (2024)", gpa: "3.6" },
                        { term: "Term 2 (2024)", gpa: "3.7" },
                        { term: "Term 3 (2024)", gpa: "3.7" },
                        { term: "Term 1 (2025)", gpa: "3.8" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center"
                        >
                          <span>{item.term}</span>
                          <Badge variant="outline">{item.gpa}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium">Subject Improvement</h3>
                    <div className="mt-2 space-y-2">
                      {[
                        { subject: "Mathematics", improvement: "+8%" },
                        { subject: "Physics", improvement: "+12%" },
                        { subject: "Chemistry", improvement: "+5%" },
                        { subject: "Computer Science", improvement: "+10%" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center"
                        >
                          <span>{item.subject}</span>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            {item.improvement}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Teacher Comments</h3>
                  <div className="space-y-3">
                    {[
                      {
                        teacher: "Mrs. Sharma (Mathematics)",
                        comment:
                          "Aarav has shown significant improvement in calculus. His problem-solving skills have developed well.",
                        date: "April 10, 2025",
                      },
                      {
                        teacher: "Mr. Verma (Physics)",
                        comment:
                          "Excellent progress in understanding complex physics concepts. Keep up the good work!",
                        date: "April 5, 2025",
                      },
                      {
                        teacher: "Mrs. Patel (Computer Science)",
                        comment:
                          "Outstanding performance in programming assignments. Aarav demonstrates exceptional logical thinking.",
                        date: "March 28, 2025",
                      },
                    ].map((comment, i) => (
                      <div key={i} className="bg-muted/20 p-3 rounded-md">
                        <div className="flex justify-between">
                          <span className="font-medium">{comment.teacher}</span>
                          <span className="text-sm text-muted-foreground">
                            {comment.date}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
