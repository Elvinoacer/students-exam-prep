"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { DeleteButton } from "@/app/components/DeleteButton";
import { Calendar, Upload, Image as ImageIcon, Loader2 } from "lucide-react";

interface Year {
  id: string;
  name: string;
  timetable: {
    id: string;
    imageUrl: string;
  } | null;
}

export function ManageTimetableForm({ years }: { years: Year[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle saving the image data to our DB after Cloudinary upload
  async function handleUploadSuccess(result: any, yearId: string) {
    setIsLoading(true);
    const imageUrl = result.info.secure_url;
    
    try {
      const res = await fetch("/api/admin/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearId, imageUrl }),
      });

      if (!res.ok) throw new Error("Failed to save timetable to DB");
      
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error saving timetable.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-6 pb-4 sm:pb-6 border-b border-white/10">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Exam Timetables</h1>
               <p className="text-sm text-gray-400">Set the official exam schedule banners associated with each year.</p>
            </div>
        </div>

        {years.length === 0 && (
             <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10">
                <p className="text-gray-500 text-sm sm:text-base">No years found. Create years in Structure Management first.</p>
             </div>
        )}

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            {years.map((year) => (
                <div key={year.id} className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg p-5 sm:p-6 flex flex-col items-center">
                    
                    <div className="w-full flex justify-between items-center mb-4 sm:mb-6">
                        <div className="flex items-center gap-3">
                             <div className="p-1.5 sm:p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                 <Calendar size={18} className="sm:w-5 sm:h-5" />
                             </div>
                             <h3 className="text-lg sm:text-xl font-bold text-white">{year.name}</h3>
                        </div>
                    </div>

                    {year.timetable ? (
                        <div className="w-full space-y-4">
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                                <img src={year.timetable.imageUrl} alt="Timetable" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-medium flex items-center gap-2"><ImageIcon size={16} /> Current Banner</span>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <DeleteButton id={year.timetable.id} endpoint="/api/admin/timetable" itemName="Timetable" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-video rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 bg-black/10">
                             <ImageIcon size={24} className="sm:w-8 sm:h-8 mb-2 opacity-50" />
                             <p className="text-xs sm:text-sm">No timetable set</p>
                        </div>
                    )}

                    <div className="w-full mt-6">
                        <CldUploadWidget 
                            uploadPreset="exam-portal" 
                            onSuccess={(result) => handleUploadSuccess(result, year.id)}
                            options={{
                                sources: ['local', 'url'],
                                multiple: false,
                                clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
                                styles: {
                                    palette: {
                                        window: "#030712",
                                        sourceBg: "#111827",
                                        windowBorder: "#909090",
                                        tabIcon: "#FFFFFF",
                                        inactiveTabIcon: "#697789",
                                        menuIcons: "#FFFFFF",
                                        link: "#6366F1",
                                        action: "#339933",
                                        inProgress: "#00BFFF",
                                        complete: "#339933",
                                        error: "#cc0000",
                                        textDark: "#000000",
                                        textLight: "#FFFFFF"
                                    }
                                }
                            }}
                        >
                            {({ open }) => (
                                <button 
                                    onClick={() => open()}
                                    disabled={isLoading}
                                    className="w-full py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-indigo-500/50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : <><Upload size={16} className="sm:w-[18px] sm:h-[18px]" /> {year.timetable ? "Replace Image" : "Upload Image"}</>}
                                </button>
                            )}
                        </CldUploadWidget>
                    </div>

                </div>
            ))}
        </div>
    </div>
  );
}
