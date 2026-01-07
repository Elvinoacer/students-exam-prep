"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { UploadCloud, FileText, Youtube, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UploadPageWrapper() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30 overflow-hidden relative">
       {/* Background Elements */}
       <div className="fixed inset-0 z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

       <div className="container mx-auto px-6 py-12 relative z-10">
          <Link href="/units" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
             <ArrowLeft size={18} /> Back to Units
          </Link>
          {/* Content is injected by page.tsx */}
       </div>
    </main>
  )
}
