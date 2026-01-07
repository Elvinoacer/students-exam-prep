import { prisma } from "@/app/lib/db";
import Link from "next/link";
import { FolderOpen, ArrowLeft, Download, ExternalLink, Youtube, FileText, User } from "lucide-react";
import { DeleteButton } from "@/app/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    include: { unit: true }
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
         {/* Header */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-white/10">
            <div>
               <Link href="/admin" className="text-gray-400 hover:text-white text-xs sm:text-sm flex items-center gap-2 mb-2 sm:mb-4 transition-colors">
                  <ArrowLeft size={16} /> Back to Dashboard
               </Link>
               <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Manage Resources</h1>
               <p className="text-sm sm:text-base text-gray-400">Review and moderate all uploaded materials.</p>
            </div>
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 rounded-full border border-white/10 text-xs sm:text-sm font-medium text-gray-300">
               Total: {resources.length} items
            </div>
        </div>

        {/* Resources Grid/List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            {resources.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                    <FolderOpen className="mx-auto text-gray-600 mb-4" size={40} />
                    <p className="text-gray-500 text-base sm:text-lg">No resources uploaded yet.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-black/20 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Unit</th>
                                    <th className="px-6 py-4">Uploader</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {resources.map((res) => (
                                    <tr key={res.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${res.fileType === 'youtube' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {res.fileType === 'youtube' ? <Youtube size={16} /> : <FileText size={16} />}
                                                </div>
                                                <span className="font-bold text-white">{res.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="uppercase text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">
                                                {res.fileType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                             <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-gray-300 border border-white/5">
                                                {res.unit.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 text-sm">
                                            {res.isOfficial ? <span className="text-green-400 font-medium">GTSS Official</span> : res.uploadedBy}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(res.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <a 
                                                    href={res.fileUrl} 
                                                    target="_blank"
                                                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                                    title="View"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                                <DeleteButton id={res.id} endpoint="/api/admin/resource" itemName="Resource" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-white/5">
                        {resources.map((res) => (
                            <div key={res.id} className="p-4 flex flex-col gap-3">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg flex-shrink-0 ${res.fileType === 'youtube' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        {res.fileType === 'youtube' ? <Youtube size={18} /> : <FileText size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-sm truncate">{res.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="uppercase text-[10px] font-bold text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                                                {res.fileType}
                                            </span>
                                            <span className="text-xs text-gray-400 truncate">{res.unit.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                         <a 
                                            href={res.fileUrl} 
                                            target="_blank"
                                            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                        <DeleteButton id={res.id} endpoint="/api/admin/resource" itemName="Res" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 border-t border-white/5 pt-2 mt-1">
                                     <span className="flex items-center gap-1">
                                        <User size={12} /> {res.isOfficial ? <span className="text-green-400">GTSS</span> : res.uploadedBy}
                                     </span>
                                     <span>•</span>
                                     <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>

    </div>
  );
}
