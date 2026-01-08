"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "./ToastProvider";

interface DownloadButtonProps {
  unitId?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DownloadButton({ unitId, className, children }: DownloadButtonProps) {
  const { showToast, updateToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    const toastId = showToast("Preparing download...", "loading");

    try {
      const url = unitId ? `/api/download-zip?unitId=${unitId}` : "/api/download-zip";
      const response = await fetch(url);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Download failed");
      }

      // Get readable stream for progress tracking
      const reader = response.body?.getReader();
      const contentLength = response.headers.get("Content-Length");
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

      if (!reader) throw new Error("No response body");

      // Read the stream and track progress
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      let lastUpdate = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        // Update toast every 100KB or 500ms
        const now = Date.now();
        if (now - lastUpdate > 500 || receivedLength - lastUpdate > 100000) {
          if (totalSize > 0) {
            const percent = Math.round((receivedLength / totalSize) * 100);
            updateToast(toastId, `Downloading... ${percent}% (${formatBytes(receivedLength)})`, "loading");
          } else {
            updateToast(toastId, `Downloading... ${formatBytes(receivedLength)}`, "loading");
          }
          lastUpdate = now;
        }
      }

      // Combine chunks into blob
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let position = 0;
      for (const chunk of chunks) {
        combined.set(chunk, position);
        position += chunk.length;
      }
      const blob = new Blob([combined.buffer]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = unitId ? "resources.zip" : "all-resources.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      updateToast(toastId, `Download complete! (${formatBytes(receivedLength)})`, "success");
    } catch (error: any) {
      console.error("Download error:", error);
      updateToast(toastId, error.message || "Download failed. Please try again.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}
    >
      {isDownloading ? (
        <Loader2 size={14} className="animate-spin sm:w-4 sm:h-4 flex-shrink-0" />
      ) : (
        <Download size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
      )}
      {children}
    </button>
  );
}
