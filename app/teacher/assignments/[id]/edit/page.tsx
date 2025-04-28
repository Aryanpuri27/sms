"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, ArrowLeft } from "lucide-react";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: string;
  subject: string;
  subjectId: string;
  classId: string;
  className: string;
  submissionCount: number;
  createdAt: string;
};

type Subject = {
  id: string;
  name: string;
  code: string | null;
};

type ClassInfo = {
  id: string;
  name: string;
  section: string | null;
  roomNumber: string | null;
};

export default function EditAssignmentPage({
  params,
}: {
  params: { id: string };
}) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentRes, subjectsRes, classesRes] = await Promise.all([
          fetch(`/api/teachers/assignments/${params.id}`),
          fetch("/api/teachers/assignments?subjects=true"),
          fetch("/api/teachers/assignments?classes=true"),
        ]);

        if (!assignmentRes.ok || !subjectsRes.ok || !classesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [assignmentData, subjectsData, classesData] = await Promise.all([
          assignmentRes.json(),
          subjectsRes.json(),
          classesRes.json(),
        ]);

        setAssignment(assignmentData.assignment);
        setSubjects(subjectsData.subjects);
        setClasses(classesData.classes);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load assignment details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "TEACHER") {
      fetchData();
    }
  }, [params.id, session]);

  const handleSave = async () => {
    if (!assignment) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/teachers/assignments/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          subjectId: assignment.subjectId,
          classId: assignment.classId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update assignment");
      }

      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
      router.push(`/teacher/assignments/${params.id}`);
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/teachers/assignments/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete assignment");
      }

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
      router.push("/teacher/assignments");
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Assignment not found</h1>
        <Button
          onClick={() => router.push("/teacher/assignments")}
          className="mt-4"
        >
          Back to Assignments
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/teacher/assignments/${params.id}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignment
        </Button>
        <div className="flex-1" />
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleting}
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Delete Assignment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Assignment</CardTitle>
          <CardDescription>
            Update the details of your assignment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <Input
              id="title"
              value={assignment.title}
              onChange={(e) =>
                setAssignment({ ...assignment, title: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={assignment.description || ""}
              onChange={(e) =>
                setAssignment({ ...assignment, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="dueDate" className="text-sm font-medium">
                Due Date *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {assignment.dueDate ? (
                      format(new Date(assignment.dueDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(assignment.dueDate)}
                    onSelect={(date) =>
                      date &&
                      setAssignment({
                        ...assignment,
                        dueDate: date.toISOString(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject *
              </label>
              <Select
                value={assignment.subjectId}
                onValueChange={(value) =>
                  setAssignment({ ...assignment, subjectId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="class" className="text-sm font-medium">
                Class *
              </label>
              <Select
                value={assignment.classId}
                onValueChange={(value) =>
                  setAssignment({ ...assignment, classId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      Class {cls.name} {cls.section && `(${cls.section})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/teacher/assignments/${params.id}`)}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
