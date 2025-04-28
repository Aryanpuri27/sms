"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Download,
  Plus,
  Printer,
  Save,
  Loader2,
  X,
  Edit,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Types
type Class = {
  id: string;
  name: string;
};

type Teacher = {
  id: string;
  name: string;
  available?: boolean;
};

type Subject = {
  id: string;
  name: string;
  code?: string;
};

type TimetableEntry = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classId: string;
  subject: {
    id: string;
    name: string;
    code?: string;
  };
  teacher: {
    id: string;
    name: string;
  };
};

// Helper variables
const timeSlots = [
  "08:00:00",
  "09:00:00",
  "10:00:00",
  "11:00:00",
  "12:00:00",
  "13:00:00",
  "14:00:00",
  "15:00:00",
  "16:00:00",
];
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dayMapping = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0,
};

// Form validation schemas
const timetableEntrySchema = z.object({
  classId: z.string().min(1, { message: "Please select a class" }),
  subjectId: z.string().min(1, { message: "Please select a subject" }),
  teacherId: z.string().min(1, { message: "Please select a teacher" }),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: "Start time must be in HH:MM:SS format",
  }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: "End time must be in HH:MM:SS format",
  }),
});

// Helper functions
const formatTime = (timeString: string) => {
  if (!timeString) return "";
  try {
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return timeString;
  }
};

const getDayName = (day: number) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day] || "Unknown";
};

// Add this component before the main component export default function TimetablePage() {...}
interface AddTimetableEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  selectedClassId: string;
  onSuccess: () => void;
}

