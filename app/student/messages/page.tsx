"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";

export default function StudentMessagesPage() {
  const [activeChat, setActiveChat] = useState<any>(null);
  const [message, setMessage] = useState("");

  const contacts = [
    {
      id: 1,
      name: "Mrs. Sharma",
      role: "Mathematics Teacher",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
      lastMessage: "Don't forget to submit your assignment by tomorrow.",
      time: "10:30 AM",
      unread: 1,
    },
    {
      id: 2,
      name: "Mr. Verma",
      role: "Physics Teacher",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "offline",
      lastMessage: "Great work on your last test!",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: 3,
      name: "Mrs. Gupta",
      role: "English Teacher",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
      lastMessage: "Please check the feedback on your essay.",
      time: "Yesterday",
      unread: 2,
    },
    {
      id: 4,
      name: "Mr. Singh",
      role: "Chemistry Teacher",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "offline",
      lastMessage: "The lab report looks good. Well done!",
      time: "Apr 20",
      unread: 0,
    },
    {
      id: 5,
      name: "Mrs. Patel",
      role: "Computer Science Teacher",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
      lastMessage: "Your project has been graded. Check your dashboard.",
      time: "Apr 19",
      unread: 0,
    },
    {
      id: 6,
      name: "Principal Sharma",
      role: "School Principal",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "offline",
      lastMessage: "Congratulations on your excellent performance!",
      time: "Apr 15",
      unread: 0,
    },
  ];

  const messages = [
    {
      id: 1,
      contactId: 1,
      messages: [
        {
          id: 1,
          sender: "contact",
          content:
            "Hello Aarav, I wanted to remind you about the Mathematics assignment due tomorrow.",
          time: "10:15 AM",
        },
        {
          id: 2,
          sender: "user",
          content:
            "Hello Mrs. Sharma, thank you for the reminder. I'm working on it right now.",
          time: "10:20 AM",
        },
        {
          id: 3,
          sender: "contact",
          content:
            "Great! Let me know if you have any questions about the problems.",
          time: "10:22 AM",
        },
        {
          id: 4,
          sender: "user",
          content:
            "Actually, I'm having some difficulty with question 5. Could you provide a hint?",
          time: "10:25 AM",
        },
        {
          id: 5,
          sender: "contact",
          content:
            "For question 5, try using the quadratic formula. Remember that you need to identify the values of a, b, and c first.",
          time: "10:28 AM",
        },
        {
          id: 6,
          sender: "contact",
          content: "Don't forget to submit your assignment by tomorrow.",
          time: "10:30 AM",
        },
      ],
    },
    {
      id: 2,
      contactId: 2,
      messages: [
        {
          id: 1,
          sender: "contact",
          content: "Hello Aarav, I've graded your Physics test.",
          time: "Yesterday, 2:15 PM",
        },
        {
          id: 2,
          sender: "user",
          content: "Hello Mr. Verma, how did I do?",
          time: "Yesterday, 2:20 PM",
        },
        {
          id: 3,
          sender: "contact",
          content: "Great work on your last test! You scored 92%.",
          time: "Yesterday, 2:22 PM",
        },
        {
          id: 4,
          sender: "user",
          content: "That's great news! Thank you for letting me know.",
          time: "Yesterday, 2:25 PM",
        },
      ],
    },
    {
      id: 3,
      contactId: 3,
      messages: [
        {
          id: 1,
          sender: "contact",
          content:
            "Hello Aarav, I've reviewed your essay on environmental conservation.",
          time: "Yesterday, 11:15 AM",
        },
        {
          id: 2,
          sender: "user",
          content: "Hello Mrs. Gupta, thank you for reviewing it. How was it?",
          time: "Yesterday, 11:20 AM",
        },
        {
          id: 3,
          sender: "contact",
          content:
            "Your essay was well-written, but I have some suggestions for improvement.",
          time: "Yesterday, 11:22 AM",
        },
        {
          id: 4,
          sender: "contact",
          content:
            "Please check the feedback on your essay. I've added comments in the document.",
          time: "Yesterday, 11:25 AM",
        },
        {
          id: 5,
          sender: "contact",
          content: "Also, don't forget that your next essay is due next week.",
          time: "Yesterday, 11:30 AM",
        },
      ],
    },
  ];

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    // In a real app, you would send the message to the server
    setMessage("");
  };

  const handleSelectChat = (contact: any) => {
    setActiveChat(contact);
  };

  const getContactMessages = (contactId: number) => {
    return (
      messages.find((chat) => chat.contactId === contactId)?.messages || []
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="p-6 pb-0">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with your teachers and school staff
        </p>
      </div>

      <div className="flex flex-1 p-6 space-x-4 overflow-hidden">
        <Card className="w-1/3">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle>Conversations</CardTitle>
              <Badge>
                {contacts.reduce((acc, contact) => acc + contact.unread, 0)}
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-8" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all">
              <div className="px-4">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">
                    Unread
                  </TabsTrigger>
                  <TabsTrigger value="teachers" className="flex-1">
                    Teachers
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="m-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 ${
                        activeChat?.id === contact.id ? "bg-muted/50" : ""
                      }`}
                      onClick={() => handleSelectChat(contact)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage
                            src={contact.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                            contact.status === "online"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {contact.time}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.lastMessage}
                        </p>
                      </div>
                      {contact.unread > 0 && (
                        <Badge className="ml-auto shrink-0">
                          {contact.unread}
                        </Badge>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="unread" className="m-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  {contacts
                    .filter((contact) => contact.unread > 0)
                    .map((contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 ${
                          activeChat?.id === contact.id ? "bg-muted/50" : ""
                        }`}
                        onClick={() => handleSelectChat(contact)}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage
                              src={contact.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {contact.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                              contact.status === "online"
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {contact.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contact.time}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.lastMessage}
                          </p>
                        </div>
                        <Badge className="ml-auto shrink-0">
                          {contact.unread}
                        </Badge>
                      </div>
                    ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="teachers" className="m-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  {contacts
                    .filter((contact) => contact.role.includes("Teacher"))
                    .map((contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 ${
                          activeChat?.id === contact.id ? "bg-muted/50" : ""
                        }`}
                        onClick={() => handleSelectChat(contact)}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage
                              src={contact.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {contact.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                              contact.status === "online"
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {contact.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contact.time}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.lastMessage}
                          </p>
                        </div>
                        {contact.unread > 0 && (
                          <Badge className="ml-auto shrink-0">
                            {contact.unread}
                          </Badge>
                        )}
                      </div>
                    ))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="flex-1">
          {activeChat ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={activeChat.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {activeChat.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{activeChat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeChat.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {getContactMessages(activeChat.id).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs text-right mt-1 opacity-70">
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-2">
                Choose a contact from the list to start messaging. You can
                communicate with your teachers and school staff.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
