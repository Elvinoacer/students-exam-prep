"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileUp, 
  Youtube, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  UploadCloud, 
  FileType, 
  Loader2,
  FileText
} from "lucide-react";

interface UploadState {
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  url?: string;
}

export function UploadSolutionForm({ assignmentTitle }: { assignmentTitle?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [activeTab, setActiveTab] = useState<"file" | "youtube">("file");
  const [uploadedBy, setUploadedBy] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Upload Process State
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
    status: "pending"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!assignmentId) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center backdrop-blur-md">
        <AlertCircle className="mx-auto mb-2" size={24} />
        <h3 className="font-bold">Missing Assignment</h3>
        <p className="text-sm">No assignment specified. Please go back and select an assignment.</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadState({ progress: 0, status: "pending" });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadState({ progress: 0, status: "pending" });
    }
  };

  const handleSubmit = async () => {
    if (!uploadedBy) {
      alert("Please enter your name first.");
      return;
    }
    if (activeTab === "file" && !selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    if (activeTab === "youtube" && !ytUrl) {
      alert("Please enter a YouTube URL.");
      return;
    }

    setIsSubmitting(true);
    setUploadState({ progress: 0, status: "uploading" });

    try {
      let finalFileUrl = "";

      if (activeTab === "file" && selectedFile) {
        // 1. Check if file already exists
        const checkRes = await fetch("/api/upload/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: selectedFile.name }),
        });
        const checkData = await checkRes.json();

        if (checkData.exists && checkData.url) {
          finalFileUrl = checkData.url;
          setUploadState(prev => ({ ...prev, progress: 100 }));
        } else {
          const newBlob = await upload(selectedFile.name, selectedFile, {
            access: "public",
            handleUploadUrl: "/api/upload/auth",
            onUploadProgress: (progressEvent: any) => {
              let percentage = 0;
              if (typeof progressEvent === 'number') percentage = progressEvent;
              else if (progressEvent.total > 0) percentage = (progressEvent.loaded / progressEvent.total) * 100;
              setUploadState(prev => ({ ...prev, progress: percentage }));
            }
          });
          finalFileUrl = newBlob.url;
        }
      } else {
        finalFileUrl = ytUrl;
      }

      // 2. Save Metadata to DB
      const apiFormData = new FormData();
      apiFormData.append("assignmentId", assignmentId);
      apiFormData.append("uploadedBy", uploadedBy);
      apiFormData.append("type", activeTab);
      
      if (activeTab === "youtube") {
        apiFormData.append("url", finalFileUrl);
      } else {
        apiFormData.append("fileUrl", finalFileUrl);
      }

      const res = await fetch("/api/upload/solution", {
        method: "POST",
        body: apiFormData
      });

      if (!res.ok) throw new Error("Failed to save solution to database.");

      setUploadState({ progress: 100, status: "done", url: finalFileUrl });
      
      setTimeout(() => {
        router.back();
        router.refresh();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setUploadState({ progress: 0, status: "error", error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16" />

        <div className="mb-8 relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Submit Solution</h2>
          {assignmentTitle && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
              <FileText size={14} />
              Ref: {assignmentTitle}
            </div>
          )}
          <p className="text-gray-400 text-sm">Contribute your solution to help others. 🙏</p>
        </div>

        <div className="space-y-6 relative z-10">
          {/* User Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Name <span className="text-red-400">*</span></label>
            <input
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              placeholder="e.g. Alex Smith"
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* Tabs */}
          <div className="p-1 bg-black/40 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "file" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
              disabled={isSubmitting}
            >
              <FileUp size={14} /> File
            </button>
            <button
              onClick={() => setActiveTab("youtube")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "youtube" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
              disabled={isSubmitting}
            >
              <Youtube size={14} /> YouTube
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "file" ? (
              <motion.div
                key="file-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer group ${
                      dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-black/20 hover:border-indigo-500/50 hover:bg-white/5"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                    />
                    <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud size={24} className="text-white" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">Click or Drag solution here</p>
                    <p className="text-[10px] text-gray-500">PDF, Word, PPT or ZIP (Max 50MB)</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <FileType size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {!isSubmitting && (
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="yt-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Link to Video Solution</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500">
                    <Youtube size={16} />
                  </div>
                  <input
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-sm"
                    disabled={isSubmitting}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress / Status */}
          {uploadState.status !== "pending" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className={uploadState.status === "error" ? "text-red-400" : "text-indigo-400"}>
                  {uploadState.status === "uploading" && "Uploading..."}
                  {uploadState.status === "done" && "Complete"}
                  {uploadState.status === "error" && "Error Occurred"}
                </span>
                <span className="text-gray-500">{Math.round(uploadState.progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadState.progress}%` }}
                  className={`h-full transition-all duration-300 ${
                    uploadState.status === "error" ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                  }`}
                />
              </div>
              {uploadState.error && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={10} /> {uploadState.error}
                </p>
              )}
              {uploadState.status === "done" && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 justify-center">
                  <CheckCircle size={10} /> Solution submitted successfully! Redirecting...
                </p>
              )}
            </div>
          )}
          {/* Attribution Notice */}
          <p className="text-[10px] text-gray-400 text-center px-4 leading-relaxed bg-white/5 py-3 rounded-xl border border-white/5">
            By submitting, you agree that your name will be displayed as attribution. 🙏
          </p>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || uploadState.status === "done"}
            className="group relative w-full py-4 rounded-2xl overflow-hidden shadow-xl hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
            <div className={`absolute inset-0 bg-gradient-to-r transition-all duration-500 ${
              activeTab === "file" 
                ? "from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500" 
                : "from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500"
            }`} />
            <span className="relative z-10 font-black text-white uppercase tracking-widest flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                "Submit Solution"
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
