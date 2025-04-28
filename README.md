# School Management System

A comprehensive school management system built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **User Management**: Admin, teacher, and student user roles with different permissions
- **Class Management**: Create and manage classes, assign teachers and students
- **Assignments**: Create, edit, and track assignments
- **Attendance**: Take and monitor student attendance
- **Grading**: Record and manage student grades
- **Timetable**: Manage class schedules
- **Teaching Materials**: Upload and share teaching resources

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- PostgreSQL

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/school-management.git
cd school-management
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

```
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/school_management"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

Replace `username` and `password` with your PostgreSQL credentials.

4. Set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Create database and apply schema
npx prisma db push

# Seed the database with initial data
npx prisma db seed
```

5. Start the development server:

```bash
npm run dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

For detailed instructions on setting up and working with the database, see [README-DATABASE.md](README-DATABASE.md).

## Login Credentials

After seeding the database, you can use the following credentials to log in:

### Admin

- Email: admin@edusync.com
- Password: password

### Teacher

- Email: teacher@edusync.com
- Password: password

### Student

- Email: student@edusync.com
- Password: password

## Project Structure

```
school-management/
├── app/                  # Next.js app directory
│   ├── admin/            # Admin pages
│   ├── api/              # API routes
│   ├── student/          # Student pages
│   ├── teacher/          # Teacher pages
│   ├── login/            # Authentication pages
│   └── layout.tsx        # Root layout
├── components/           # React components
├── lib/                  # Utility functions and shared code
├── prisma/               # Prisma schema and migrations
├── hooks/                # Custom React hooks
├── styles/               # Global styles
└── public/               # Static assets
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)
