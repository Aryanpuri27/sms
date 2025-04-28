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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Edit, Trash2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function ViewAssignmentPage({
  params,
}: {
  params: { id: string };
}) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/teachers/assignments/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch assignment");
        }
        const data = await response.json();
        setAssignment(data.assignment);
      } catch (error) {
        console.error("Error fetching assignment:", error);
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
      fetchAssignment();
    }
  }, [params.id, session]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

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
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "UPCOMING":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          onClick={() => router.push("/teacher/assignments")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          onClick={() => router.push(`/teacher/assignments/${params.id}/edit`)}
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
          className="gap-2"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <CardDescription>
                Created on {format(new Date(assignment.createdAt), "PPP")}
              </CardDescription>
            </div>
            <Badge
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                getStatusColor(assignment.status)
              )}
            >
              {assignment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Subject
              </h3>
              <p className="text-lg">{assignment.subject}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Class
              </h3>
              <p className="text-lg">Class {assignment.className}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Due Date
              </h3>
              <p className="text-lg">
                {format(new Date(assignment.dueDate), "PPP")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Submissions
              </h3>
              <p className="text-lg">{assignment.submissionCount}</p>
            </div>
          </div>

          {assignment.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </h3>
              <p className="text-base whitespace-pre-wrap">
                {assignment.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
