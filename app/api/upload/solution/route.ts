import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const type = formData.get("type") as string;
    const assignmentId = formData.get("assignmentId") as string;
    const uploadedBy = formData.get("uploadedBy") as string;

    if (!assignmentId || !uploadedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let fileUrl = "";
    
    if (type === "youtube") {
      const url = formData.get("url") as string;
      if (!url) {
        return NextResponse.json(
          { error: "Missing YouTube URL" },
          { status: 400 }
        );
      }
      fileUrl = url;
    } else {
      // File handling
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      const blob = await put(file.name, file, {
        access: "public",
      });
      fileUrl = blob.url;
    }

    // Save to DB
    const solution = await prisma.assignmentSolution.create({
      data: {
        assignmentId,
        fileUrl,
        uploadedBy,
        isOfficial: uploadedBy.toLowerCase().includes("gtss"),
      },
    });

    return NextResponse.json(solution);
  } catch (error) {
    console.error("Upload solution error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
