import { Suspense } from "react";
import { prisma } from "@/app/lib/db";
import { UploadResourceForm } from "@/app/components/UploadResourceForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function UploadPage() {
  const units = await prisma.unit.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 pt-24 pb-12 relative z-10">
        <Link href="/units" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
             <ArrowLeft size={18} /> Back to Units
        </Link>
        
        <Suspense fallback={<div>Loading form...</div>}>
          <UploadResourceForm units={units} />
        </Suspense>
      </div>
    </main>
  );
}
