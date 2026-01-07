"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { PenTool, UploadCloud, Loader2 } from "lucide-react";

export function CreateAssignmentForm({ units }: { units: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file") as File;

    try {
      let fileUrl = "";
      if (file && file.size > 0) {
        // 1. Check if file already exists (Smart Reuse)
        const checkRes = await fetch("/api/upload/check", {
             method: "POST",
             body: JSON.stringify({ filename: file.name }),
        });
        const checkData = await checkRes.json();

        if (checkData.exists && checkData.url) {
             fileUrl = checkData.url;
        } else {
            const blob = await upload(file.name, file, {
              access: "public",
              handleUploadUrl: "/api/upload/auth",
            });
            fileUrl = blob.url;
        }
      }

      const res = await fetch("/api/admin/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          unitId: formData.get("unitId"),
          notes: formData.get("notes"),
          fileUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to create");
      
      router.push("/admin/assignments");
      router.refresh();
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="flex items-center gap-3 sm:gap-4 border-b border-white/10 pb-4 sm:pb-6">
                <div className="p-2 sm:p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                    <PenTool size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                     <h2 className="text-xl sm:text-2xl font-bold text-white">Create Assignment</h2>
                     <p className="text-sm text-gray-400">Add a new task for students.</p>
                </div>
            </div>

            {error && <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{error}</div>}

            <div className="space-y-4 sm:space-y-6">
                 {/* Title */}
                <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider">Assignment Title <span className="text-red-500">*</span></label>
                    <input 
                        name="title" 
                        required 
                        placeholder="e.g. Lab 4: Neural Networks"
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    />
                </div>

                {/* Unit */}
                <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider">Unit <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select 
                            name="unitId" 
                            required 
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-black/20 border border-white/10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                        >
                            <option value="" className="bg-gray-900">Select Unit...</option>
                            {units.map((u) => <option key={u.id} value={u.id} className="bg-gray-900">{u.name}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
                    </div>
                </div>

                {/* File Upload */}
                <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider">Attachment (PDF/Doc)</label>
                    <div className="relative group">
                        <input
                            type="file"
                            name="file"
                            className="w-full px-4 py-8 sm:py-8 rounded-xl bg-black/20 border-2 border-dashed border-white/10 text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:border-indigo-500/50 transition-colors text-center cursor-pointer text-xs sm:text-sm"
                        />
                         <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center pt-6 opacity-30">
                             <UploadCloud size={20} className="mb-1" />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider">Instructions / Notes</label>
                    <textarea 
                        name="notes" 
                        rows={4}
                        placeholder="Describe what students need to do..."
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm sm:text-base"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-indigo-600 text-white font-bold text-base sm:text-lg hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? <><Loader2 className="animate-spin" /> Creating...</> : "Publish Assignment"}
            </button>

        </form>
    </div>
  );
}
