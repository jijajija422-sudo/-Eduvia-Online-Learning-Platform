import { requireInstructor } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import CourseBuilder from "./CourseBuilder";

export default async function InstructorCourseManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireInstructor();
  const { id } = await params;
  const course = await db.course.findUnique({ where: { id } });
  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) {
    notFound();
  }
  return <CourseBuilder courseId={id} />;
}
