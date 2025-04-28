"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  MapPin,
  Calendar,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format, isBefore, isAfter, isToday, parseISO } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Type definitions
interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  category: string;
  status: string;
  classIds: string[];
  createdAt: string;
  organizer: string;
  adminId: string;
}

interface EventFormData {
  id?: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  category: string;
  status: string;
  classIds: string[];
}

const eventCategories = [
  { value: "ACADEMIC", label: "Academic" },
  { value: "CULTURAL", label: "Cultural" },
  { value: "SPORTS", label: "Sports" },
  { value: "HOLIDAY", label: "Holiday" },
  { value: "EXAM", label: "Exam" },
  { value: "MEETING", label: "Meeting" },
  { value: "OTHER", label: "Other" },
];

const eventStatuses = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function EventsPage() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    location: "",
    startDate: new Date(),
    endDate: new Date(),
    isAllDay: false,
    category: "OTHER",
    status: "UPCOMING",
    classIds: [],
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  const router = useRouter();

  // Fetch events
  const fetchEvents = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) {
        queryParams.append("search", search);
      }

      if (activeTab === "upcoming") {
        queryParams.append("status", "UPCOMING");
      } else if (activeTab === "ongoing") {
        queryParams.append("status", "ONGOING");
      } else if (activeTab === "completed") {
        queryParams.append("status", "COMPLETED");
      }

      const response = await fetch(`/api/events?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data.events);
      setTotalPages(data.meta.totalPages);
      setTotalEvents(data.meta.total);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create event
  const createEvent = async () => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isAllDay: formData.isAllDay,
          category: formData.category,
          status: formData.status,
          classIds: formData.classIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create event");
      }

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      resetForm();
      setShowCreateDialog(false);
      fetchEvents(currentPage, searchTerm);
      router.refresh();
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    }
  };

  // Update event
  const updateEvent = async () => {
    if (!formData.id) return;

    try {
      const response = await fetch(`/api/events`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: formData.id,
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isAllDay: formData.isAllDay,
          category: formData.category,
          status: formData.status,
          classIds: formData.classIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update event");
      }

      toast({
        title: "Success",
        description: "Event updated successfully",
      });

      resetForm();
      setShowCreateDialog(false);
      fetchEvents(currentPage, searchTerm);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    }
  };

  // Delete event
  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete event");
      }

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      fetchEvents(currentPage, searchTerm);
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      startDate: new Date(),
      endDate: new Date(),
      isAllDay: false,
      category: "OTHER",
      status: "UPCOMING",
      classIds: [],
    });
    setIsEditMode(false);
  };

  // Handle edit
  const handleEdit = (event: Event) => {
    setFormData({
      id: event.id,
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      isAllDay: event.isAllDay,
      category: event.category,
      status: event.status,
      classIds: event.classIds,
    });
    setIsEditMode(true);
    setShowCreateDialog(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (isEditMode) {
      updateEvent();
    } else {
      createEvent();
    }
  };

  // Effects
  useEffect(() => {
    fetchEvents(currentPage, searchTerm);
  }, [currentPage, activeTab]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents(1, searchTerm);
  };

  // Get filtered events
  const getUpcomingEvents = () => {
    return events.filter((e) => e.status === "UPCOMING");
  };

  const getOngoingEvents = () => {
    return events.filter((e) => e.status === "ONGOING");
  };

  const getCompletedEvents = () => {
    return events.filter((e) => e.status === "COMPLETED");
  };

  // Get badge color based on category
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "ACADEMIC":
        return <Badge variant="default">Academic</Badge>;
      case "CULTURAL":
        return <Badge variant="secondary">Cultural</Badge>;
      case "SPORTS":
        return <Badge className="bg-green-500">Sports</Badge>;
      case "HOLIDAY":
        return <Badge variant="outline">Holiday</Badge>;
      case "EXAM":
        return <Badge variant="destructive">Exam</Badge>;
      case "MEETING":
        return <Badge className="bg-yellow-500">Meeting</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return <Badge variant="outline">Upcoming</Badge>;
      case "ONGOING":
        return <Badge className="bg-green-500">Ongoing</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Format date display
  const formatEventDate = (
    startDate: string,
    endDate: string,
    isAllDay: boolean
  ) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isAllDay) {
      if (format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) {
        return `${format(start, "MMM d, yyyy")} (All day)`;
      }
      return `${format(start, "MMM d")} - ${format(
        end,
        "MMM d, yyyy"
      )} (All day)`;
    }

    if (format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) {
      return `${format(start, "MMM d, yyyy")} ${format(
        start,
        "h:mm a"
      )} - ${format(end, "h:mm a")}`;
    }

    return `${format(start, "MMM d, h:mm a")} - ${format(
      end,
      "MMM d, h:mm a, yyyy"
    )}`;
  };

  // Render events table
  const renderEventsTable = (events: Event[]) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (events.length === 0) {
      return (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">No events found</p>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="font-medium">{event.title}</div>
                  {event.description && (
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {event.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {formatEventDate(
                    event.startDate,
                    event.endDate,
                    event.isAllDay
                  )}
                </TableCell>
                <TableCell>
                  {event.location ? (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No location</span>
                  )}
                </TableCell>
                <TableCell>{getCategoryBadge(event.category)}</TableCell>
                <TableCell>{getStatusBadge(event.status)}</TableCell>
                <TableCell className="text-right">
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
                      <DropdownMenuItem onClick={() => handleEdit(event)}>
                        Edit Event
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Create and manage school events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Edit" : "Create"} Event
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Make changes to the event here."
                    : "Create a new event to share with the school."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title*
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="col-span-3 min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="col-span-3"
                      placeholder="e.g., Main Hall, Sports Field"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCategories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isAllDay" className="text-right">
                      All Day
                    </Label>
                    <Checkbox
                      id="isAllDay"
                      checked={formData.isAllDay}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          isAllDay: checked as boolean,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">
                      Start Date
                    </Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate ? (
                              format(formData.startDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) =>
                              setFormData({
                                ...formData,
                                startDate: date || new Date(),
                              })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">
                      End Date
                    </Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endDate ? (
                              format(formData.endDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) =>
                              setFormData({
                                ...formData,
                                endDate: date || new Date(),
                              })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setShowCreateDialog(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditMode ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <Button type="submit" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {totalEvents} events
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Events</CardTitle>
              <CardDescription>
                View and manage all school events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderEventsTable(events)}
              {renderPagination()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>View and manage upcoming events</CardDescription>
            </CardHeader>
            <CardContent>{renderEventsTable(getUpcomingEvents())}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Ongoing Events</CardTitle>
              <CardDescription>View and manage ongoing events</CardDescription>
            </CardHeader>
            <CardContent>{renderEventsTable(getOngoingEvents())}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Completed Events</CardTitle>
              <CardDescription>
                View and manage completed events
              </CardDescription>
            </CardHeader>
            <CardContent>{renderEventsTable(getCompletedEvents())}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
