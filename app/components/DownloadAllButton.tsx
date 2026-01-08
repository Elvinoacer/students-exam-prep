"use client";

import { DownloadButton } from "./DownloadButton";

interface DownloadAllButtonProps {
  unitId?: string;
}

export function DownloadAllButton({ unitId }: DownloadAllButtonProps) {
  return (
    <DownloadButton
      unitId={unitId}
      className="flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-semibold hover:bg-white/20 transition-all whitespace-nowrap disabled:opacity-50"
    >
      <span className="hidden sm:inline">Download All</span>
      <span className="sm:hidden">All</span>
    </DownloadButton>
  );
}
