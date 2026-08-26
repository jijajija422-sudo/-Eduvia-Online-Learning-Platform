import { z } from "zod";

// ─── Auth Schemas ─────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and a number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and a number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and a number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Profile Schemas ──────────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  expertise: z.array(z.string()).optional(),
});

// ─── Course Schemas ───────────────────────────────────────────────────────

export const courseCreateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  shortDescription: z
    .string()
    .min(20, "Short description must be at least 20 characters")
    .max(500),
  fullDescription: z
    .string()
    .min(50, "Full description must be at least 50 characters"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  estimatedDuration: z.number().int().min(1),
  language: z.string().default("en"),
  learningObjectives: z.array(z.string()).min(1, "Add at least one objective"),
  prerequisites: z.array(z.string()).optional().default([]),
  skillsGained: z.array(z.string()).optional().default([]),
  thumbnail: z.string().optional(),
});

export const courseUpdateSchema = courseCreateSchema.partial();

// ─── Module / Lesson Schemas ──────────────────────────────────────────────

export const moduleSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().max(500).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export const lessonSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(1, "Lesson content is required"),
  estimatedMinutes: z.number().int().min(1).max(480),
  isPreview: z.boolean().optional().default(false),
  isRequired: z.boolean().optional().default(true),
  orderIndex: z.number().int().min(0).optional(),
});

// ─── Quiz Schemas ─────────────────────────────────────────────────────────

export const quizSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  passingScore: z.number().int().min(1).max(100).default(70),
  maxAttempts: z.number().int().min(1).max(10).default(3),
  timeLimit: z.number().int().min(1).optional().nullable(),
  randomizeQuestions: z.boolean().optional().default(false),
  randomizeAnswers: z.boolean().optional().default(false),
  showCorrectAnswers: z.boolean().optional().default(true),
  showExplanations: z.boolean().optional().default(true),
  isFinalAssessment: z.boolean().optional().default(false),
});

export const questionSchema = z.object({
  text: z.string().min(5, "Question must be at least 5 characters"),
  type: z.enum([
    "MULTIPLE_CHOICE",
    "MULTIPLE_ANSWER",
    "TRUE_FALSE",
    "SHORT_ANSWER",
  ]),
  explanation: z.string().optional(),
  points: z.number().int().min(1).default(1),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
        isCorrect: z.boolean(),
      })
    )
    .optional(),
});

// ─── Review Schema ────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().max(2000).optional(),
});

// ─── Note Schema ──────────────────────────────────────────────────────────

export const noteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(5000),
  lessonId: z.string().min(1),
});

// ─── Category Schemas ─────────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
});

export const subcategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().min(1),
});

// ─── Newsletter Schema ────────────────────────────────────────────────────

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ─── Support Ticket Schema ────────────────────────────────────────────────

export const supportTicketSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
  subject: z.string().min(5).max(200),
  category: z.string().min(1).default("GENERAL"),
  message: z.string().min(20).max(5000),
});

// ─── Settings Schema ──────────────────────────────────────────────────────

export const platformSettingsSchema = z.object({
  platformName: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  contactEmail: z.string().email().optional(),
  supportEmail: z.string().email().optional(),
  allowRegistration: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
  requireCourseApproval: z.boolean().optional(),
  allowReviews: z.boolean().optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
