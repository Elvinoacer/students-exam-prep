"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, UploadCloud, Calendar, ShieldCheck, Github } from "lucide-react";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <main className="min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col min-h-screen">
        
        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto text-center py-12 sm:py-16 md:py-20">
            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-5 sm:space-y-6 md:space-y-8"
            >
                <motion.div variants={item} className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500 animate-pulse" />
                    v2.0 Now Live
                </motion.div>

                <motion.h1 variants={item} className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                    Master Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                        Computer Science
                    </span> Exams
                </motion.h1>

                <motion.p variants={item} className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
                    The ultimate community-driven resource hub. Access past papers, 
                    share assignments, and watch lectures—all in one place.
                </motion.p>

                <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
                    <Link 
                        href="/units"
                        className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-black text-sm sm:text-base font-bold rounded-xl overflow-hidden hover:scale-105 transition-transform"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                           Start Learning <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link 
                        href="/upload"
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 text-white text-sm sm:text-base font-medium rounded-xl hover:bg-white/10 transition-colors backdrop-blur-sm text-center"
                    >
                        Contribute Resource
                    </Link>
                </motion.div>
            </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 pb-12 sm:pb-16 md:pb-20"
        >
            <FeatureCard 
                icon={<BookOpen className="text-indigo-400" size={24} />}
                title="Structured Units"
                desc="Organized by Year > Unit > Topic. Find exactly what you need in seconds."
                delay={0}
            />
            <FeatureCard 
                icon={<UploadCloud className="text-purple-400" size={24} />}
                title="Community Uploads"
                desc="Share your notes and solutions. Help your peers and get recognized."
                delay={0.1}
            />
            <FeatureCard 
                icon={<Calendar className="text-pink-400" size={24} />}
                title="Exam Timetables"
                desc="Never miss a dateline. View official exam schedules directly on the dashboard."
                delay={0.2}
            />
        </motion.div>

        <footer className="py-5 sm:py-6 md:py-8 text-center text-xs sm:text-sm text-gray-600 border-t border-white/5">
            <p>© {new Date().getFullYear()} GTSS Computer Science. Built by Students, for Students.</p>
        </footer>

      </div>
    </main>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + delay }}
            className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm"
        >
            <div className="mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/5 flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1.5 sm:mb-2">{title}</h3>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed text-gray-400">
                {desc}
            </p>
        </motion.div>
    )
}
