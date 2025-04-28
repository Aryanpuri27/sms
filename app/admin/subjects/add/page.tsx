"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Plus, Loader2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Subject name must be at least 2 characters.",
  }),
  code: z.string().min(2, {
    message: "Subject code must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

export default function AddSubjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create subject");
      }

      const data = await response.json();
      toast.success("Subject created successfully");
      router.push("/admin/subjects");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Something went wrong");
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/subjects">Subjects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Add Subject</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Add New Subject</h1>
          <p className="text-muted-foreground mt-1">
            Create a new subject for the school curriculum
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full md:w-auto"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subjects
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Subject Details</CardTitle>
            <CardDescription>
              Fill in the information for the new subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                id="add-subject-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mathematics" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the full name of the subject
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Code</FormLabel>
                      <FormControl>
                        <Input placeholder="MATH101" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a unique code for this subject
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the subject curriculum and objectives"
                          className="min-h-32 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about the subject's content and learning
                        outcomes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-subject-form"
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Subject
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guidelines</CardTitle>
              <CardDescription>Tips for creating a new subject</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-muted">
                    <span className="text-xs">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Choose a clear name</h3>
                    <p className="text-muted-foreground">
                      Use a standard naming convention for consistency
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-muted">
                    <span className="text-xs">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Create a unique code</h3>
                    <p className="text-muted-foreground">
                      Subject codes should be short and memorable
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-muted">
                    <span className="text-xs">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Add a detailed description</h3>
                    <p className="text-muted-foreground">
                      Include key topics, learning objectives, and grade level
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Subject Codes</CardTitle>
              <CardDescription>Examples for reference</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Mathematics</span>
                  <span className="text-muted-foreground">MATH101</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Science</span>
                  <span className="text-muted-foreground">SCI101</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">English</span>
                  <span className="text-muted-foreground">ENG101</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">History</span>
                  <span className="text-muted-foreground">HIST101</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Computer Science</span>
                  <span className="text-muted-foreground">CS101</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
