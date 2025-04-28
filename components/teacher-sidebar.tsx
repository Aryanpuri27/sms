"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Layers,
  CalendarDays,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TeacherSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-2 px-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500"></div>
            <div className="font-bold">EduSync Teacher</div>
            <SidebarTrigger className="ml-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/teacher/dashboard")}
              >
                <Link href="/teacher/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/teacher/students")}
              >
                <Link href="/teacher/students">
                  <Users className="h-4 w-4" />
                  <span>Students</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/teacher/classes")}
              >
                <Link href="/teacher/classes">
                  <BookOpen className="h-4 w-4" />
                  <span>Classes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/teacher/subjects")}
              >
                <Link href="/teacher/subjects">
                  <Layers className="h-4 w-4" />
                  <span>Subjects</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/teacher/timetable")}
              >
                <Link href="/teacher/timetable">
                  <Calendar className="h-4 w-4" />
                  <span>Timetable</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/teacher/attendance")}
              >
                <Link href="/teacher/attendance">
                  <FileText className="h-4 w-4" />
                  <span>Attendance</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/teacher/grades")}>
                <Link href="/teacher/grades">
                  <FileText className="h-4 w-4" />
                  <span>Grades</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/teacher/announcements")}
              >
                <Link href="/teacher/announcements">
                  <Bell className="h-4 w-4" />
                  <span>Announcements</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/teacher/events")}>
                <Link href="/teacher/events">
                  <CalendarDays className="h-4 w-4" />
                  <span>Events</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/teacher/settings")}
              >
                <Link href="/teacher/settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-2">
          <div className="flex items-center gap-2 p-2">
            <Avatar>
              <AvatarImage
                src={
                  session?.user?.image || "/placeholder.svg?height=32&width=32"
                }
              />
              <AvatarFallback>
                {session?.user?.name?.charAt(0) || "T"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {session?.user?.name || "Teacher"}
              </span>
              <span className="text-xs text-muted-foreground">
                {session?.user?.email || "teacher@edusync.com"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
