import { prisma } from "@/app/lib/db";
import { CreateAssignmentForm } from "@/app/components/CreateAssignmentForm";

export default async function AdminAssignmentPage() {
  const units = await prisma.unit.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="container mx-auto space-y-8 max-w-5xl">
         <header className="flex justify-between items-center border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold">Create Assignment</h1>
            <p className="text-muted">Post a new assignment for students.</p>
          </div>
          <a href="/admin" className="text-sm font-medium hover:underline text-primary">
            ← Back to Dashboard
          </a>
        </header>

        <CreateAssignmentForm units={units} />
      </div>
    </main>
  );
}
