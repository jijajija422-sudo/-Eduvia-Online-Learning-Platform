import { Sidebar } from "@/components/layout/Sidebar";
import { requireStudent } from "@/lib/auth-guard";
import { Search, Bell, MessageSquare, ChevronDown } from "lucide-react";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStudent();

  return (
    <div className="min-h-screen bg-[#f4f7fe]">
      <Sidebar role="STUDENT" user={user} />
      
      {/* Main Content */}
      <div className="md:pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-[80px] bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div className="hidden md:flex items-center bg-[#f4f7fe] px-4 py-2.5 rounded-full w-full max-w-md">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search for courses, lessons, quizzes..." 
              className="bg-transparent border-none outline-none w-full text-sm placeholder:text-gray-400 text-gray-700"
            />
          </div>
          <div className="flex-1 md:hidden"></div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#6c5dd3]"></span>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
              <MessageSquare className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=6c5dd3&color=fff`} alt={user.firstName} className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" />
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-800 leading-tight">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 font-medium">Student</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
