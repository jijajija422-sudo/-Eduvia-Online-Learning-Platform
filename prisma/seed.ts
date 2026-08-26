import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import "dotenv/config";

const url = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // 1. Clean up existing data (in case of re-seed)
  await prisma.enrollment.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.review.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
      isVerified: true,
      isActive: true,
      bio: "System Administrator",
    },
  });

  const instructor = await prisma.user.create({
    data: {
      firstName: "Jane",
      lastName: "Instructor",
      email: "instructor@example.com",
      passwordHash,
      role: "INSTRUCTOR",
      isVerified: true,
      isActive: true,
      bio: "Expert Web Developer and Educator with 10+ years of experience.",
      expertise: JSON.stringify(["Web Development", "React", "Next.js"]),
    },
  });

  const student = await prisma.user.create({
    data: {
      firstName: "John",
      lastName: "Student",
      email: "student@example.com",
      passwordHash,
      role: "STUDENT",
      isVerified: true,
      isActive: true,
      bio: "Lifelong learner.",
    },
  });

  console.log("Users created.");

  // 3. Create Categories
  const categoryWebDev = await prisma.category.create({
    data: {
      name: "Web Development",
      slug: "web-development",
      description: "Learn to build modern web applications.",
      icon: "Code",
      orderIndex: 1,
    },
  });

  const subcategoryReact = await prisma.subcategory.create({
    data: {
      name: "React",
      slug: "react",
      description: "Frontend library for building user interfaces.",
      categoryId: categoryWebDev.id,
      orderIndex: 1,
    },
  });

  console.log("Categories created.");

  // 4. Create Course
  const courseTitle = "Next.js 16 Mastery";
  const course = await prisma.course.create({
    data: {
      title: courseTitle,
      slug: slugify(courseTitle, { lower: true }),
      shortDescription:
        "Master the latest features of Next.js 16 including App Router and Server Actions.",
      fullDescription:
        "This comprehensive course covers everything you need to know to build production-ready applications with Next.js 16. You will learn about the App Router, data fetching, server components, and much more.",
      categoryId: categoryWebDev.id,
      subcategoryId: subcategoryReact.id,
      instructorId: instructor.id,
      difficulty: "INTERMEDIATE",
      estimatedDuration: 120, // 2 hours
      status: "PUBLISHED",
      publishedAt: new Date(),
      learningObjectives: JSON.stringify([
        "Understand the App Router architecture",
        "Build secure authentication systems",
        "Deploy applications to production",
      ]),
      prerequisites: JSON.stringify([
        "Basic knowledge of React",
        "Familiarity with TypeScript",
      ]),
      skillsGained: JSON.stringify(["Next.js", "React", "TypeScript", "Prisma"]),
      isFeatured: true,
    },
  });

  // 5. Create Modules and Lessons
  const module1 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Introduction to Next.js",
      description: "Getting started with the framework.",
      orderIndex: 1,
    },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "What is Next.js?",
      slug: "what-is-next-js",
      content:
        "<h1>What is Next.js?</h1><p>Next.js is a React framework for building full-stack web applications. You use React Components to build user interfaces, and Next.js for additional features and optimizations.</p>",
      estimatedMinutes: 5,
      orderIndex: 1,
      isPreview: true,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "Routing Fundamentals",
      slug: "routing-fundamentals",
      content:
        "<h1>Routing Fundamentals</h1><p>The App Router works in a new directory named <code>app</code>. It supports shared layouts, nested routing, loading states, error handling, and more.</p>",
      estimatedMinutes: 10,
      orderIndex: 2,
    },
  });

  // 6. Create a Quiz
  const quiz1 = await prisma.quiz.create({
    data: {
      moduleId: module1.id,
      courseId: course.id,
      title: "Module 1 Quiz",
      passingScore: 50,
      maxAttempts: 3,
      isFinalAssessment: false,
      orderIndex: 3,
    },
  });

  const question1 = await prisma.question.create({
    data: {
      quizId: quiz1.id,
      text: "Which directory is used for the new App Router?",
      type: "MULTIPLE_CHOICE",
      points: 10,
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      { questionId: question1.id, text: "pages", isCorrect: false, orderIndex: 1 },
      { questionId: question1.id, text: "app", isCorrect: true, orderIndex: 2 },
      { questionId: question1.id, text: "src", isCorrect: false, orderIndex: 3 },
    ],
  });

  console.log("Course, modules, lessons, and quiz created.");

  // 7. Create Enrollment and Progress for the student
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      status: "ACTIVE",
      progress: 50, // 1 out of 2 lessons completed
      lastLessonId: lesson2.id,
      lastAccessedAt: new Date(),
    },
  });

  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      lessonId: lesson1.id,
      status: "COMPLETED",
      timeSpent: 300,
      completedAt: new Date(),
    },
  });
  
  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      lessonId: lesson2.id,
      status: "IN_PROGRESS",
      timeSpent: 120,
    },
  });

  console.log("Enrollment and progress created.");

  // 8. Second category + second published course (richer demo catalog)
  const categoryData = await prisma.category.create({
    data: {
      name: "Data Science",
      slug: "data-science",
      description: "Master data analysis, ML, and statistics.",
      icon: "BarChart",
      orderIndex: 2,
    },
  });

  const course2Title = "Data Structures in Python";
  const course2 = await prisma.course.create({
    data: {
      title: course2Title,
      slug: slugify(course2Title, { lower: true }),
      shortDescription:
        "Understand lists, stacks, queues, trees, and graphs with hands-on Python examples.",
      fullDescription:
        "A practical introduction to fundamental data structures using Python. You will implement and analyze lists, stacks, queues, hash maps, trees, and graphs, and learn when to use each one in real applications.",
      categoryId: categoryData.id,
      instructorId: instructor.id,
      difficulty: "BEGINNER",
      estimatedDuration: 90,
      status: "PUBLISHED",
      publishedAt: new Date(),
      learningObjectives: JSON.stringify([
        "Implement core data structures in Python",
        "Analyze time and space complexity",
        "Choose the right structure for a problem",
      ]),
      prerequisites: JSON.stringify(["Basic Python syntax"]),
      skillsGained: JSON.stringify(["Python", "Algorithms", "Problem Solving"]),
      isFeatured: false,
    },
  });

  const module2 = await prisma.module.create({
    data: { courseId: course2.id, title: "Linear Structures", orderIndex: 1 },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Lists and Tuples",
      slug: "lists-and-tuples",
      content:
        "<h1>Lists and Tuples</h1><p>Lists are mutable ordered collections; tuples are immutable. Choose based on whether the data should change.</p>",
      estimatedMinutes: 8,
      orderIndex: 1,
      isPreview: true,
    },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      moduleId: module2.id,
      courseId: course2.id,
      title: "Linear Structures Quiz",
      passingScore: 50,
      maxAttempts: 3,
      orderIndex: 2,
    },
  });
  const q2 = await prisma.question.create({
    data: { quizId: quiz2.id, text: "Which is immutable?", type: "MULTIPLE_CHOICE", points: 10, orderIndex: 1 },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: q2.id, text: "list", isCorrect: false, orderIndex: 1 },
      { questionId: q2.id, text: "tuple", isCorrect: true, orderIndex: 2 },
    ],
  });

  // 9. A sample approved review on the first course
  await prisma.review.create({
    data: {
      userId: student.id,
      courseId: course.id,
      rating: 5,
      content: "Clear, practical, and well-paced. Exactly what I needed.",
      status: "APPROVED",
    },
  });

  console.log("Second course, quiz, and review created.");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
