import Link from "next/link";
import { ShieldCheck, LayoutDashboard, Home } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30 overflow-hidden relative font-sans">
      
      {/* Background Gradients (Shared) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Admin Topbar */}
      <div className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0">
          <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-indigo-600 rounded-lg">
                      <ShieldCheck size={18} className="text-white sm:w-5 sm:h-5" />
                  </div>
                  <span className="font-bold text-base sm:text-lg tracking-tight">Admin<span className="text-indigo-400">Panel</span></span>
              </div>
              
              <div className="flex items-center gap-4 text-xs sm:text-sm font-medium">
                  <Link href="/admin" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                      <LayoutDashboard size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <Link href="/" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                      <Home size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">View Site</span><span className="sm:hidden">Site</span>
                  </Link>
              </div>
          </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-10">
         {children}
      </main>
    </div>
  );
}
