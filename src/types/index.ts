// Eduvia LMS — Shared TypeScript Types

// ─── User / Auth ─────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar: string | null;
  isVerified: boolean;
  isActive: boolean;
}

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  bio: string | null;
  country: string | null;
  timezone: string | null;
  language: string | null;
  expertise: string[] | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

// ─── Course ───────────────────────────────────────────────────────────────────

export type CourseStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface CourseWithDetails {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  thumbnail: string | null;
  difficulty: Difficulty;
  estimatedDuration: number;
  language: string;
  status: CourseStatus;
  isFeatured: boolean;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  learningObjectives: string[];
  prerequisites: string[];
  skillsGained: string[];
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    bio: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    modules: number;
    enrollments: number;
    reviews: number;
  };
}

// ─── Module / Lesson ─────────────────────────────────────────────────────────

export interface ModuleWithLessons {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: LessonSummary[];
  quizzes: QuizSummary[];
}

export interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  estimatedMinutes: number;
  isPreview: boolean;
  isRequired: boolean;
  orderIndex: number;
}

export interface LessonFull extends LessonSummary {
  content: string;
  moduleId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "MULTIPLE_ANSWER"
  | "TRUE_FALSE"
  | "SHORT_ANSWER";

export interface QuizSummary {
  id: string;
  title: string;
  passingScore: number;
  maxAttempts: number;
  timeLimit: number | null;
  isFinalAssessment: boolean;
  orderIndex: number;
  _count?: { questions: number };
}

export interface QuizWithQuestions extends QuizSummary {
  description: string | null;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  questions: QuestionWithOptions[];
}

export interface QuestionWithOptions {
  id: string;
  text: string;
  type: QuestionType;
  explanation: string | null;
  points: number;
  orderIndex: number;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    orderIndex: number;
  }[];
}

// ─── Enrollment / Progress ────────────────────────────────────────────────────

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "SUSPENDED" | "ABANDONED";

export interface EnrollmentWithProgress {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt: Date | null;
  progress: number;
  lastAccessedAt: Date | null;
  lastLessonId: string | null;
  course: CourseWithDetails;
}

export interface LessonProgressData {
  lessonId: string;
  status: "STARTED" | "IN_PROGRESS" | "COMPLETED";
  timeSpent: number;
  completedAt: Date | null;
}

// ─── Certificate ──────────────────────────────────────────────────────────────

export interface CertificateData {
  id: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  issuedAt: Date;
  course: {
    id: string;
    title: string;
    slug: string;
  };
}

// ─── Review ───────────────────────────────────────────────────────────────────

export type ReviewStatus = "PENDING" | "APPROVED" | "HIDDEN" | "FLAGGED";

export interface ReviewWithUser {
  id: string;
  rating: number;
  content: string | null;
  status: ReviewStatus;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "ENROLLMENT"
  | "COURSE_COMPLETION"
  | "CERTIFICATE_ISSUED"
  | "QUIZ_RESULT"
  | "COURSE_APPROVED"
  | "COURSE_REJECTED"
  | "COURSE_SUBMITTED"
  | "CHANGES_REQUESTED"
  | "NEW_COURSE"
  | "INSTRUCTOR_UPDATE"
  | "PASSWORD_CHANGED"
  | "ACCOUNT_VERIFIED"
  | "LEARNING_REMINDER"
  | "INSTRUCTOR_APPLICATION"
  | "SYSTEM";

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

// ─── API Response Helpers ─────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
