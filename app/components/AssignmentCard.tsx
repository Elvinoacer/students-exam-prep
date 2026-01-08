"use client";

import { useState } from "react";
import { FileText, ExternalLink, Download, Eye, Youtube, ChevronDown, ChevronUp } from "lucide-react";
import { FilePreviewModal } from "./FilePreviewModal";
import Link from "next/link";

interface Solution {
  id: string;
  fileUrl: string;
  uploadedBy: string;
  isOfficial: boolean;
  createdAt: Date | string;
}

interface Assignment {
  id: string;
  title: string;
  fileUrl: string | null;
  notes: string | null;
  solutions: Solution[];
}

interface AssignmentCardProps {
  assignment: Assignment;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ url: string; type: string; title: string } | null>(null);
  const [showSolutions, setShowSolutions] = useState(false);

  const getFileType = (url: string) => {
    // Handle URLs with query parameters or fragments correctly
    const cleanUrl = url.split(/[#?]/)[0];
    const ext = cleanUrl.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["doc", "docx"].includes(ext || "")) return "docx";
    if (["ppt", "pptx"].includes(ext || "")) return "ppt";
    if (["zip", "rar"].includes(ext || "")) return "zip";
    return "file";
  };

  const handlePreview = (url: string, title: string) => {
    const type = getFileType(url);
    setPreviewContent({ url, type, title });
    setIsPreviewOpen(true);
  };

  const canPreview = (url: string | null) => {
    if (!url) return false;
    const type = getFileType(url);
    return ["pdf", "docx", "ppt"].includes(type);
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#1f2937]/50 border border-white/5 hover:border-white/10 transition-all">
      <div className="flex justify-between items-start gap-4">
        <h3 className="font-bold text-gray-100 text-sm sm:text-base">{assignment.title}</h3>
        <div className="flex items-center gap-2">
          {assignment.fileUrl && (
            <>
              {canPreview(assignment.fileUrl) && (
                <button 
                  onClick={() => handlePreview(assignment.fileUrl!, assignment.title)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-400 transition-colors"
                  title="Preview Assignment"
                >
                  <Eye size={16} />
                </button>
              )}
              <a 
                href={assignment.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            </>
          )}
        </div>
      </div>
      
      {assignment.notes && (
        <p className="text-xs sm:text-sm text-gray-400 mt-2 line-clamp-3">
          {assignment.notes}
        </p>
      )}
      
      <div className="mt-5 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setShowSolutions(!showSolutions)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase hover:text-gray-300 transition-colors"
          >
            Solutions 
            <span className="ml-1 px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
              {assignment.solutions.length}
            </span>
            {showSolutions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <Link 
            href={`/upload/solution?assignmentId=${assignment.id}`} 
            className="text-[10px] sm:text-xs font-bold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg bg-indigo-400/10 border border-indigo-400/20"
          >
            + Submit
          </Link>
        </div>

        {showSolutions && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {assignment.solutions.map(sol => (
              <div key={sol.id} className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5 text-[10px] sm:text-xs">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-gray-300 truncate font-medium">
                    {sol.isOfficial ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                         Official (GTSS)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 italic">
                        🙏 Thanks to {sol.uploadedBy}
                      </span>
                    )}
                  </span>
                  <span className="text-gray-600 text-[9px] mt-0.5">
                    {new Date(sol.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {canPreview(sol.fileUrl) && (
                    <button 
                      onClick={() => handlePreview(sol.fileUrl, sol.isOfficial ? "Official Solution" : `Solution by ${sol.uploadedBy}`)}
                      className="p-1 rounded-md hover:bg-white/10 text-emerald-400 px-2"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  <a 
                    href={sol.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white px-2"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
            {assignment.solutions.length === 0 && (
              <span className="text-xs text-gray-600 block italic py-2">No solutions yet. Be the first to share!</span>
            )}
          </div>
        )}
      </div>

      {previewContent && (
        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          fileUrl={previewContent.url}
          fileType={previewContent.type}
          title={previewContent.title}
        />
      )}
    </div>
  );
}
