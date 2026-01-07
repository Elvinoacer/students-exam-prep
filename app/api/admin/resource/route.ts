import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing ID" },
        { status: 400 }
      );
    }

    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // If record not found (P2025), consider it a success (idempotent)
    if (error.code === 'P2025') {
       return NextResponse.json({ success: true });
    }

    console.error("Delete resource error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
