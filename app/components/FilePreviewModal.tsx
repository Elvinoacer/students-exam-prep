"use client";

import { useState, useEffect } from "react";
import { X, Download, ExternalLink, Loader2, AlertTriangle } from "lucide-react";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileType: string;
  title: string;
}

export function FilePreviewModal({ isOpen, onClose, fileUrl, fileType, title }: FilePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get the preview URL based on file type
  const getPreviewUrl = () => {
    // For PDFs, try direct embed first (most modern browsers support this)
    // If file is from Vercel Blob, it should work directly
    if (fileType === "pdf") {
      // Direct PDF embed works best with Vercel Blob URLs
      return fileUrl;
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
  const isPdf = fileType === "pdf";

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      
      {/* Modal Container */}
      <div 
        className="relative z-10 w-full h-full max-w-[98vw] max-h-[95vh] md:max-w-[92vw] md:max-h-[90vh] flex flex-col bg-[#0a0a0f] rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <span className="flex-shrink-0 bg-indigo-500/20 text-indigo-300 text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
              {fileType}
            </span>
            <h3 className="text-xs sm:text-base font-semibold text-white truncate">{title}</h3>
          </div>
          
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
            </a>
            <a
              href={fileUrl}
              download
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Download"
            >
              <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
              title="Close (Esc)"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 relative bg-black overflow-hidden">
          {canPreview && !hasError ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black z-10">
                  <Loader2 size={36} className="animate-spin text-indigo-400" />
                  <p className="text-sm text-gray-400">Loading preview...</p>
                  <p className="text-xs text-gray-600">This may take a few seconds</p>
                </div>
              )}
              
              {isPdf ? (
                // For PDFs, use object tag which has better native PDF support
                <object
                  data={previewUrl}
                  type="application/pdf"
                  className="w-full h-full"
                  onLoad={() => setIsLoading(false)}
                  onError={handleIframeError}
                >
                  {/* Fallback if object tag fails */}
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                    className="w-full h-full border-0"
                    title={`Preview: ${title}`}
                    onLoad={() => setIsLoading(false)}
                    onError={handleIframeError}
                  />
                </object>
              ) : (
                // For Office documents, use iframe with Office Online viewer
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title={`Preview: ${title}`}
                  onLoad={() => setIsLoading(false)}
                  onError={handleIframeError}
                  allowFullScreen
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
              {hasError ? (
                <>
                  <AlertTriangle size={48} className="text-amber-500" />
                  <div>
                    <p className="text-white font-semibold mb-1">Preview unavailable</p>
                    <p className="text-gray-400 text-sm">
                      The file couldn't be previewed in this browser.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-6xl">
                    {fileType === "zip" && "📦"}
                    {fileType === "file" && "📎"}
                  </div>
                  <p className="text-gray-400">
                    Preview not available for this file type.
                  </p>
                </>
              )}
              <div className="flex gap-3 mt-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors text-sm"
                >
                  <ExternalLink size={16} /> Open in Tab
                </a>
                <a
                  href={fileUrl}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                >
                  <Download size={16} /> Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