const AddTimetableEntryDialog = ({
  open,
  onOpenChange,
  classes,
  teachers,
  subjects,
  selectedClassId,
  onSuccess,
}: AddTimetableEntryDialogProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictDetails, setConflictDetails] = useState<string | null>(null);

  const form = useForm<z.infer<typeof timetableEntrySchema>>({
    resolver: zodResolver(timetableEntrySchema),
    defaultValues: {
      classId: selectedClassId,
      subjectId: "",
      teacherId: "",
      dayOfWeek: 1, // Monday by default
      startTime: "08:00:00",
      endTime: "09:00:00",
    },
  });

  // Reset form when dialog opens or selected class changes
  useEffect(() => {
    if (open) {
      form.reset({
        classId: selectedClassId,
        subjectId: "",
        teacherId: "",
        dayOfWeek: 1,
        startTime: "08:00:00",
        endTime: "09:00:00",
      });
      setError(null);
      setConflictDetails(null);
    }
  }, [open, selectedClassId, form]);

  const onSubmit = async (values: z.infer<typeof timetableEntrySchema>) => {
    try {
      setSubmitting(true);
      setError(null);
      setConflictDetails(null);

      // Create the timetable entry
      const response = await fetch(`/api/classes/${values.classId}/timetable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.details) {
          setConflictDetails(data.details);
        }
        throw new Error(
          data.error || data.details || "Failed to create timetable entry"
        );
      }

      // Show success message
      toast({
        title: "Success",
        description: "Timetable entry created successfully",
      });

      // Close the dialog and refresh data
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating timetable entry:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create timetable entry";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Timetable Entry</DialogTitle>
          <DialogDescription>
            Create a new class schedule entry
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start">
            <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {conflictDetails && (
          <div className="bg-amber-100 text-amber-800 text-sm p-3 rounded-md flex items-start">
            <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Scheduling Conflict:</strong> {conflictDetails}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          Class {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {days.map((day, index) => (
                        <SelectItem key={day} value={(index + 1).toString()}>
                          {day}
                        </SelectItem>
                      ))}
                      <SelectItem value="0">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.slice(0, -1).map((time) => (
                          <SelectItem key={time} value={time}>
                            {formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.slice(1).map((time) => (
                          <SelectItem key={time} value={time}>
                            {formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding
                  </>
                ) : (
                  "Add Timetable Entry"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Add this component after the AddTimetableEntryDialog but before the main component

interface EditTimetableEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: TimetableEntry | null;
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  onSuccess: () => void;
}

const EditTimetableEntryDialog = ({
  open,
  onOpenChange,
  entry,
  classes,
  teachers,
  subjects,
  onSuccess,
}: EditTimetableEntryDialogProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictDetails, setConflictDetails] = useState<string | null>(null);

  const form = useForm<z.infer<typeof timetableEntrySchema>>({
    resolver: zodResolver(timetableEntrySchema),
    defaultValues: {
      classId: entry?.classId || "",
      subjectId: entry?.subject?.id || "",
      teacherId: entry?.teacher?.id || "",
      dayOfWeek: entry?.dayOfWeek || 1,
      startTime: entry?.startTime || "08:00:00",
      endTime: entry?.endTime || "09:00:00",
    },
  });

  // Update form when entry changes
  useEffect(() => {
    if (entry && open) {
      setError(null);
      setConflictDetails(null);
      form.reset({
        classId: entry.classId,
        subjectId: entry.subject.id,
        teacherId: entry.teacher.id,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
      });
    }
  }, [entry, open, form]);

  const onSubmit = async (values: z.infer<typeof timetableEntrySchema>) => {
    if (!entry) return;

    try {
      setSubmitting(true);
      setError(null);
      setConflictDetails(null);

      // Update the timetable entry
      const response = await fetch(`/api/timetable/${entry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.details) {
          setConflictDetails(data.details);
        }
        throw new Error(
          data.error || data.details || "Failed to update timetable entry"
        );
      }

      // Show success message
      toast({
        title: "Success",
        description: "Timetable entry updated successfully",
      });

      // Close the dialog and refresh data
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating timetable entry:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update timetable entry";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Timetable Entry</DialogTitle>
          <DialogDescription>
            Update the schedule entry details
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start">
            <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {conflictDetails && (
          <div className="bg-amber-100 text-amber-800 text-sm p-3 rounded-md flex items-start">
            <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Scheduling Conflict:</strong> {conflictDetails}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          Class {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {days.map((day, index) => (
                        <SelectItem key={day} value={(index + 1).toString()}>
                          {day}
                        </SelectItem>
                      ))}
                      <SelectItem value="0">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.slice(0, -1).map((time) => (
                          <SelectItem key={time} value={time}>
                            {formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.slice(1).map((time) => (
                          <SelectItem key={time} value={time}>
                            {formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Main component
export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [editEntryOpen, setEditEntryOpen] = useState(false);
  const [deleteEntryOpen, setDeleteEntryOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimetableEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/classes");
      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }
      const data = await response.json();
      setClasses(data.classes || []);

      // Set first class as selected if available
      if (data.classes?.length > 0 && !selectedClass) {
        setSelectedClass(data.classes[0].id);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      if (!response.ok) {
        throw new Error("Failed to fetch teachers");
      }
      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data = await response.json();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    }
  };

  const fetchTimetable = async (classId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/classes/${classId}/timetable`);
      if (!response.ok) {
        throw new Error("Failed to fetch timetable");
      }
      const data = await response.json();
      console.log("Fetched timetable data:", data); // Debug log

      // Format the timetable entries to ensure they have all required fields
      const formattedEntries = (data.timetableEntries || []).map(
        (entry: any) => ({
          id: entry.id,
          dayOfWeek: entry.dayOfWeek,
          startTime: entry.startTime,
          endTime: entry.endTime,
          classId: data.class?.id || classId, // Ensure classId is set
          subject: {
            id: entry.subject.id,
            name: entry.subject.name,
            code: entry.subject.code,
          },
          teacher: {
            id: entry.teacher.id,
            name: entry.teacher.name,
          },
        })
      );

      setTimetableEntries(formattedEntries);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      toast({
        title: "Error",
        description: "Failed to load timetable",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = () => {
    setCurrentEntry(null);
    setAddEntryOpen(true);
  };

  const handleEditEntry = (entry: TimetableEntry) => {
    setCurrentEntry(entry);
    setEditEntryOpen(true);
  };

  const handleDeleteEntry = (entry: TimetableEntry) => {
    setCurrentEntry(entry);
    setDeleteEntryOpen(true);
  };

  const deleteEntry = async () => {
    if (!currentEntry) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/timetable/${currentEntry.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete entry");
      }

      toast({
        title: "Success",
        description: "Timetable entry deleted successfully",
      });

      // Refresh timetable
      fetchTimetable(selectedClass);
      setDeleteEntryOpen(false);
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete entry",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Get the selected class name
  const selectedClassName =
    classes.find((c) => c.id === selectedClass)?.name || "";

  // Group timetable entries by day
  const timetableByDay = timetableEntries.reduce((acc, entry) => {
    const day = entry.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(entry);
    return acc;
  }, {} as Record<number, TimetableEntry[]>);

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Timetable Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage class schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            onClick={handleAddEntry}
          >
            <Plus className="h-4 w-4" />
            Add Time Slot
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Academic Year: 2025-2026</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Term: Summer</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Timetable Settings</CardTitle>
            <CardDescription>Configure timetable parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      Class {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Available Teachers</label>
              <div className="grid grid-cols-2 gap-2">
                {teachers.slice(0, 6).map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-2 p-2 border rounded-md text-sm"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    {teacher.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Available Subjects</label>
              <div className="grid grid-cols-3 gap-2">
                {subjects.slice(0, 9).map((subject) => (
                  <Badge
                    key={subject.id}
                    variant="outline"
                    className="justify-center"
                  >
                    {subject.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Button className="w-full gap-2" onClick={handleAddEntry}>
              <Plus className="h-4 w-4" />
              Add New Time Slot
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Class {selectedClassName} Timetable</CardTitle>
            <CardDescription>
              Weekly schedule for Class {selectedClassName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="grid" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>

                <TabsContent value="grid" className="space-y-4">
                  <div className="flex justify-end mb-4">
                    <Button
                      className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                      onClick={handleAddEntry}
                    >
                      <Plus className="h-4 w-4" />
                      Add New Class
                    </Button>
                  </div>
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-2 text-left font-medium text-sm">
                            Time
                          </th>
                          {days.map((day) => (
                            <th
                              key={day}
                              className="p-2 text-center font-medium text-sm"
                            >
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.slice(0, -1).map((startTime, index) => {
                          const endTime = timeSlots[index + 1];
                          return (
                            <tr
                              key={startTime}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-muted/20"
                              }
                            >
                              <td className="p-2 text-sm border-r font-medium">
                                {formatTime(startTime)} - {formatTime(endTime)}
                              </td>
                              {days.map((day) => {
                                const dayIndex =
                                  dayMapping[day as keyof typeof dayMapping];
                                const entries = timetableEntries.filter(
                                  (e) =>
                                    e.dayOfWeek === dayIndex &&
                                    e.startTime === startTime &&
                                    e.endTime === endTime
                                );

                                return (
                                  <td
                                    key={`${day}-${startTime}`}
                                    className="p-1 text-sm border-r relative"
                                  >
                                    {entries.length > 0 ? (
                                      <div className="rounded shadow-sm h-full">
                                        {entries.map((entry) => (
                                          <div
                                            key={entry.id}
                                            className="p-2 bg-blue-100 hover:bg-blue-200 transition-colors rounded"
                                          >
                                            <div className="flex justify-between items-start">
                                              <span className="font-medium text-blue-800">
                                                {entry.subject.name}
                                              </span>
                                              <div className="flex space-x-1 ml-2">
                                                <button
                                                  onClick={() =>
                                                    handleEditEntry(entry)
                                                  }
                                                  className="bg-white text-blue-600 hover:text-blue-800 rounded-full p-1"
                                                  title="Edit"
                                                >
                                                  <Edit className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    handleDeleteEntry(entry)
                                                  }
                                                  className="bg-white text-red-600 hover:text-red-800 rounded-full p-1"
                                                  title="Delete"
                                                >
                                                  <Trash className="h-3.5 w-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                            <div className="text-xs text-blue-700 mt-1 flex items-center">
                                              <span
                                                className="truncate max-w-[120px]"
                                                title={entry.teacher.name}
                                              >
                                                {entry.teacher.name}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="w-full h-full min-h-[60px] flex items-center justify-center text-muted-foreground bg-gray-50 rounded">
                                        <span className="text-sm italic">
                                          Break
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="list">
                  <div className="flex justify-end mb-4">
                    <Button
                      className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                      onClick={handleAddEntry}
                    >
                      <Plus className="h-4 w-4" />
                      Add New Class
                    </Button>
                  </div>
                  <div className="space-y-6">
                    {days.map((day) => {
                      const dayIndex =
                        dayMapping[day as keyof typeof dayMapping];
                      const dayEntries = timetableByDay[dayIndex] || [];

                      return (
                        <Card key={day}>
                          <CardHeader className="pb-2 border-b">
                            <CardTitle className="text-lg flex items-center">
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded mr-2">
                                {day}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {dayEntries.length}{" "}
                                {dayEntries.length === 1 ? "class" : "classes"}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            {dayEntries.length === 0 ? (
                              <div className="text-center py-6">
                                <div className="text-muted-foreground">
                                  No classes scheduled for this day
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {dayEntries
                                  .sort((a, b) =>
                                    a.startTime.localeCompare(b.startTime)
                                  )
                                  .map((entry) => (
                                    <div
                                      key={entry.id}
                                      className="flex items-stretch rounded-md border hover:border-primary transition-colors overflow-hidden"
                                    >
                                      <div className="w-28 bg-muted/40 p-3 flex flex-col justify-center text-center">
                                        <div className="text-sm font-medium">
                                          {formatTime(
                                            entry.startTime.substring(0, 5)
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          to
                                        </div>
                                        <div className="text-sm font-medium">
                                          {formatTime(
                                            entry.endTime.substring(0, 5)
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex-1 p-3">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <span className="font-semibold text-lg block">
                                              {entry.subject.name}
                                            </span>
                                            <span className="text-sm text-muted-foreground block">
                                              Teacher: {entry.teacher.name}
                                            </span>
                                          </div>
                                          <div className="flex space-x-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleEditEntry(entry)
                                              }
                                              className="h-8 w-8 p-0"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleDeleteEntry(entry)
                                              }
                                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                              <Trash className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Entry Dialog */}
      <AddTimetableEntryDialog
        open={addEntryOpen}
        onOpenChange={setAddEntryOpen}
        classes={classes}
        teachers={teachers}
        subjects={subjects}
        selectedClassId={selectedClass}
        onSuccess={() => fetchTimetable(selectedClass)}
      />

      {/* Edit Entry Dialog */}
      <EditTimetableEntryDialog
        open={editEntryOpen}
        onOpenChange={setEditEntryOpen}
        entry={currentEntry}
        classes={classes}
        teachers={teachers}
        subjects={subjects}
        onSuccess={() => fetchTimetable(selectedClass)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteEntryOpen} onOpenChange={setDeleteEntryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this timetable entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteEntry}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
