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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  School,
  GraduationCap,
  FileText,
  Shield,
  Bell,
  Lock,
  LogOut,
  Edit,
  Save,
  X,
} from "lucide-react";

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const studentInfo = {
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    dob: "June 15, 2010",
    address: "123 Main Street, New Delhi, India",
    class: "10A",
    rollNo: "1001",
    admissionNo: "ADM20201001",
    bloodGroup: "O+",
    fatherName: "Rajesh Sharma",
    fatherOccupation: "Software Engineer",
    fatherPhone: "+91 98765 12345",
    motherName: "Priya Sharma",
    motherOccupation: "Doctor",
    motherPhone: "+91 98765 67890",
    emergencyContact: "Grandparents: +91 98765 54321",
    joinDate: "April 5, 2020",
    achievements: [
      "First Prize in Inter-School Science Exhibition (2024)",
      "Second Prize in Mathematics Olympiad (2023)",
      "School Cricket Team Captain (2023-2024)",
      "Perfect Attendance Award (2022-2023)",
    ],
    activities: [
      "Member of School Debate Club",
      "Volunteer for Community Service",
      "Member of School Cricket Team",
      "Participant in Annual Cultural Program",
    ],
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your personal information
          </p>
        </div>
        <div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{studentInfo.name}</CardTitle>
            <CardDescription>
              Student • Class {studentInfo.class}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge>Roll No. {studentInfo.rollNo}</Badge>
                <Badge variant="outline">
                  Admission No. {studentInfo.admissionNo}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{studentInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{studentInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>DOB: {studentInfo.dob}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{studentInfo.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <span>Joined: {studentInfo.joinDate}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Download ID Card
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Your personal and academic details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal" className="space-y-4">
              <TabsList>
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="family">Family</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={studentInfo.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={studentInfo.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue={studentInfo.phone} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input id="dob" defaultValue={studentInfo.dob} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        defaultValue={studentInfo.address}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Input
                        id="bloodGroup"
                        defaultValue={studentInfo.bloodGroup}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Full Name</p>
                        <p className="text-sm">{studentInfo.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm">{studentInfo.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm">{studentInfo.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Date of Birth</p>
                        <p className="text-sm">{studentInfo.dob}</p>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm">{studentInfo.address}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Blood Group</p>
                        <p className="text-sm">{studentInfo.bloodGroup}</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="family" className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father's Name</Label>
                      <Input
                        id="fatherName"
                        defaultValue={studentInfo.fatherName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherOccupation">
                        Father's Occupation
                      </Label>
                      <Input
                        id="fatherOccupation"
                        defaultValue={studentInfo.fatherOccupation}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherPhone">Father's Phone</Label>
                      <Input
                        id="fatherPhone"
                        defaultValue={studentInfo.fatherPhone}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherName">Mother's Name</Label>
                      <Input
                        id="motherName"
                        defaultValue={studentInfo.motherName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherOccupation">
                        Mother's Occupation
                      </Label>
                      <Input
                        id="motherOccupation"
                        defaultValue={studentInfo.motherOccupation}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherPhone">Mother's Phone</Label>
                      <Input
                        id="motherPhone"
                        defaultValue={studentInfo.motherPhone}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="emergencyContact">
                        Emergency Contact
                      </Label>
                      <Input
                        id="emergencyContact"
                        defaultValue={studentInfo.emergencyContact}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Father's Name</p>
                        <p className="text-sm">{studentInfo.fatherName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Father's Occupation
                        </p>
                        <p className="text-sm">
                          {studentInfo.fatherOccupation}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Father's Phone</p>
                        <p className="text-sm">{studentInfo.fatherPhone}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Mother's Name</p>
                        <p className="text-sm">{studentInfo.motherName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Mother's Occupation
                        </p>
                        <p className="text-sm">
                          {studentInfo.motherOccupation}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Mother's Phone</p>
                        <p className="text-sm">{studentInfo.motherPhone}</p>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm font-medium">Emergency Contact</p>
                        <p className="text-sm">
                          {studentInfo.emergencyContact}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="academic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Academic Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Class</span>
                        <Badge>{studentInfo.class}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Roll Number</span>
                        <Badge variant="outline">{studentInfo.rollNo}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Admission Number</span>
                        <Badge variant="outline">
                          {studentInfo.admissionNo}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Joined On</span>
                        <span className="text-sm">{studentInfo.joinDate}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Achievements</h3>
                    <div className="space-y-2">
                      {studentInfo.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-sm">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="font-medium mb-2">
                      Extra-Curricular Activities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {studentInfo.activities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-sm">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Account Settings</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Change Password</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Update your account password
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">
                            Notification Preferences
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Manage your notification settings
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Privacy Settings</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Control your privacy preferences
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <h3 className="font-medium">Notifications</h3>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-sm">Email Notifications</span>
                          <p className="text-xs text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-sm">SMS Notifications</span>
                          <p className="text-xs text-muted-foreground">
                            Receive notifications via SMS
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-sm">Assignment Reminders</span>
                          <p className="text-xs text-muted-foreground">
                            Get reminders for upcoming assignments
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-sm">Exam Notifications</span>
                          <p className="text-xs text-muted-foreground">
                            Get notifications about upcoming exams
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="destructive" className="w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
