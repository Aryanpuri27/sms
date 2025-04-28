"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarIcon,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format, isBefore, isAfter } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
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
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Type definitions
interface Announcement {
  id: string;
  title: string;
  content: string;
  important: boolean;
  expiresAt: string | null;
  createdAt: string;
  author: string;
  adminId: string;
}

interface AnnouncementFormData {
  id?: string;
  title: string;
  content: string;
  important: boolean;
  expiresAt: Date | null;
}

export default function AnnouncementsPage() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    Announcement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    content: "",
    important: false,
    expiresAt: null,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);

  const router = useRouter();

  // Fetch announcements
  const fetchAnnouncements = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) {
        queryParams.append("search", search);
      }

      if (activeTab === "important") {
        queryParams.append("important", "true");
      }

      const response = await fetch(
        `/api/announcements?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch announcements");
      }

      const data = await response.json();
      setAnnouncements(data.announcements);
      setFilteredAnnouncements(data.announcements);
      setTotalPages(data.meta.totalPages);
      setTotalAnnouncements(data.meta.total);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to fetch announcements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create announcement
  const createAnnouncement = async () => {
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          important: formData.important,
          expiresAt: formData.expiresAt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create announcement");
      }

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      resetForm();
      setShowCreateDialog(false);
      fetchAnnouncements(currentPage, searchTerm);
      router.refresh();
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    }
  };

  // Update announcement
  const updateAnnouncement = async () => {
    if (!formData.id) return;

    try {
      const response = await fetch(`/api/announcements`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: formData.id,
          title: formData.title,
          content: formData.content,
          important: formData.important,
          expiresAt: formData.expiresAt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update announcement");
      }

      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });

      resetForm();
      setShowCreateDialog(false);
      fetchAnnouncements(currentPage, searchTerm);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating announcement:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  // Delete announcement
  const deleteAnnouncement = async (id: string) => {
    try {
      const response = await fetch(`/api/announcements?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete announcement");
      }

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });

      fetchAnnouncements(currentPage, searchTerm);
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      important: false,
      expiresAt: null,
    });
    setIsEditMode(false);
  };

  // Handle edit
  const handleEdit = (announcement: Announcement) => {
    setFormData({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      important: announcement.important,
      expiresAt: announcement.expiresAt
        ? new Date(announcement.expiresAt)
        : null,
    });
    setIsEditMode(true);
    setShowCreateDialog(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    if (isEditMode) {
      updateAnnouncement();
    } else {
      createAnnouncement();
    }
  };

  // Effects
  useEffect(() => {
    fetchAnnouncements(currentPage, searchTerm);
  }, [currentPage, activeTab]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAnnouncements(1, searchTerm);
  };

  // Get filtered announcements
  const getImportantAnnouncements = () => {
    return announcements.filter((a) => a.important);
  };

  const getActiveAnnouncements = () => {
    return announcements.filter((a) => {
      if (!a.expiresAt) return true;
      return isAfter(new Date(a.expiresAt), new Date());
    });
  };

  // Render announcements table
  const renderAnnouncementsTable = (announcements: Announcement[]) => {
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

    if (announcements.length === 0) {
      return (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">No announcements found</p>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow key={announcement.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="font-medium">{announcement.title}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {announcement.content}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(announcement.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{announcement.author}</TableCell>
                <TableCell>
                  {announcement.important && (
                    <Badge variant="destructive" className="mr-1">
                      Important
                    </Badge>
                  )}
                  {announcement.expiresAt && (
                    <Badge
                      variant={
                        isBefore(new Date(announcement.expiresAt), new Date())
                          ? "outline"
                          : "default"
                      }
                    >
                      {isBefore(new Date(announcement.expiresAt), new Date())
                        ? "Expired"
                        : "Active"}
                    </Badge>
                  )}
                  {!announcement.expiresAt && <Badge>Active</Badge>}
                </TableCell>
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
                      <DropdownMenuItem
                        onClick={() => handleEdit(announcement)}
                      >
                        Edit Announcement
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteAnnouncement(announcement.id)}
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
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage school announcements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                <Plus className="h-4 w-4" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Edit" : "Create"} Announcement
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Make changes to the announcement here."
                    : "Create a new announcement to share with the school."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
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
                    <Label htmlFor="content" className="text-right">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="col-span-3 min-h-[120px]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="important" className="text-right">
                      Important
                    </Label>
                    <Checkbox
                      id="important"
                      checked={formData.important}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          important: checked as boolean,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiresAt" className="text-right">
                      Expires At
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="col-span-3 justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.expiresAt ? (
                            format(formData.expiresAt, "PPP")
                          ) : (
                            <span>No expiration date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.expiresAt || undefined}
                          onSelect={(date) =>
                            setFormData({
                              ...formData,
                              expiresAt: date || null,
                            })
                          }
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Button
                            variant="ghost"
                            className="w-full justify-center"
                            onClick={() =>
                              setFormData({ ...formData, expiresAt: null })
                            }
                            type="button"
                          >
                            Clear date
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
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
              placeholder="Search announcements..."
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
          Total: {totalAnnouncements} announcements
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All Announcements</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Announcements</CardTitle>
              <CardDescription>
                View and manage all school announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderAnnouncementsTable(announcements)}
              {renderPagination()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="important" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Important Announcements</CardTitle>
              <CardDescription>
                View and manage important announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderAnnouncementsTable(getImportantAnnouncements())}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Active Announcements</CardTitle>
              <CardDescription>
                View and manage active announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderAnnouncementsTable(getActiveAnnouncements())}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
