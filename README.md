Eduvia — A production-ready online learning platform (Alison.com-style)

Eduvia is a full-featured Learning Management System built with Next.js 16
(App Router), TypeScript, Material UI, Tailwind CSS, Prisma, and SQLite.
It supports students, instructors, and administrators with course discovery,
enrollment, text-based lessons, quizzes, progress tracking, certificates,
reviews, notifications, search, and an instructor course builder.

────────────────────────────────────────────────────────────────────────────
TECH STACK
────────────────────────────────────────────────────────────────────────────
  • Framework:   Next.js 16 (App Router, Turbopack)
  • Language:    TypeScript (strict)
  • UI:          Material UI (MUI) + Tailwind CSS v4
  • Validation:  Zod + React Hook Form
  • Database:    Prisma ORM + SQLite (better-sqlite3 adapter)
  • Mail:        Nodemailer (SMTP)
  • Charts:      Lightweight custom SVG components (no heavy chart lib)
  • PDF:         pdfkit (certificate generation)
  • Icons:       Lucide

────────────────────────────────────────────────────────────────────────────
PREREQUISITES
────────────────────────────────────────────────────────────────────────────
  • Node.js 18.18+ (Node 20+ recommended)
  • npm (or pnpm/yarn)

────────────────────────────────────────────────────────────────────────────
QUICK START
────────────────────────────────────────────────────────────────────────────
  1. Install dependencies
       npm install

  2. Configure environment
       cp .env.example .env
       # Edit .env and set DATABASE_URL, SMTP_*, JWT_SECRET, etc.

  3. Create / sync the database schema
       npx prisma db push

  4. Seed the database with demo data
       npm run seed

  5. Run the development server
       npm run dev
     Open http://localhost:3000

  Or run a production build:
       npm run build
       npm start

────────────────────────────────────────────────────────────────────────────
DEMO ACCOUNTS (after running `npm run seed`)
────────────────────────────────────────────────────────────────────────────
  Admin:      admin@example.com     / Password123!
  Instructor: instructor@example.com / Password123!
  Student:    student@example.com    / Password123!

  Note: demo passwords are hashed; do not use these in production.

────────────────────────────────────────────────────────────────────────────
AVAILABLE SCRIPTS
────────────────────────────────────────────────────────────────────────────
  npm run dev      Start the dev server (Turbopack)
  npm run build    Production build (type-checks the whole app)
  npm run start    Serve the production build
  npm run lint     ESLint
  npm run seed     Reset + populate the SQLite database with demo data
  npx prisma studio  Visual database browser

────────────────────────────────────────────────────────────────────────────
PROJECT STRUCTURE
────────────────────────────────────────────────────────────────────────────
  src/
    app/                 # App Router routes (pages + API route handlers)
      (auth)/            # login, register, forgot/reset password, verify email
      api/               # REST API route handlers
      admin/             # admin dashboard + management pages
      instructor/        # instructor dashboard + course builder
      student/           # student dashboard, my-learning, certificates, etc.
      courses/           # public catalog, course detail, learn/lesson/quiz
      search/ about/ faq/ contact/ privacy/ terms/ help/   # public pages
    components/          # UI components (layout, courses, charts, forms)
    lib/
      db.ts              # Prisma client singleton
      auth.ts            # session (JWT in httpOnly cookie), password hashing
      auth-guard.ts      # role-based guards
      mailer.ts          # nodemailer transporter + email templates
      format.ts          # date/duration/number formatting helpers
      services/          # business logic (courses, quizzes, certificates,
                         #   users, notifications, audit, reviews, search…)
      schemas/           # Zod validation schemas
    types/               # shared TypeScript types
  prisma/
    schema.prisma        # data model
    seed.ts              # demo data seeder

────────────────────────────────────────────────────────────────────────────
KEY FEATURES
────────────────────────────────────────────────────────────────────────────
  • Authentication with role-based access (ADMIN / INSTRUCTOR / STUDENT + guest)
  • Course catalog with search, filtering, categories, and featured courses
  • Text-based lessons, module/lesson progress tracking, lesson notes & bookmarks
  • Quizzes with auto-grading, multiple attempts, and passing thresholds
  • Automatic certificate issuance on course completion (PDF + public verify page)
  • Instructor course builder: create courses, modules, lessons, and quizzes
  • Submission → review → approval workflow for instructor courses
  • Reviews & ratings with moderation
  • Student dashboard: my-learning, wishlist, notifications, notes, settings
  • Admin: users, courses, categories, certificates, analytics, support,
    audit logs, and instructor-application approval
  • Email notifications (welcome, quiz result, certificate, instructor approval)
  • Responsive design + light/dark theme
  • Public static pages: about, FAQ, contact/support, privacy, terms, help

────────────────────────────────────────────────────────────────────────────
DATABASE NOTES
────────────────────────────────────────────────────────────────────────────
  • Uses SQLite by default (file:./dev.db). Swap to Postgres/MySQL by changing
    the provider + DATABASE_URL in prisma/schema.prisma and reinstalling the
    matching Prisma driver adapter.
  • After changing the schema run:  npx prisma db push
  • To reset all data and reseed:    npm run seed

────────────────────────────────────────────────────────────────────────────
EMAIL / SMTP
────────────────────────────────────────────────────────────────────────────
  Email sending is best-effort. If SMTP is not configured, the app logs the
  intended email and continues (no crashes). Set SMTP_HOST/PORT/USER/PASS and
  SMTP_FROM in .env to enable real delivery.

────────────────────────────────────────────────────────────────────────────
LICENSE
────────────────────────────────────────────────────────────────────────────
  MIT — free to use and modify.
