"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { UploadCloud, FileText, Youtube, Loader2, Video } from "lucide-react";

export function UploadSolutionForm({ assignmentTitle }: { assignmentTitle?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"file" | "youtube">("file");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const uploadedBy = formData.get("uploadedBy") as string;
    const file = formData.get("file") as File;
    const youtubeUrl = formData.get("url") as string;

    try {
      let finalFileUrl = "";

      if (uploadType === "file") {
        if (!file || file.size === 0) {
          throw new Error("Please select a file to upload.");
        }

        // 1. Check if file already exists (Smart Reuse)
        const checkRes = await fetch("/api/upload/check", {
             method: "POST",
             body: JSON.stringify({ filename: file.name }),
        });
        const checkData = await checkRes.json();

        if (checkData.exists && checkData.url) {
             finalFileUrl = checkData.url;
        } else {
             const newBlob = await upload(file.name, file, {
               access: "public",
               handleUploadUrl: "/api/upload/auth",
             });
             finalFileUrl = newBlob.url;
        }
      } else {
         if (!youtubeUrl) throw new Error("Please enter a YouTube URL.");
         finalFileUrl = youtubeUrl;
      }

      const apiFormData = new FormData();
      apiFormData.append("assignmentId", assignmentId!);
      apiFormData.append("uploadedBy", uploadedBy);
      apiFormData.append("type", uploadType);
      
      if (uploadType === "youtube") {
        apiFormData.append("url", finalFileUrl); 
      } else {
        apiFormData.append("fileUrl", finalFileUrl); 
      }

      const response = await fetch("/api/upload/solution", {
        method: "POST",
        body: apiFormData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      router.back();
      router.refresh();
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!assignmentId) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500 text-red-500 text-center">
        Error: No assignment specified. Please go back and select an assignment.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Submit Solution</h2>
            {assignmentTitle && <p className="text-indigo-400 font-medium mb-2">Ref: {assignmentTitle}</p>}
            <p className="text-gray-400 mb-8">Share your solution to help the community.</p>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setUploadType("file")}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${
                            uploadType === "file" 
                            ? "bg-indigo-600 border-indigo-500 text-white" 
                            : "bg-black/20 border-white/10 text-gray-400 hover:bg-white/5"
                        }`}
                    >
                        <FileText size={18} /> File
                    </button>
                    <button
                        type="button"
                        onClick={() => setUploadType("youtube")}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${
                            uploadType === "youtube" 
                            ? "bg-red-600 border-red-500 text-white" 
                            : "bg-black/20 border-white/10 text-gray-400 hover:bg-white/5"
                        }`}
                    >
                        <Youtube size={18} /> YouTube
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Your Name</label>
                    <input
                        name="uploadedBy"
                        required
                        placeholder="e.g. John Smith"
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>

                {uploadType === "file" ? (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">File</label>
                        <div className="relative group">
                            <input
                                type="file"
                                name="file"
                                required
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                                className="w-full px-4 py-12 rounded-xl bg-black/20 border-2 border-dashed border-white/10 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:border-indigo-500/50 transition-colors text-center cursor-pointer"
                            />
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center pt-8 opacity-50">
                                <UploadCloud size={24} className="mb-2" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">YouTube URL</label>
                        <input
                            type="url"
                            name="url"
                            required
                            placeholder="https://youtu.be/..."
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? <><Loader2 className="animate-spin" /> Uploading...</> : "Submit Solution"}
                </button>
            </form>
        </div>
    </div>
  );
}
