import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, Award, Clock, CheckCircle, ChevronRight, ChevronDown, Menu, MoreVertical, Calendar as CalendarIcon, Megaphone, Settings } from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.id },
    include: {
      course: {
        include: {
          category: true
        }
      }
    },
    orderBy: { lastAccessedAt: 'desc' }
  });

  const activeCourses = enrollments.filter(e => e.status !== "COMPLETED");
  
  // Dummy data for visuals
  const topCourses = activeCourses.slice(0, 3);
  const myCourses = enrollments.slice(0, 4);

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Left Column (Main Content) */}
      <div className="flex-1 flex flex-col gap-8">
        
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-bold text-gray-800 tracking-tight flex items-center gap-2">
            Welcome back, {session.firstName} {session.lastName}! <span className="text-3xl">👋</span>
          </h1>
          <p className="text-gray-500 mt-1">Keep learning, keep growing.</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-[32px] font-bold text-gray-800 leading-none">12</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
              <Link href="#" className="text-xs font-semibold text-indigo-500 flex items-center gap-1 hover:underline">View all <ChevronRight className="h-3 w-3"/></Link>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <span className="text-[32px] font-bold text-gray-800 leading-none">24</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-medium text-gray-500">Completed Lessons</p>
              <Link href="#" className="text-xs font-semibold text-indigo-500 flex items-center gap-1 hover:underline">View progress <ChevronRight className="h-3 w-3"/></Link>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
                <Award className="h-6 w-6" />
              </div>
              <span className="text-[32px] font-bold text-gray-800 leading-none">5</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-medium text-gray-500">Certificates Earned</p>
              <Link href="#" className="text-xs font-semibold text-indigo-500 flex items-center gap-1 hover:underline">View all <ChevronRight className="h-3 w-3"/></Link>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <span className="text-[32px] font-bold text-gray-800 leading-none">48</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-medium text-gray-500">Hours Learned</p>
              <Link href="#" className="text-xs font-semibold text-indigo-500 flex items-center gap-1 hover:underline">This month <ChevronRight className="h-3 w-3"/></Link>
            </div>
          </div>
        </div>

        {/* Continue Learning */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Continue Learning</h2>
            <Link href="#" className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            {topCourses.map((enrollment, index) => {
              const course: any = enrollment.course;
              // Provide some default images since we might not have thumbnails yet
              const images = [
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600&h=300",
                "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600&h=300",
                "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600&h=300"
              ];
              const image = images[index % images.length];

              return (
                <div key={enrollment.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="h-36 w-full relative overflow-hidden group">
                    <img src={image} alt={course.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20"></div>
                    {/* Progress Circle Mock */}
                    <div className="absolute top-3 right-3 h-10 w-10 rounded-full border-[3px] border-white/30 flex items-center justify-center backdrop-blur-sm">
                      <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                        <circle cx="17" cy="17" r="15" fill="none" stroke="white" strokeWidth="3" strokeDasharray={`${enrollment.progress} 100`} />
                      </svg>
                      <span className="text-[10px] font-bold text-white">{enrollment.progress}%</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-indigo-500 mb-1">{course.category?.name || "Category"}</p>
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-1 mb-3">{course.title}</h3>
                    
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                    </div>
                    <p className="text-[11px] font-medium text-gray-400">
                      {Math.round((enrollment.progress/100) * (course.estimatedDuration/30))} / {course.estimatedDuration/30} Lessons
                    </p>
                  </div>
                </div>
              );
            })}
            
            <button className="absolute -right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 z-10 hidden md:flex">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* My Courses */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Courses</h2>
          
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 mb-6 pb-2">
            <div className="flex space-x-6">
              <button className="text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 pb-2 -mb-[9px]">All Courses</button>
              <button className="text-sm font-medium text-gray-400 hover:text-gray-600 pb-2 -mb-[9px]">In Progress</button>
              <button className="text-sm font-medium text-gray-400 hover:text-gray-600 pb-2 -mb-[9px]">Completed</button>
              <button className="text-sm font-medium text-gray-400 hover:text-gray-600 pb-2 -mb-[9px]">Saved</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 bg-white cursor-pointer hover:bg-gray-50">
                Latest Access
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded"><Menu className="h-4 w-4"/></button>
                <button className="p-1.5 bg-indigo-500 text-white rounded shadow-sm"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z"/></svg></button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {myCourses.map((enrollment, index) => {
              const course: any = enrollment.course;
              const images = [
                "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=400&h=300",
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400&h=300",
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400&h=300",
                "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400&h=300"
              ];
              const image = images[index % images.length];

              return (
                <div key={enrollment.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                  <div className="h-32 w-full relative">
                    <img src={image} alt={course.title} className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 text-white/80 hover:text-white">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs font-semibold text-indigo-500 mb-1">{course.category?.name || "Category"}</p>
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-3 leading-tight flex-1">{course.title}</h3>
                    
                    <div className="w-full bg-gray-100 rounded-full h-1 mb-2 mt-auto">
                      <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                    </div>
                    <p className="text-[11px] font-medium text-gray-400">
                      {course.estimatedDuration/30} Lessons
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Column (Sidebar Widgets) */}
      <div className="w-full xl:w-[320px] flex flex-col gap-6">
        
        {/* Upcoming */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-800">Upcoming</h3>
            <button className="text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50">View calendar</button>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <span className="text-[10px] font-bold uppercase">May</span>
                <span className="text-lg font-bold leading-none">26</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 leading-tight">UI/UX Quiz</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">UI/UX Design Fundamentals</p>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>10:00 AM</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <span className="text-[10px] font-bold uppercase">May</span>
                <span className="text-lg font-bold leading-none">28</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 leading-tight">Marketing Assignment</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Introduction to Marketing</p>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>11:59 PM</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <span className="text-[10px] font-bold uppercase">May</span>
                <span className="text-lg font-bold leading-none">30</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 leading-tight">Live Session</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Python for Beginners</p>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>07:00 PM</span>
                </div>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-5 text-sm font-semibold text-indigo-600 flex items-center justify-center gap-1 hover:underline">
            View all upcoming <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-800">Announcements</h3>
            <button className="text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50">View all</button>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 leading-tight">New course available!</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Data Science Basics is now live.</p>
                <span className="text-[10px] text-gray-400 mt-1 block">2 days ago</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 leading-tight">Maintenance Notice</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">System maintenance on May 28, 12:00 AM - 2:00 AM.</p>
                <span className="text-[10px] text-gray-400 mt-1 block">5 days ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-5">Learning Progress</h3>
          
          <div className="flex items-center justify-between">
            {/* SVG Doughnut Mock */}
            <div className="relative h-28 w-28 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="text-indigo-500"
                  strokeDasharray="65, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="text-sky-500"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-65"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-800 leading-none">65%</span>
                <span className="text-[8px] font-medium text-gray-400 uppercase tracking-widest mt-1">Overall Progress</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  <span className="text-xs font-medium text-gray-600">Completed</span>
                </div>
                <span className="text-xs font-bold text-gray-800">65%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  <span className="text-xs font-medium text-gray-600">In Progress</span>
                </div>
                <span className="text-xs font-bold text-gray-800">25%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gray-200"></span>
                  <span className="text-xs font-medium text-gray-600">Not Started</span>
                </div>
                <span className="text-xs font-bold text-gray-800">10%</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 text-sm font-semibold text-indigo-600 flex items-center justify-center gap-1 hover:underline">
            View full progress <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
