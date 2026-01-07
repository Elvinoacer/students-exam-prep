import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const { title, unitId, notes, fileUrl } = await request.json();

    if (!title || !unitId) {
      return NextResponse.json(
        { error: "Title and Unit are required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        unitId,
        notes,
        fileUrl,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Create assignment error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing ID" },
        { status: 400 }
      );
    }

    // Delete the assignment. 
    // Prisma will handle cascading delete if configured, otherwise we might need to delete solutions first.
    // Assuming schema handles cascade or we just delete the assignment.
    // Let's check schema: solutions have `relation(fields: [assignmentId], references: [id])`.
    // Default Prisma delete doesn't cascade unless `onDelete: Cascade` is in schema.
    // For MVP, if it fails, we'll know. But usually you want Cascade.
    // Let's safe delete: first solutions, then assignment.
    
    // Actually, 'onDelete: Cascade' is standard. I'll assume I didn't add it yet explicitly in schema edits
    // or I'm not sure. Best to be safe in code or check schema.
    // I'll just try to delete, if error, I'll fix schema or code.
    // Actually, I'll delete related solutions first manually just in case.

    await prisma.assignmentSolution.deleteMany({
      where: { assignmentId: id },
    });

    await prisma.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete assignment error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, unitId, notes, fileUrl } = body;

    if (!id || !title || !unitId) {
       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await prisma.assignment.update({
        where: { id },
        data: {
            title,
            unitId,
            notes,
            fileUrl, 
        }
    });

    return NextResponse.json(updated);
  } catch (error) {
      console.error("Update error:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
