import { prisma } from "@/app/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Download, Youtube, ExternalLink, ChevronRight, Upload } from "lucide-react";
import { DownloadAllButton } from "@/app/components/DownloadAllButton";
import { ResourceCard } from "@/app/components/ResourceCard";
import { AssignmentCard } from "@/app/components/AssignmentCard";

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
                                <ResourceCard key={resource.id} resource={resource} />
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
                                <AssignmentCard key={assignment.id} assignment={assignment} />
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
