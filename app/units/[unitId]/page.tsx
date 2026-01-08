import { prisma } from "@/app/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Download, Youtube, ExternalLink, ChevronRight, Upload } from "lucide-react";
import { DownloadAllButton } from "@/app/components/DownloadAllButton";

interface UnitPageProps {
  params: Promise<{ unitId: string }>;
}

export const dynamic = "force-dynamic";

export default async function UnitDetailPage({ params }: UnitPageProps) {
  const { unitId } = await params;

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      year: true,
      resources: {
        orderBy: { createdAt: "desc" },
      },
      assignments: {
        include: {
          solutions: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!unit) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-[#030712] to-[#111827]">
      <div className="container mx-auto max-w-6xl">
        
        {/* Breadcrumb & Header */}
        <div className="space-y-6 mb-16">
            <nav className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <Link href="/units" className="hover:text-white transition-colors">Units</Link>
                <ChevronRight size={14} />
                <span className="text-white">{unit.year.name}</span>
            </nav>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                <div>
                   <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-2">{unit.name}</h1>
                   <p className="text-lg text-gray-400">Access all study materials and assignments in one place.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <DownloadAllButton unitId={unit.id} />
                    <Link
                        href={`/upload?unitId=${unit.id}`}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                    >
                        <Upload size={14} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                        <span className="hidden sm:inline">Contribute</span>
                        <span className="sm:hidden">Add</span>
                    </Link>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
            
            {/* LEFT COLUMN: Resources */}
            <div className="lg:col-span-2 space-y-12">
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                             <FileText size={20} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Learning Resources</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-gray-400">{unit.resources.length}</span>
                    </div>

                    {unit.resources.length === 0 ? (
                        <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center">
                            <p className="text-gray-500">No resources uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {unit.resources.map((resource) => (
                                <div key={resource.id} className="group flex flex-col md:flex-row gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all">
                                    
                                    {/* Thumbnail */}
                                    <div className="flex-shrink-0 w-full md:w-48">
                                        {resource.fileType === "youtube" ? (
                                            <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg relative group-hover:ring-2 ring-indigo-500/50 transition-all">
                                                <iframe 
                                                    src={`https://www.youtube.com/embed/${resource.fileUrl.split('v=')[1]?.substring(0, 11) || resource.fileUrl.split('/').pop()}`}
                                                    title={resource.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="w-full h-full"
                                                ></iframe>
                                            </div>
                                        ) : (
                                            <div className="h-full min-h-[100px] rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl shadow-inner border border-white/5">
                                                {resource.fileType === "pdf" && "📄"}
                                                {resource.fileType === "docx" && "📝"}
                                                {resource.fileType === "ppt" && "📊"}
                                                {resource.fileType === "zip" && "📦"}
                                                {resource.fileType === "file" && "📎"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-white/10 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">{resource.fileType}</span>
                                                {resource.isOfficial && <span className="bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Official</span>}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-100 group-hover:text-indigo-400 transition-colors line-clamp-1">{resource.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">Uploaded by {resource.uploadedBy} • {new Date(resource.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        
                                        <div className="mt-4 md:mt-0">
                                            <a 
                                                href={resource.fileUrl} 
                                                target="_blank" 
                                                className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                                                    resource.fileType === 'youtube' ? "text-red-400 hover:text-red-300" : "text-indigo-400 hover:text-indigo-300"
                                                }`}
                                            >
                                                {resource.fileType === 'youtube' ? <><Youtube size={16} /> Watch Video</> : <><Download size={16} /> Download File</>}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* RIGHT COLUMN: Assignments */}
            <div className="space-y-8">
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                             <FileText size={20} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Assignments</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-gray-400">{unit.assignments.length}</span>
                    </div>

                    <div className="space-y-6">
                        {unit.assignments.length === 0 ? (
                            <p className="text-gray-500 text-sm">No assignments posted yet.</p>
                        ) : (
                            unit.assignments.map((assignment) => (
                                <div key={assignment.id} className="p-5 rounded-2xl bg-[#1f2937]/50 border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="font-bold text-gray-100">{assignment.title}</h3>
                                        {assignment.fileUrl && (
                                            <a href={assignment.fileUrl} target="_blank" className="text-gray-400 hover:text-white transition-colors">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </div>
                                    
                                    {assignment.notes && <p className="text-sm text-gray-400 mt-2 line-clamp-3">{assignment.notes}</p>}
                                    
                                    <div className="mt-5 pt-4 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Solutions</span>
                                            <Link href={`/upload/solution?assignmentId=${assignment.id}`} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
                                                + Submit
                                            </Link>
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            {assignment.solutions.map(sol => (
                                                <div key={sol.id} className="flex items-center justify-between p-2 rounded-lg bg-black/20 text-xs">
                                                    <span className="text-gray-300 truncate max-w-[120px]">
                                                        {sol.isOfficial ? <span className="text-emerald-400">Official (GTSS)</span> : sol.uploadedBy}
                                                    </span>
                                                    <a href={sol.fileUrl} target="_blank" className="text-gray-500 hover:text-white">View</a>
                                                </div>
                                            ))}
                                            {assignment.solutions.length === 0 && <span className="text-xs text-gray-600 block italic">None yet</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

        </div>
      </div>
    </main>
  );
}
