"use client";

import { useState, useEffect } from "react";
import { X, Download, ExternalLink, Maximize2, Loader2 } from "lucide-react";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileType: string;
  title: string;
}

export function FilePreviewModal({ isOpen, onClose, fileUrl, fileType, title }: FilePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Get the preview URL based on file type
  const getPreviewUrl = () => {
    // For PDFs, we can use Google Docs Viewer or direct embed
    if (fileType === "pdf") {
      // Use Google Docs Viewer for reliable PDF rendering
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }
    
    // For Office documents (docx, ppt, pptx), use Microsoft Office Online Viewer
    if (fileType === "docx" || fileType === "ppt") {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    }

    // Fallback: try direct embed
    return fileUrl;
  };

  const previewUrl = getPreviewUrl();
  const canPreview = ["pdf", "docx", "ppt"].includes(fileType);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal Container */}
      <div 
        className="relative z-10 w-full h-full max-w-[95vw] max-h-[95vh] md:max-w-[90vw] md:max-h-[90vh] m-2 sm:m-4 flex flex-col bg-[#0f1117] rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-3 sm:px-5 py-3 sm:py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <span className="flex-shrink-0 bg-white/10 text-white text-[10px] sm:text-xs uppercase font-bold px-2 py-0.5 rounded-full">
              {fileType}
            </span>
            <h3 className="text-sm sm:text-lg font-bold text-white truncate">{title}</h3>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={18} className="sm:w-5 sm:h-5" />
            </a>
            <a
              href={fileUrl}
              download
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Download"
            >
              <Download size={18} className="sm:w-5 sm:h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 relative bg-gray-900/50 overflow-hidden">
          {canPreview ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900/80 z-10">
                  <Loader2 size={32} className="animate-spin text-indigo-400" />
                  <p className="text-sm text-gray-400">Loading preview...</p>
                </div>
              )}
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title={`Preview: ${title}`}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
              <div className="text-6xl">
                {fileType === "zip" && "📦"}
                {fileType === "file" && "📎"}
              </div>
              <p className="text-gray-400">
                Preview not available for this file type.
              </p>
              <a
                href={fileUrl}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
              >
                <Download size={18} /> Download File
              </a>
            </div>
          )}
        </div>

        {/* Mobile hint */}
        <div className="px-3 py-2 text-center text-[10px] sm:text-xs text-gray-500 border-t border-white/5 bg-white/5 sm:hidden">
          Pinch to zoom • Swipe to navigate
        </div>
      </div>
    </div>
  );
}
