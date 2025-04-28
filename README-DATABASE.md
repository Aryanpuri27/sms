# School Management System Database Setup

This guide helps you set up the PostgreSQL database with Prisma for the School Management System.

## Prerequisites

- Node.js and npm/pnpm installed
- PostgreSQL installed and running

## Setup Steps

### 1. Install Prisma

```bash
npm install prisma --save-dev
npm install @prisma/client
```

Or with pnpm:

```bash
pnpm add prisma --save-dev
pnpm add @prisma/client
```

### 2. Configure Environment Variables

Create a `.env` file in the root of your project with the following content:

```
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/school_management"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-should-be-very-secure"

# Email provider (for password resets, etc.)
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_FROM=
```

Replace `username` and `password` with your PostgreSQL credentials.

### 3. Initialize and Push the Database Schema

```bash
npx prisma db push
```

This will create the database if it doesn't exist and set up all the tables according to the schema.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

This creates a strongly-typed client for your database schema.

### 5. Create a Database Connection Utility

Create a file `lib/prisma.ts` with the following content:

```typescript
import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

### 6. Using Prisma in API Routes

Here's an example of how to use Prisma in an API route:

```typescript
// app/api/assignments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        class: true,
        subject: true,
      },
    });
    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Find the teacher record based on user email
    const teacher = await prisma.teacher.findFirst({
      where: {
        user: {
          email: session.user?.email,
        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher record not found" },
        { status: 404 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        status: data.status,
        teacherId: teacher.id,
        classId: data.classId,
        subjectId: data.subjectId,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
```

### 7. Updating the Assignments Page to Use Real Data

Here's how you could update the assignments page to use real data from the database:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// other imports...

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch assignments from the API
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/assignments");
        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load assignments",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [toast]);

  // Filter assignments based on search query
  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.subject.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      assignment.class.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submission for adding/editing an assignment
  const onSubmit = async (data) => {
    try {
      if (selectedAssignment) {
        // Edit existing assignment
        const response = await fetch(
          `/api/assignments/${selectedAssignment.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update assignment");
        }

        const updatedAssignment = await response.json();
        setAssignments(
          assignments.map((assignment) =>
            assignment.id === selectedAssignment.id
              ? updatedAssignment
              : assignment
          )
        );

        toast({
          title: "Assignment updated",
          description: `${data.title} has been updated.`,
        });
        setIsEditDialogOpen(false);
      } else {
        // Add new assignment
        const response = await fetch("/api/assignments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to create assignment");
        }

        const newAssignment = await response.json();
        setAssignments([...assignments, newAssignment]);

        toast({
          title: "Assignment created",
          description: `${data.title} has been created.`,
        });
        setIsAddDialogOpen(false);
      }
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle assignment deletion
  const handleDeleteAssignment = async () => {
    if (selectedAssignment) {
      try {
        const response = await fetch(
          `/api/assignments/${selectedAssignment.id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete assignment");
        }

        setAssignments(
          assignments.filter(
            (assignment) => assignment.id !== selectedAssignment.id
          )
        );

        toast({
          title: "Assignment deleted",
          description: `${selectedAssignment.title} has been deleted.`,
        });
        setIsDeleteDialogOpen(false);
        setSelectedAssignment(null);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  // Rest of your component code...
}
```

## Prisma Studio

For a visual way to manage your database, you can use Prisma Studio:

```bash
npx prisma studio
```

This starts a web interface on http://localhost:5555 where you can browse and edit your data.

## Database Migrations

As your schema evolves, use Prisma migrations to update your database schema:

```bash
# Create a migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy
```

## Seeding the Database

Create a file `prisma/seed.ts` to populate initial data:

```typescript
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash("password", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@edusync.com" },
    update: {},
    create: {
      email: "admin@edusync.com",
      name: "Principal Sharma",
      password: adminPassword,
      role: "ADMIN",
      admin: {
        create: {
          designation: "Principal",
          phoneNumber: "+91 98765 43210",
        },
      },
    },
  });

  // Create teacher user
  const teacherPassword = await hash("password", 10);
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@edusync.com" },
    update: {},
    create: {
      email: "teacher@edusync.com",
      name: "Mrs. Sharma",
      password: teacherPassword,
      role: "TEACHER",
      teacher: {
        create: {
          designation: "Senior Mathematics Teacher",
          qualification: "M.Sc. Mathematics",
        },
      },
    },
  });

  // Create subjects
  const math = await prisma.subject.create({
    data: {
      name: "Mathematics",
      code: "MATH",
      description: "Mathematics curriculum",
    },
  });

  const science = await prisma.subject.create({
    data: {
      name: "Science",
      code: "SCI",
      description: "Science curriculum",
    },
  });

  // Create classes
  const class10A = await prisma.class.create({
    data: {
      name: "10A",
      roomNumber: "101",
      academicYear: "2023-2024",
      teacherId: teacher.teacher.id,
    },
  });

  // Add subjects to classes
  await prisma.subjectClassMapping.createMany({
    data: [
      { classId: class10A.id, subjectId: math.id },
      { classId: class10A.id, subjectId: science.id },
    ],
  });

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Update `package.json` to add a seed script:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
},
```

Then run:

```bash
npx prisma db seed
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [NextAuth.js with Prisma](https://next-auth.js.org/adapters/prisma)
