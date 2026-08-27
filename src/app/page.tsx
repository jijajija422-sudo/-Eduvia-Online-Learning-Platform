import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { db } from "@/lib/db";
import { CourseCard } from "@/components/courses/CourseCard";
import { ShieldCheck } from "lucide-react";

export default async function Home() {
  const [popular] = await Promise.all([
    db.course.findMany({ where: { status: "PUBLISHED" }, orderBy: { enrollmentCount: "desc" }, take: 4, include: courseInclude() }),
  ]);

  const showCourses = popular.length ? popular : [];

  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-12 pb-24 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              
              {/* Hero Left */}
              <div className="lg:w-1/2 z-10">
                <h1 className="text-5xl lg:text-[72px] font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-6">
                  Move beyond<br />the limitations of<br />e-Learning.
                </h1>
                <p className="text-lg text-slate-500 mb-10 font-medium">
                  Anytime, anywhere to discover yourself.
                </p>
                <div className="flex items-center gap-8">
                  <Link href="/courses" className="rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all">
                    Get Started
                  </Link>
                  <Link href="/instructor" className="text-sm font-bold text-slate-900 underline underline-offset-[6px] decoration-2 hover:text-blue-600 transition-colors">
                    Become an Instructor
                  </Link>
                </div>
              </div>

              {/* Hero Right - Composition */}
              <div className="lg:w-1/2 relative h-[550px] w-full">
                {/* Yellow circle background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-amber-400 rounded-full mix-blend-multiply opacity-20"></div>
                
                {/* Main Hero Image placeholder */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-[320px] h-[450px] bg-amber-400 rounded-t-full rounded-b-3xl overflow-hidden border-8 border-white shadow-2xl relative">
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center"></div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute top-16 left-8 z-20 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 w-48">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="h-full w-full rounded-full" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Largest collection in</p>
                    <p className="text-xs font-bold text-slate-800 leading-tight">every courses</p>
                  </div>
                </div>

                <div className="absolute top-12 right-12 z-20 bg-white p-4 rounded-3xl shadow-xl text-center w-36">
                  <span className="inline-block bg-pink-100 text-pink-500 text-[9px] font-extrabold px-2 py-0.5 rounded-full mb-2">NEW</span>
                  <p className="text-[10px] font-bold text-slate-800 leading-tight">Get 20% off in every courses</p>
                </div>

                <div className="absolute bottom-16 right-16 z-20 bg-white p-5 rounded-[2rem] shadow-xl text-center min-w-[140px]">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
                  <p className="text-3xl font-extrabold text-slate-800 mb-2">15k</p>
                  <div className="flex justify-center -space-x-2">
                     <img src="https://i.pravatar.cc/150?img=32" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                     <img src="https://i.pravatar.cc/150?img=12" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                     <img src="https://i.pravatar.cc/150?img=42" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                     <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[9px] text-white font-bold">+</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Row */}
        <section className="bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between py-6 gap-6 max-w-5xl mx-auto border-t border-b border-slate-200/50">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                </span>
                <span className="font-bold text-sm text-slate-700">Online tutoring</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                </span>
                <span className="font-bold text-sm text-slate-700">Lifetime Access</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                </span>
                <span className="font-bold text-sm text-slate-700">Active learning</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </span>
                <span className="font-bold text-sm text-slate-700">10k courses</span>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Courses */}
        {showCourses.length > 0 && (
          <section className="py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
              <div className="mb-12">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Most Popular Courses</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {showCourses.map((c: any) => <CourseCard key={c.id} course={c} />)}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials (What our Clients Say) */}
        <section className="py-16 bg-white overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              {/* Left visual */}
              <div className="lg:w-[45%] relative">
                <div className="rounded-[2.5rem] overflow-hidden aspect-[4/5] relative">
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" alt="Students learning" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/10"></div>
                </div>
                
                {/* Floating card */}
                <div className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-72 z-10 hidden md:block">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-5">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="text-[17px] font-bold text-slate-900 mb-3 leading-tight">100% Safe & Secured</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Build a course, build a brand, build a business. Here is what Teachable</p>
                </div>
              </div>

              {/* Right content */}
              <div className="lg:w-[55%] lg:pl-16">
                <h2 className="text-[32px] font-extrabold text-slate-900 mb-10">What our Clients Say</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                  {/* Card 1 */}
                  <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-50 relative z-10">
                    <p className="text-[13px] text-slate-500 leading-[1.8] font-medium mb-8">
                      "You only have to know one thing that, you can learn anything Anytime, anywhere to do you discover yourself. Our content will help you every step."
                    </p>
                    <div className="flex items-center gap-3">
                      <img src="https://i.pravatar.cc/150?img=68" alt="Cody Fisher" className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Cody Fisher</h4>
                        <p className="text-[11px] text-slate-400 font-bold">Student</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-50 relative top-10 z-0">
                    <p className="text-[13px] text-slate-500 leading-[1.8] font-medium mb-8">
                      "You only have to know one thing that, you can learn anything Anytime, anywhere to do you discover yourself. Our content will help you every step."
                    </p>
                    <div className="flex items-center gap-3">
                      <img src="https://i.pravatar.cc/150?img=47" alt="Dianne Russell" className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Dianne Russell</h4>
                        <p className="text-[11px] text-slate-400 font-bold">Student</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 mt-10 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-[28px] font-extrabold text-slate-900 mb-8">Do you want to be an<br />instructor ?</h2>
              <Link href="/instructor" className="inline-flex items-center justify-center rounded-[14px] bg-blue-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                Join Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function courseInclude() {
  return {
    category: { select: { name: true, slug: true } },
    instructor: { select: { firstName: true, lastName: true, avatar: true } },
    _count: { select: { enrollments: true, modules: true } },
  };
}
