"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Code, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  name: z
    .string()
    .min(2, {
      message: "Subject name must be at least 2 characters.",
    })
    .max(50, {
      message: "Subject name must not exceed 50 characters.",
    }),
  code: z
    .string()
    .min(2, {
      message: "Subject code must be at least 2 characters.",
    })
    .max(20, {
      message: "Subject code must not exceed 20 characters.",
    })
    .refine((value) => /^[A-Za-z0-9-_.]+$/.test(value), {
      message:
        "Code can only contain letters, numbers, hyphens, underscores, and periods.",
    }),
  description: z.string().optional(),
});

interface EditSubjectPageProps {
  params: {
    id: string;
  };
}

export default function EditSubjectPage({ params }: EditSubjectPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState<{
    name: string;
    code: string;
    description?: string;
    updatedAt?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("general");
  const [originalValues, setOriginalValues] = useState<{
    name: string;
    code: string;
    description: string;
  }>({
    name: "",
    code: "",
    description: "",
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
    mode: "onChange", // Enable validation on change
  });

  // Track if form values have changed
  const formValues = form.watch();
  const hasFormChanged =
    JSON.stringify(formValues) !== JSON.stringify(originalValues);

  // Fetch subject data
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const response = await fetch(`/api/subjects/${params.id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch subject");
        }

        const subject = await response.json();
        setSubject(subject);

        // Store original values for comparison
        const defaultValues = {
          name: subject.name,
          code: subject.code,
          description: subject.description || "",
        };

        setOriginalValues(defaultValues);

        // Set form values
        form.reset(defaultValues);
      } catch (error: any) {
        setFetchError(error.message || "Error loading subject data");
        toast.error(error.message || "Error loading subject data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubject();
  }, [params.id, form]);

  // Add reset function
  const handleReset = () => {
    form.reset(originalValues);
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      setError(null);
      setSaveSuccess(false);

      const response = await fetch(`/api/subjects/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update subject");
      }

      // Get updated subject data
      const updatedSubject = await response.json();

      // Update the local state
      setSubject(updatedSubject.subject);

      // Store original values for comparison
      const newValues = {
        name: updatedSubject.subject.name,
        code: updatedSubject.subject.code,
        description: updatedSubject.subject.description || "",
      };

      setOriginalValues(newValues);
      form.reset(newValues);

      // Show success state
      setSaveSuccess(true);
      toast.success("Subject updated successfully");

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      setError(error.message || "Something went wrong");
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Add date formatting function
  const formattedDate = subject?.updatedAt
    ? new Date(subject.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

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
            <BreadcrumbLink>
              {isLoading ? "Loading..." : subject?.name || "Edit Subject"}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Edit Subject</h1>
          <p className="text-muted-foreground mt-1">
            Update subject information and curriculum details
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

      {fetchError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {fetchError}
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/subjects")}
              >
                Return to Subjects
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && !fetchError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Subject was updated successfully</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
          <CardFooter className="border-t p-6 flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      ) : !fetchError ? (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="general">General Information</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <Card>
                <TabsContent value="general" className="mt-0">
                  <CardHeader>
                    <CardTitle>Subject Details</CardTitle>
                    <CardDescription>
                      Update the subject's basic information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        id="edit-subject-form"
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
                                <Input {...field} />
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
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Provide a unique code for this subject
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </CardContent>
                </TabsContent>

                <TabsContent value="advanced" className="mt-0">
                  <CardHeader>
                    <CardTitle>Advanced Details</CardTitle>
                    <CardDescription>
                      Configure additional subject information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  className="min-h-32 resize-none"
                                  placeholder="Enter a detailed description of the subject's curriculum and learning objectives"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Provide details about the subject's content and
                                learning outcomes
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <Label className="text-sm font-medium">
                            Last Updated
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formattedDate || "Not available"}
                          </p>
                        </div>
                      </div>
                    </Form>
                  </CardContent>
                </TabsContent>

                <CardFooter className="flex justify-between border-t pt-6">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleReset}
                      disabled={isSubmitting || !hasFormChanged}
                    >
                      Reset
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    form="edit-subject-form"
                    disabled={
                      isSubmitting || !hasFormChanged || !form.formState.isValid
                    }
                    className="min-w-32"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subject Overview</CardTitle>
                <CardDescription>
                  Current information about this subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Subject Name
                    </h3>
                    <p className="font-medium">{subject?.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Subject Code
                    </h3>
                    <Badge variant="outline" className="font-mono">
                      <Code className="mr-1 h-3 w-3" />
                      {subject?.code}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Description
                    </h3>
                    <p className="text-sm">
                      {subject?.description || (
                        <span className="italic text-muted-foreground">
                          No description provided
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Form Status
                    </h3>
                    <div className="text-sm">
                      {hasFormChanged ? (
                        <div className="flex items-center text-amber-600">
                          <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          Unsaved changes
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          No changes
                        </div>
                      )}
                    </div>

                    {!form.formState.isValid && hasFormChanged && (
                      <div className="flex items-center text-red-600 mt-2">
                        <XCircle className="mr-1 h-3 w-3" />
                        Form has validation errors
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Subject names should be clear and descriptive.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Use a consistent format for subject codes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5 text-primary" />
                    <span>
                      Include key curriculum topics in the description.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
