import {
  PrismaClient,
  UserRole,
  AssignmentStatus,
  EventCategory,
  EventStatus,
} from "@prisma/client";
import { hash } from "bcryptjs";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting database seeding...");

    // Create admin user
    const adminPassword = await hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@school.com" },
      update: {},
      create: {
        email: "admin@school.com",
        name: "Admin User",
        password: adminPassword,
        role: UserRole.ADMIN,
      },
    });
    console.log("Created admin user:", admin.name);

    // Create admin profile
    const adminProfile = await prisma.admin.create({
      data: {
        userId: admin.id,
        designation: "School Administrator",
        bio: "Main administrator of the school",
        phoneNumber: "9876543200",
      },
    });

    // Create teachers
    const teachers = [
      {
        name: "Mrs. Sharma",
        email: "sharma@school.com",
        designation: "Senior Teacher",
        qualification: "M.Sc Mathematics",
        bio: "10 years of teaching experience",
        phoneNumber: "9876543210",
      },
      {
        name: "Mr. Verma",
        email: "verma@school.com",
        designation: "Head of Science",
        qualification: "M.Sc Physics",
        bio: "Specialized in Physics and Astronomy",
        phoneNumber: "9876543211",
      },
      {
        name: "Mrs. Gupta",
        email: "gupta@school.com",
        designation: "English Teacher",
        qualification: "M.A English",
        bio: "Expert in Literature and Creative Writing",
        phoneNumber: "9876543212",
      },
      {
        name: "Mr. Singh",
        email: "singh@school.com",
        designation: "Chemistry Teacher",
        qualification: "M.Sc Chemistry",
        bio: "Research experience in Organic Chemistry",
        phoneNumber: "9876543213",
      },
      {
        name: "Mrs. Patel",
        email: "patel@school.com",
        designation: "Computer Science Teacher",
        qualification: "M.Tech Computer Science",
        bio: "Expert in Programming and Web Development",
        phoneNumber: "9876543214",
      },
    ];

    const createdTeachers = [];
    for (const teacher of teachers) {
      const password = await hash("teacher123", 10);
      const user = await prisma.user.upsert({
        where: { email: teacher.email },
        update: {},
        create: {
          email: teacher.email,
          name: teacher.name,
          password,
          role: UserRole.TEACHER,
        },
      });

      const createdTeacher = await prisma.teacher.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          designation: teacher.designation,
          qualification: teacher.qualification,
          bio: teacher.bio,
          phoneNumber: teacher.phoneNumber,
        },
      });

      createdTeachers.push(createdTeacher);
    }

    // Create classes
    const classes = [
      { name: "Class 10A", roomNumber: "101" },
      { name: "Class 10B", roomNumber: "102" },
      { name: "Class 11A", roomNumber: "201" },
      { name: "Class 11B", roomNumber: "202" },
      { name: "Class 12A", roomNumber: "301" },
      { name: "Class 12B", roomNumber: "302" },
    ];

    const createdClasses = [];
    for (const cls of classes) {
      const createdClass = await prisma.class.create({
        data: {
          name: cls.name,
          roomNumber: cls.roomNumber,
          teacher: {
            connect: {
              id: createdTeachers[0].id,
            },
          },
        },
      });
      createdClasses.push(createdClass);
    }

    // Create subjects
    const subjects = [
      { name: "Mathematics", code: "MATH" },
      { name: "Physics", code: "PHY" },
      { name: "Chemistry", code: "CHEM" },
      { name: "English", code: "ENG" },
      { name: "Computer Science", code: "CS" },
      { name: "Biology", code: "BIO" },
      { name: "History", code: "HIST" },
      { name: "Geography", code: "GEO" },
    ];

    const createdSubjects = [];
    for (const subject of subjects) {
      const createdSubject = await prisma.subject.create({
        data: {
          name: subject.name,
          code: subject.code,
        },
      });
      createdSubjects.push(createdSubject);
    }

    // Create students
    const students = [
      {
        name: "Aarav Sharma",
        email: "aarav@school.com",
        classId: createdClasses[0].id,
        rollNumber: "10A001",
        dateOfBirth: new Date("2007-05-15"),
        address: "123 Main Street, City",
      },
      {
        name: "Priya Patel",
        email: "priya@school.com",
        classId: createdClasses[0].id,
        rollNumber: "10A002",
        dateOfBirth: new Date("2007-06-20"),
        address: "456 Park Avenue, City",
      },
      {
        name: "Rahul Verma",
        email: "rahul@school.com",
        classId: createdClasses[1].id,
        rollNumber: "10B001",
        dateOfBirth: new Date("2007-04-10"),
        address: "789 Oak Street, City",
      },
      {
        name: "Ananya Singh",
        email: "ananya@school.com",
        classId: createdClasses[1].id,
        rollNumber: "10B002",
        dateOfBirth: new Date("2007-07-25"),
        address: "321 Pine Road, City",
      },
    ];

    const createdStudents = [];
    for (const student of students) {
      const password = await hash("student123", 10);
      const user = await prisma.user.upsert({
        where: { email: student.email },
        update: {},
        create: {
          email: student.email,
          name: student.name,
          password,
          role: UserRole.STUDENT,
        },
      });

      const createdStudent = await prisma.student.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          classId: student.classId,
          rollNumber: student.rollNumber,
          dateOfBirth: student.dateOfBirth,
          address: student.address,
        },
      });

      createdStudents.push(createdStudent);
    }

    // Create timetable entries
    const timeSlots = [
      {
        startTime: new Date().setHours(8, 0, 0, 0),
        endTime: new Date().setHours(8, 45, 0, 0),
      },
      {
        startTime: new Date().setHours(8, 50, 0, 0),
        endTime: new Date().setHours(9, 35, 0, 0),
      },
      {
        startTime: new Date().setHours(9, 40, 0, 0),
        endTime: new Date().setHours(10, 25, 0, 0),
      },
      {
        startTime: new Date().setHours(10, 40, 0, 0),
        endTime: new Date().setHours(11, 25, 0, 0),
      },
      {
        startTime: new Date().setHours(11, 30, 0, 0),
        endTime: new Date().setHours(12, 15, 0, 0),
      },
      {
        startTime: new Date().setHours(12, 20, 0, 0),
        endTime: new Date().setHours(13, 5, 0, 0),
      },
    ];

    const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday

    for (const cls of createdClasses) {
      for (const day of daysOfWeek) {
        for (const [index, timeSlot] of timeSlots.entries()) {
          const subjectIndex = index % createdSubjects.length;
          const teacherIndex = index % createdTeachers.length;

          await prisma.timetableEntry.create({
            data: {
              classId: cls.id,
              subjectId: createdSubjects[subjectIndex].id,
              teacherId: createdTeachers[teacherIndex].id,
              dayOfWeek: day,
              startTime: new Date(timeSlot.startTime).toISOString(),
              endTime: new Date(timeSlot.endTime).toISOString(),
            },
          });
        }
      }
    }

    // Create assignments
    const assignments = [
      {
        title: "Algebra Homework",
        description: "Solve quadratic equations",
        dueDate: new Date("2024-04-24"),
        status: AssignmentStatus.ACTIVE,
        classId: createdClasses[0].id,
        subjectId: createdSubjects[0].id,
        teacherId: createdTeachers[0].id,
      },
      {
        title: "Physics Lab Report",
        description: "Write report on motion experiments",
        dueDate: new Date("2024-04-25"),
        status: AssignmentStatus.ACTIVE,
        classId: createdClasses[0].id,
        subjectId: createdSubjects[1].id,
        teacherId: createdTeachers[1].id,
      },
      {
        title: "English Essay",
        description: "Write an essay on environmental conservation",
        dueDate: new Date("2024-04-28"),
        status: AssignmentStatus.ACTIVE,
        classId: createdClasses[0].id,
        subjectId: createdSubjects[3].id,
        teacherId: createdTeachers[2].id,
      },
    ];

    const createdAssignments = [];
    for (const assignment of assignments) {
      const createdAssignment = await prisma.assignment.create({
        data: assignment,
      });
      createdAssignments.push(createdAssignment);
    }

    // Create assignment submissions
    for (const student of createdStudents) {
      for (const assignment of createdAssignments) {
        await prisma.assignmentSubmission.create({
          data: {
            assignmentId: assignment.id,
            studentId: student.id,
            submittedAt: new Date(),
            grade: Math.floor(Math.random() * 100),
          },
        });
      }
    }

    // Create grades
    for (const student of createdStudents) {
      for (const subject of createdSubjects) {
        await prisma.grade.create({
          data: {
            name: "Term Exam",
            studentId: student.id,
            subjectId: subject.id,
            teacherId: createdTeachers[0].id,
            score: Math.floor(Math.random() * 100),
            maxScore: 100,
            remarks: "Good performance",
          },
        });
      }
    }

    // Create events
    const events = [
      {
        title: "Annual Sports Day",
        description: "Participate in various sports competitions",
        startDate: new Date("2024-04-25"),
        endDate: new Date("2024-04-25"),
        adminId: adminProfile.id,
      },
      {
        title: "Mathematics Quiz",
        description: "Inter-class mathematics quiz competition",
        startDate: new Date("2024-04-24"),
        endDate: new Date("2024-04-24"),
        adminId: adminProfile.id,
      },
      {
        title: "Science Exhibition",
        description: "Showcase your science projects",
        startDate: new Date("2024-04-30"),
        endDate: new Date("2024-04-30"),
        adminId: adminProfile.id,
      },
    ];

    for (const event of events) {
      await prisma.event.create({
        data: event,
      });
    }

    // Create attendance sessions for the last 6 months
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (
      let date = new Date(sixMonthsAgo);
      date <= today;
      date.setDate(date.getDate() + 1)
    ) {
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const cls of createdClasses) {
        const attendanceSession = await prisma.attendanceSession.create({
          data: {
            classId: cls.id,
            date: new Date(date),
          },
        });

        // Create attendance records for students
        for (const student of createdStudents) {
          if (student.classId === cls.id) {
            // Higher attendance rate during exam periods
            const isExamPeriod = date.getMonth() === 3 || date.getMonth() === 9; // April and October
            const attendanceRate = isExamPeriod ? 0.95 : 0.85;

            await prisma.attendance.create({
              data: {
                sessionId: attendanceSession.id,
                studentId: student.id,
                teacherId: createdTeachers[0].id,
                status:
                  Math.random() > 1 - attendanceRate ? "PRESENT" : "ABSENT",
              },
            });
          }
        }
      }
    }

    console.log("Seed data created successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
