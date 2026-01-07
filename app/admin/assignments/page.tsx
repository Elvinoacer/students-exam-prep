import { prisma } from "@/app/lib/db";
import Link from "next/link";
import { ListChecks, Plus, PenSquare, Trash2, ArrowLeft, Calendar, FileText } from "lucide-react";
import { DeleteButton } from "@/app/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminAssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
        unit: true,
        _count: {
            select: { solutions: true }
        }
    }
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-white/10">
            <div>
               <Link href="/admin" className="text-gray-400 hover:text-white text-xs sm:text-sm flex items-center gap-2 mb-2 sm:mb-4 transition-colors">
                  <ArrowLeft size={16} /> Back to Dashboard
               </Link>
               <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Manage Assignments</h1>
               <p className="text-sm sm:text-base text-gray-400">View, edit, or delete student assignments.</p>
            </div>
            <Link 
                href="/admin/assignment"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm sm:text-base font-bold hover:bg-indigo-500 hover:scale-105 transition-all shadow-lg shadow-indigo-500/20"
            >
                <Plus size={18} /> New Assignment
            </Link>
        </div>

        {/* Assignments List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            {assignments.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                    <ListChecks className="mx-auto text-gray-600 mb-4" size={40} />
                    <p className="text-gray-500 text-base sm:text-lg">No assignments found.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View (Hidden on Mobile) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-black/20 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Unit</th>
                                    <th className="px-6 py-4">Solutions</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {assignments.map((assignment) => (
                                    <tr key={assignment.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{assignment.title}</div>
                                            {assignment.fileUrl && (
                                                <a href={assignment.fileUrl} target="_blank" className="text-xs text-indigo-400 hover:text-indigo-300">View File</a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-gray-300 border border-white/5">
                                                {assignment.unit.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {assignment._count.solutions} submissions
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(assignment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Link 
                                                    href={`/admin/assignments/${assignment.id}`}
                                                    className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <PenSquare size={16} />
                                                </Link>
                                                <DeleteButton id={assignment.id} endpoint="/api/admin/assignment" itemName="Assignment" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View (Visible on Mobile) */}
                    <div className="md:hidden divide-y divide-white/5">
                        {assignments.map((assignment) => (
                            <div key={assignment.id} className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-white text-base">{assignment.title}</h3>
                                        {assignment.fileUrl && (
                                            <a href={assignment.fileUrl} target="_blank" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1">
                                                <FileText size={12} /> View File
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link 
                                            href={`/admin/assignments/${assignment.id}`}
                                            className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"
                                        >
                                            <PenSquare size={16} />
                                        </Link>
                                        <DeleteButton id={assignment.id} endpoint="/api/admin/assignment" itemName="Assignment" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                                    <span className="bg-white/5 px-2 py-1 rounded-md border border-white/5">{assignment.unit.name}</span>
                                    <span className="flex items-center gap-1"><ListChecks size={12} /> {assignment._count.solutions}</span>
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(assignment.createdAt).toLocaleDateString()}</span>
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
