"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, BookOpen, Calendar, ChevronRight } from "lucide-react";

interface Unit {
  id: string;
  name: string;
  _count: {
    resources: number;
    assignments: number;
  };
}

interface Year {
  id: string;
  name: string;
  timetable: { imageUrl: string } | null;
  units: Unit[];
}

export function UnitsGrid({ years }: { years: Year[] }) {
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredYears = years.map((year) => ({
    ...year,
    units: year.units.filter((unit) =>
      unit.name.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(year => year.units.length > 0 || search === "");

  return (
    <div className="space-y-12">
      
      {/* Search Header */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search units, topics, or years..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-lg shadow-xl"
        />
      </div>

      <div className="space-y-16">
        {filteredYears.map((year, yearIndex) => (
          (year.units.length > 0 || search === "") && (
          <motion.section 
            key={year.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: yearIndex * 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
               <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  {year.name}
               </h2>
               <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            {/* Timetable Banner */}
            {year.timetable && search === "" && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden cursor-pointer group border border-white/5 shadow-2xl"
                onClick={() => setSelectedImage(year.timetable!.imageUrl)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                <img
                  src={year.timetable.imageUrl}
                  alt={`${year.name} Timetable`}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
                   <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white">
                      <Calendar size={24} />
                   </div>
                   <div>
                      <p className="font-bold text-lg text-white">Exam Timetable</p>
                      <p className="text-gray-300 text-sm">Tap to view full schedule</p>
                   </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
              {year.units.map((unit) => (
                <Link key={unit.id} href={`/units/${unit.id}`} className="block h-full">
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5, borderColor: "rgba(99, 102, 241, 0.3)" }}
                  className="group relative h-full p-6 rounded-2xl bg-card/50 border border-white/5 backdrop-blur-sm hover:bg-card/80 transition-all shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                            <BookOpen size={24} />
                        </div>
                        <ChevronRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold leading-tight group-hover:text-indigo-400 transition-colors">
                            {unit.name}
                        </h3>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-4 text-sm font-medium text-muted-foreground pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <FileText size={16} />
                        <span>{unit._count.resources} resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} />
                        <span>{unit._count.assignments} tasks</span>
                    </div>
                  </div>
                </motion.div>
                </Link>
              ))}
              </AnimatePresence>
            </div>
            
            {year.units.length === 0 && search !== "" && (
                <div className="text-muted-foreground italic pl-4">No matching units found in {year.name}.</div>
            )}
             {year.units.length === 0 && search === "" && (
                <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-muted-foreground">
                    No units available for this year yet.
                </div>
            )}
          </motion.section>
          )
        ))}

        {filteredYears.every(y => y.units.length === 0) && search !== "" && (
             <div className="text-center py-20">
                 <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                    <Search size={32} className="text-muted-foreground" />
                 </div>
                 <h3 className="text-xl font-bold">No results found</h3>
                 <p className="text-muted-foreground">Try searching for a different keyword.</p>
             </div>
        )}
      </div>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
      {selectedImage && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <motion.img 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            src={selectedImage} 
            alt="Full Timetable" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
