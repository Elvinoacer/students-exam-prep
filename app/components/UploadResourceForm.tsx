"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Youtube, Trash2, CheckCircle, AlertCircle, UploadCloud, FileType, Video } from "lucide-react";

interface FileQueueItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  autoTitle: string;
}

interface YoutubeQueueItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  status: "pending" | "saving" | "done" | "error";
}

export function UploadResourceForm({ units }: { units: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUnitId = searchParams.get("unitId");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [activeTab, setActiveTab] = useState<"file" | "youtube">("file");
  const [unitId, setUnitId] = useState(preselectedUnitId || "");
  const [uploadedBy, setUploadedBy] = useState("");
  
  // YouTube Input State
  const [ytInputUrl, setYtInputUrl] = useState("");
  const [ytInputTitle, setYtInputTitle] = useState("");

  // Queues
  const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
  const [youtubeQueue, setYoutubeQueue] = useState<YoutubeQueueItem[]>([]);
  
  const [isGlobalUploading, setIsGlobalUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // -- Helpers --
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // -- Handlers: Files --
  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const newItems: FileQueueItem[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: "pending",
      autoTitle: file.name.replace(/\.[^/.]+$/, ""),
    }));
    setFileQueue((prev) => [...prev, ...newItems]);
  };

  const removeFile = (id: string) => {
    setFileQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // -- Handlers: YouTube --
  const addYoutubeLink = () => {
    if (!ytInputUrl) return;
    const videoId = getYoutubeId(ytInputUrl);
    if (!videoId) {
        alert("Invalid YouTube URL");
        return;
    }

    const newItem: YoutubeQueueItem = {
        id: Math.random().toString(36).substring(7),
        url: ytInputUrl,
        title: ytInputTitle || `Video ${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
        status: "pending"
    };

    setYoutubeQueue(prev => [...prev, newItem]);
    setYtInputUrl("");
    setYtInputTitle("");
  };

  const removeYoutube = (id: string) => {
    setYoutubeQueue(prev => prev.filter(item => item.id !== id));
  };

  // -- Upload Logic --

  const uploadSingleFile = async (item: FileQueueItem) => {
    setFileQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: "uploading" } : i));

    try {
      const newBlob = await upload(item.file.name, item.file, {
        access: "public",
        handleUploadUrl: "/api/upload/auth",
        onUploadProgress: (progressEvent: any) => {
           let percentage = 0;
           if (typeof progressEvent === 'number') {
              percentage = progressEvent;
           } else if (progressEvent.total > 0) {
              percentage = (progressEvent.loaded / progressEvent.total) * 100;
           }
           setFileQueue(prev => prev.map(i => i.id === item.id ? { ...i, progress: percentage } : i));
        }
      });

      let finalFileType = "file";
      const ext = item.file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf") finalFileType = "pdf";
      else if (["doc", "docx"].includes(ext || "")) finalFileType = "docx";
      else if (["ppt", "pptx"].includes(ext || "")) finalFileType = "ppt";
      else if (ext === "zip") finalFileType = "zip";

      const apiFormData = new FormData();
      apiFormData.append("title", item.autoTitle);
      apiFormData.append("unitId", unitId);
      apiFormData.append("uploadedBy", uploadedBy);
      apiFormData.append("type", "file");
      apiFormData.append("fileUrl", newBlob.url);
      apiFormData.append("fileType", finalFileType);

      const res = await fetch("/api/upload/resource", { method: "POST", body: apiFormData });
      if (!res.ok) throw new Error("Metadata save failed");

      setFileQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: "done", progress: 100 } : i));
    } catch (error: any) {
      console.error(error);
      setFileQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: "error", error: error.message } : i));
    }
  };

  const saveSingleYoutube = async (item: YoutubeQueueItem) => {
     setYoutubeQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: "saving" } : i));
     try {
        const apiFormData = new FormData();
        apiFormData.append("title", item.title);
        apiFormData.append("unitId", unitId);
        apiFormData.append("uploadedBy", uploadedBy);
        apiFormData.append("type", "youtube");
        apiFormData.append("url", item.url);

        const res = await fetch("/api/upload/resource", { method: "POST", body: apiFormData });
        if (!res.ok) throw new Error("Failed to save");

        setYoutubeQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: "done" } : i));
     } catch (error: any) {
        setYoutubeQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: "error" } : i));
     }
  };

  const handleUploadAll = async () => {
    if (!unitId || !uploadedBy) {
        alert("Please select a Unit and enter your Name first.");
        return;
    }
    
    setIsGlobalUploading(true);
    const pendingFiles = fileQueue.filter(i => i.status === "pending" || i.status === "error");
    const pendingYoutube = youtubeQueue.filter(i => i.status === "pending" || i.status === "error");
    
    await Promise.all([
        ...pendingFiles.map(item => uploadSingleFile(item)),
        ...pendingYoutube.map(item => saveSingleYoutube(item))
    ]);

    setIsGlobalUploading(false);
    
    const allFilesDone = fileQueue.every(i => i.status === "done");
    const allYoutubeDone = youtubeQueue.every(i => i.status === "done");

    if (allFilesDone && allYoutubeDone && (fileQueue.length > 0 || youtubeQueue.length > 0)) {
       const confirmLeave = confirm("All resources uploaded successfully! Go to Unit page?");
       if (confirmLeave) router.push(`/units/${unitId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
       <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
           
           <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Upload Resource</h2>
              <p className="text-gray-400">Contribute materials to help your peers excel.</p>
           </div>

           {/* Metadata Fields */}
           <div className="grid md:grid-cols-2 gap-6 mb-8">
             <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-300">Unit Name <span className="text-red-400">*</span></label>
                 <select
                     value={unitId}
                     onChange={(e) => setUnitId(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                     disabled={isGlobalUploading}
                 >
                     <option value="" disabled className="bg-gray-900">Select a Unit...</option>
                     {units.map((u) => (
                         <option key={u.id} value={u.id} className="bg-gray-900">{u.name}</option>
                     ))}
                 </select>
             </div>
             <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-300">Your Name <span className="text-red-400">*</span></label>
                 <input
                     value={uploadedBy}
                     onChange={(e) => setUploadedBy(e.target.value)}
                     placeholder="e.g. Alex Smith"
                     className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                     disabled={isGlobalUploading}
                 />
             </div>
           </div>

           {/* Custom Tabs */}
           <div className="p-1 bg-black/30 rounded-xl mb-8 flex">
              <button
                onClick={() => setActiveTab("file")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "file" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                }`}
              >
                <FileUp size={18} /> File Upload
              </button>
              <button
                onClick={() => setActiveTab("youtube")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "youtube" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                }`}
              >
                <Youtube size={18} /> YouTube Link
              </button>
           </div>

           <AnimatePresence mode="wait">
             {activeTab === "file" && (
                <motion.div
                    key="file_panel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                >
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            handleFilesSelected(e.dataTransfer.files);
                        }}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group ${
                            dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50"
                        }`}
                    >
                        <input 
                            ref={fileInputRef} 
                            type="file" multiple 
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                            className="hidden" 
                            onChange={(e) => handleFilesSelected(e.target.files)} 
                        />
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <UploadCloud size={32} className="text-white" />
                        </div>
                        <p className="text-lg font-semibold text-white mb-2">Click or Drag files here</p>
                        <p className="text-sm text-gray-400">Support for PDF, Word, PowerPoint, ZIP (Max 50MB)</p>
                    </div>

                    {fileQueue.length > 0 && (
                        <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
                            {fileQueue.map((item) => (
                                <div key={item.id} className="p-4 border-b border-white/5 last:border-0 flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                         <FileType size={20} />
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <p className="text-white font-medium truncate">{item.autoTitle}</p>
                                         <p className="text-xs text-gray-400">{item.file.name}</p>
                                         {item.status === "uploading" && (
                                              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${item.progress}%` }} />
                                              </div>
                                         )}
                                         {item.status === "done" && <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><CheckCircle size={10} /> Complete</p>}
                                         {item.status === "error" && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {item.error || "Failed"}</p>}
                                     </div>
                                     {item.status === "pending" && (
                                         <button onClick={() => removeFile(item.id)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors">
                                             <Trash2 size={18} />
                                         </button>
                                     )}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
             )}

             {activeTab === "youtube" && (
                <motion.div
                    key="youtube_panel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                >
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Video Title (Optional)</label>
                                <input 
                                    value={ytInputTitle}
                                    onChange={e => setYtInputTitle(e.target.value)}
                                    placeholder="e.g. Lecture Part 2"
                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:ring-1 focus:ring-red-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">YouTube URL</label>
                                <input 
                                    value={ytInputUrl}
                                    onChange={e => setYtInputUrl(e.target.value)}
                                    placeholder="https://youtu.be/..."
                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:ring-1 focus:ring-red-500"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={addYoutubeLink}
                            disabled={!ytInputUrl}
                            className="w-full md:w-auto px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Add Video
                        </button>
                    </div>

                    {youtubeQueue.length > 0 && (
                         <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
                            {youtubeQueue.map((item) => (
                                <div key={item.id} className="p-4 border-b border-white/5 last:border-0 flex items-center gap-4">
                                     <div className="w-20 aspect-video rounded-md bg-black relative overflow-hidden flex-shrink-0">
                                         <img src={item.thumbnail} className="w-full h-full object-cover opacity-80" alt="" />
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <p className="text-white font-medium truncate">{item.title}</p>
                                         <a href={item.url} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 truncate block">{item.url}</a>
                                         {item.status === "done" && <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><CheckCircle size={10} /> Saved</p>}
                                     </div>
                                     {(item.status === "pending" || item.status === "error") && (
                                         <button onClick={() => removeYoutube(item.id)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors">
                                             <Trash2 size={18} />
                                         </button>
                                     )}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
             )}
           </AnimatePresence>

           {/* Global Upload Button */}
           <AnimatePresence>
             {(fileQueue.length > 0 || youtubeQueue.length > 0) && (
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 pt-6 border-t border-white/10"
                 >
                     <button
                        onClick={handleUploadAll}
                        disabled={isGlobalUploading || !unitId || !uploadedBy || (fileQueue.every(i => i.status === "done") && youtubeQueue.every(i => i.status === "done"))}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                     >
                        {isGlobalUploading ? "Processing..." : `Upload ${fileQueue.length + youtubeQueue.length} Items`}
                     </button>
                 </motion.div>
             )}
           </AnimatePresence>

       </div>
    </div>
  );
}
