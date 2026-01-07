import { prisma } from "@/app/lib/db";
import { EditAssignmentForm } from "@/app/components/EditAssignmentForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAssignmentPage({ params }: PageProps) {
  const { id } = await params;

  const [assignment, units] = await Promise.all([
    prisma.assignment.findUnique({
      where: { id },
    }),
    prisma.unit.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!assignment) {
    notFound();
  }

  return (
    <main className="min-h-screen p-6 md:p-12 bg-muted/10">
      <EditAssignmentForm assignment={assignment} units={units} />
    </main>
  );
}
