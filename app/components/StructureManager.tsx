"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/app/components/DeleteButton";
import { Plus, Trash2, Layers, Folder, ChevronRight, Loader2 } from "lucide-react";

interface Year {
  id: string;
  name: string;
  units: Unit[];
}

interface Unit {
  id: string;
  name: string;
  _count: {
    resources: number;
    assignments: number;
  }
}

export function StructureManager({ years }: { years: Year[] }) {
  const router = useRouter();
  const [isCreatingYear, setIsCreatingYear] = useState(false);
  const [newYearName, setNewYearName] = useState("");
  
  const [creatingUnitForYear, setCreatingUnitForYear] = useState<string | null>(null);
  const [newUnitName, setNewUnitName] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  async function handleCreateYear(e: React.FormEvent) {
    e.preventDefault();
    if(!newYearName.trim()) return;
    setIsLoading(true);
    
    try {
        const res = await fetch("/api/admin/year", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newYearName }),
        });
        if(!res.ok) throw new Error("Failed to create year");
        setNewYearName("");
        setIsCreatingYear(false);
        router.refresh();
    } catch (error) {
        alert("Failed to create year");
    } finally {
        setIsLoading(false);
    }
  }

  async function handleCreateUnit(e: React.FormEvent, yearId: string) {
    e.preventDefault();
    if(!newUnitName.trim()) return;
    setIsLoading(true);

     try {
        const res = await fetch("/api/admin/unit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newUnitName, yearId }),
        });
        if(!res.ok) throw new Error("Failed to create unit");
        setNewUnitName("");
        setCreatingUnitForYear(null);
        router.refresh();
    } catch (error) {
        alert("Failed to create unit");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 sm:space-y-12 max-w-5xl mx-auto">
      
      {/* Header & Create Year */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-white/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Structure Management</h1>
            <p className="text-sm sm:text-base text-gray-400">Organize the curriculum by Years and Units.</p>
          </div>
          
          {!isCreatingYear ? (
            <button 
                onClick={() => setIsCreatingYear(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-sm sm:text-base font-bold hover:bg-indigo-500 hover:scale-105 transition-all shadow-lg shadow-indigo-500/20"
            >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> Add Academic Year
            </button>
          ) : (
             <form onSubmit={handleCreateYear} className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3 bg-white/5 p-2 rounded-xl border border-white/10 animate-in slide-in-from-right-2">
                <input 
                    placeholder="e.g. Year 4"
                    value={newYearName}
                    onChange={e => setNewYearName(e.target.value)}
                    className="flex-1 sm:w-48 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                />
                <div className="flex gap-2">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-500 disabled:opacity-50"
                    >
                        Save
                    </button>
                    <button 
                        type="button"
                        onClick={() => setIsCreatingYear(false)}
                        className="px-3 py-2 text-xs text-gray-400 hover:text-white"
                    >
                        Cancel
                    </button>
                </div>
             </form>
          )}
      </div>
      
      {/* Years List */}
      <div className="space-y-6 sm:space-y-8">
        {years.length === 0 && (
            <div className="p-8 sm:p-12 rounded-3xl border border-dashed border-white/10 text-center">
                <Layers className="mx-auto text-gray-600 mb-4" size={40} />
                <p className="text-gray-500 text-base sm:text-lg">No academic years defined yet.</p>
            </div>
        )}

        {years.map(year => (
            <div key={year.id} className="group relative rounded-2xl sm:rounded-3xl bg-white/5 border border-white/5 p-5 sm:p-8 transition-all hover:bg-white/[0.07]">
                 <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                 
                 <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                                <Layers size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white">{year.name}</h3>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0 mt-2 sm:mt-0">
                             <button
                                onClick={() => setCreatingUnitForYear(year.id)}
                                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                                <Plus size={16} /> <span className="sm:inline">Add Unit</span>
                            </button>
                            <div className="hidden sm:block h-6 w-px bg-white/10" />
                            <DeleteButton id={year.id} endpoint="/api/admin/year" itemName="Year" />
                        </div>
                    </div>

                    {/* Create Unit Form */}
                    {creatingUnitForYear === year.id && (
                        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 animate-in fade-in zoom-in-95">
                            <h4 className="text-xs sm:text-sm font-bold text-indigo-300 mb-2 sm:mb-3 uppercase tracking-wider">New Unit for {year.name}</h4>
                            <form onSubmit={(e) => handleCreateUnit(e, year.id)} className="flex flex-col sm:flex-row gap-3">
                                <input 
                                    placeholder="Unit Name (e.g. Advanced AI)"
                                    value={newUnitName}
                                    onChange={e => setNewUnitName(e.target.value)}
                                    className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-black/20 border border-white/10 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="flex-1 sm:flex-none bg-indigo-600 text-white px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold hover:bg-indigo-500 disabled:opacity-50"
                                    >
                                        Create
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setCreatingUnitForYear(null);
                                            setNewUnitName("");
                                        }}
                                        className="px-4 py-2.5 sm:py-3 text-sm text-gray-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Units Grid */}
                    {year.units.length > 0 ? (
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {year.units.map(unit => (
                                <div key={unit.id} className="group/unit flex flex-col justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-black/20 border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02]">
                                    <div className="mb-3 sm:mb-4">
                                        <div className="flex justify-between items-start">
                                           <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg mb-2 sm:mb-3 inline-block">
                                                <Folder size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 group-hover/unit:text-white transition-colors" />
                                           </div>
                                           <div className="opacity-100 sm:opacity-0 group-hover/unit:opacity-100 transition-opacity">
                                                <DeleteButton id={unit.id} endpoint="/api/admin/unit" itemName="Unit" />
                                           </div>
                                        </div>
                                        <h4 className="font-bold text-white text-base sm:text-lg leading-tight">{unit.name}</h4>
                                    </div>
                                    <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-medium text-gray-500 pt-3 sm:pt-4 border-t border-white/5">
                                        <span>{unit._count.resources} Resources</span>
                                        <span>{unit._count.assignments} Tasks</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 sm:py-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                            <p className="text-xs sm:text-sm text-gray-500">No units added yet.</p>
                        </div>
                    )}
                 </div>
            </div>
        ))}
      </div>
    </div>
  );
}
