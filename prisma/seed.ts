import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import "dotenv/config";

// Prisma 7: the datasource `url` lives in prisma.config.ts. Resolve it from the
// same env vars here so the seed targets the same database as the running app.
const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "postgresql://localhost:5432/eduvia?sslmode=require";
const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // 1. Clean up existing data (in case of re-seed)
  await prisma.enrollment.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.review.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subcategory.deleteMany();
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
      firstName: "Jija",
      lastName: "Jija",
      email: "student@example.com",
      passwordHash,
      role: "STUDENT",
      isVerified: true,
      isActive: true,
      bio: "Lifelong learner.",
      avatar: "https://i.pravatar.cc/150?u=jija",
    },
  });

  console.log("Users created.");

  // 3. Create Categories
  const categoryWebDev = await prisma.category.create({
    data: { name: "Web Development", slug: "web-development", description: "Learn to build modern web applications.", orderIndex: 1 },
  });
  const categoryBusiness = await prisma.category.create({
    data: { name: "Business", slug: "business", description: "Business and marketing.", orderIndex: 2 },
  });
  const categoryDesign = await prisma.category.create({
    data: { name: "Design", slug: "design", description: "Design fundamentals.", orderIndex: 3 },
  });
  const categoryPersonalDev = await prisma.category.create({
    data: { name: "Personal Development", slug: "personal-development", description: "Improve yourself.", orderIndex: 4 },
  });
  const categoryProgramming = await prisma.category.create({
    data: { name: "Programming", slug: "programming", description: "Learn coding.", orderIndex: 5 },
  });
  const categoryLanguage = await prisma.category.create({
    data: { name: "Language", slug: "language", description: "Learn languages.", orderIndex: 6 },
  });

  console.log("Categories created.");

  // 4. Create Courses
  const coursesData = [
    {
      title: "HTML, CSS & JavaScript",
      categoryId: categoryWebDev.id,
      description: "Learn the fundamentals of web development.",
      progress: 60,
      lessons: 20,
      completedLessons: 12,
    },
    {
      title: "Introduction to Marketing",
      categoryId: categoryBusiness.id,
      description: "Basics of marketing strategies.",
      progress: 35,
      lessons: 20,
      completedLessons: 7,
    },
    {
      title: "UI/UX Design Fundamentals",
      categoryId: categoryDesign.id,
      description: "Learn the basics of UI/UX design.",
      progress: 20,
      lessons: 20,
      completedLessons: 4,
    },
    {
      title: "Time Management",
      categoryId: categoryPersonalDev.id,
      description: "How to manage your time effectively.",
      progress: 0,
      lessons: 8,
      completedLessons: 0,
    },
    {
      title: "Financial Accounting Basics",
      categoryId: categoryBusiness.id,
      description: "Basics of financial accounting.",
      progress: 0,
      lessons: 10,
      completedLessons: 0,
    },
    {
      title: "Python for Beginners",
      categoryId: categoryProgramming.id,
      description: "Learn Python from scratch.",
      progress: 0,
      lessons: 15,
      completedLessons: 0,
    },
    {
      title: "Academic English Writing",
      categoryId: categoryLanguage.id,
      description: "Improve your academic writing skills.",
      progress: 0,
      lessons: 12,
      completedLessons: 0,
    },
  ];

  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        slug: slugify(courseData.title, { lower: true }),
        shortDescription: courseData.description,
        fullDescription: courseData.description,
        categoryId: courseData.categoryId,
        instructorId: instructor.id,
        difficulty: "BEGINNER",
        estimatedDuration: courseData.lessons * 30, // 30 mins per lesson
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    const module = await prisma.module.create({
      data: {
        courseId: course.id,
        title: "Main Module",
        orderIndex: 1,
      },
    });

    // Create dummy lessons
    let lastLessonId = null;
    for (let i = 1; i <= courseData.lessons; i++) {
      const lesson = await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: `Lesson ${i}`,
          slug: `lesson-${i}`,
          content: `<p>Content for lesson ${i}</p>`,
          estimatedMinutes: 30,
          orderIndex: i,
        },
      });
      if (i === courseData.completedLessons + 1) {
          lastLessonId = lesson.id;
      }
    }

    // Enroll user and set progress
    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        status: "ACTIVE",
        progress: courseData.progress,
        lastLessonId: lastLessonId,
        lastAccessedAt: courseData.progress > 0 ? new Date() : null,
      },
    });
  }

  console.log("Courses and enrollments created.");
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
