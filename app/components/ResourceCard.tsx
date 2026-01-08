"use client";

import { useState } from "react";
import { Download, Youtube, Eye } from "lucide-react";
import { FilePreviewModal } from "./FilePreviewModal";

interface Resource {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  isOfficial: boolean;
  createdAt: Date;
}

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const canPreview = ["pdf", "docx", "ppt"].includes(resource.fileType);
  const isYoutube = resource.fileType === "youtube";

  // Extract YouTube video ID
  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([^&?#]+)/);
    return match ? match[1] : url.split('/').pop();
  };

  return (
    <>
      <div className="group flex flex-col md:flex-row gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all">
        
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-full md:w-48">
          {isYoutube ? (
            <div className="aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-black shadow-lg relative group-hover:ring-2 ring-indigo-500/50 transition-all">
              <iframe 
                src={`https://www.youtube.com/embed/${getYoutubeId(resource.fileUrl)}`}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          ) : (
            <div 
              onClick={() => canPreview && setIsPreviewOpen(true)}
              className={`h-full min-h-[80px] sm:min-h-[100px] rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-3xl sm:text-4xl shadow-inner border border-white/5 ${canPreview ? 'cursor-pointer hover:ring-2 ring-indigo-500/50 transition-all' : ''}`}
            >
              {resource.fileType === "pdf" && "📄"}
              {resource.fileType === "docx" && "📝"}
              {resource.fileType === "ppt" && "📊"}
              {resource.fileType === "zip" && "📦"}
              {resource.fileType === "file" && "📎"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between py-0.5 sm:py-1 min-w-0">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <span className="bg-white/10 text-white text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                {resource.fileType}
              </span>
              {resource.isOfficial && (
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                  Official (GTSS)
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-100 group-hover:text-indigo-400 transition-colors line-clamp-2 sm:line-clamp-1">
              {resource.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              {resource.isOfficial ? "Uploaded by GTSS" : `Thanks to ${resource.uploadedBy}`} • {new Date(resource.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="mt-3 sm:mt-4 md:mt-0 flex flex-wrap items-center gap-2 sm:gap-3">
            {isYoutube ? (
              <a 
                href={resource.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                <Youtube size={14} className="sm:w-4 sm:h-4" /> Watch Video
              </a>
            ) : (
              <>
                {canPreview && (
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Eye size={14} className="sm:w-4 sm:h-4" /> Preview
                  </button>
                )}
                <a 
                  href={resource.fileUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Download size={14} className="sm:w-4 sm:h-4" /> Download
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        fileUrl={resource.fileUrl}
        fileType={resource.fileType}
        title={resource.title}
      />
    </>
  );
}
