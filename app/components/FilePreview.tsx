"use client";

import { useState } from "react";

interface FilePreviewProps {
  url: string;
  type?: string; 
  title?: string;
}

export function FilePreview({ url, type, title }: FilePreviewProps) {
  const isImage = 
    type?.includes("image") || 
    url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;
    
  const isYoutube = 
    type === "youtube" || 
    url.includes("youtube.com") || 
    url.includes("youtu.be");

  const isPdf = 
    type === "pdf" || 
    url.endsWith(".pdf");

  if (!url) return <span className="text-muted text-xs">No file</span>;

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="group relative block w-12 h-12 rounded overflow-hidden border bg-muted">
        <img 
          src={url} 
          alt={title || "Preview"} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
        />
      </a>
    );
  }

  if (isYoutube) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-red-600 hover:underline">
        <span className="text-xl">📺</span>
        <span className="text-xs font-medium">Video</span>
      </a>
    );
  }

  if (isPdf) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-red-700 hover:underline">
         <span className="text-xl">📄</span>
         <span className="text-xs font-medium">PDF</span>
      </a>
    );
  }

  // Default File
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
      <span className="text-xl">📎</span>
      <span className="text-xs font-medium">File</span>
    </a>
  );
}
