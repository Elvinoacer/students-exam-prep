import Link from "next/link";
import { Calendar, PenTool, Layers, FolderOpen, ListChecks, ArrowRight, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const adminLinks = [
    {
      title: "Manage Timetables",
      description: "Upload and update exam timetable banners for each year.",
      href: "/admin/timetable",
      icon: <Calendar size={20} className="sm:w-6 sm:h-6" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Create Assignment",
      description: "Post new assignments and official solutions for students.",
      href: "/admin/assignment",
      icon: <PenTool size={20} className="sm:w-6 sm:h-6" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Manage Structure",
      description: "Create or delete Years and Units.",
      href: "/admin/structure",
      icon: <Layers size={20} className="sm:w-6 sm:h-6" />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Manage Resources",
      description: "View and delete uploaded notes, past papers, and links.",
      href: "/admin/resources",
      icon: <FolderOpen size={20} className="sm:w-6 sm:h-6" />,
      gradient: "from-orange-500 to-amber-500",
    },
    {
      title: "Manage Assignments",
      description: "List all assignments and remove outdated ones.",
      href: "/admin/assignments",
      icon: <ListChecks size={20} className="sm:w-6 sm:h-6" />,
      gradient: "from-red-500 to-rose-500",
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4 border-b border-white/10 pb-4 sm:pb-6">
            <div>
               <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-1 sm:mb-2 text-white">Dashboard Overview</h1>
               <p className="text-gray-400 text-sm sm:text-lg">Control center for exam resources and student content.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-medium">
                <TrendingUp size={14} className="sm:w-4 sm:h-4" />
                <span>System Active</span>
            </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {adminLinks.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <div className={`absolute top-0 right-0 p-24 sm:p-32 bg-gradient-to-br ${link.gradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-full blur-3xl -mr-16 -mt-16`} />
              
              <div className="relative z-10">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${link.gradient} flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg`}>
                      {link.icon}
                  </div>
                  
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{link.title}</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {link.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white group-hover:translate-x-1 transition-transform">
                      Open Tool <ArrowRight size={14} className="sm:w-4 sm:h-4 opacity-50 group-hover:opacity-100" />
                  </div>
              </div>
            </Link>
          ))}
        </div>
    </div>
  );
}
