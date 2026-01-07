import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const type = formData.get("type") as string; // 'file' or 'youtube'
    const title = formData.get("title") as string;
    const unitId = formData.get("unitId") as string;
    const uploadedBy = formData.get("uploadedBy") as string;

    if (!title || !unitId || !uploadedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let fileUrl = "";
    let fileType = "unknown";

    if (type === "youtube") {
      const url = formData.get("url") as string;
      if (!url) {
        return NextResponse.json(
          { error: "Missing YouTube URL" },
          { status: 400 }
        );
      }
      fileUrl = url;
      fileType = "youtube";
    } else {
      // Check if client already uploaded the file (Vercel Blob client-side)
      const existingFileUrl = formData.get("fileUrl") as string;
      const existingFileType = formData.get("fileType") as string;

      if (existingFileUrl) {
          fileUrl = existingFileUrl;
          fileType = existingFileType || "file";
      } else {
          // Fallback: Server-side upload (legacy or if client-side fails)
          const file = formData.get("file") as File;
          if (!file) {
            return NextResponse.json(
              { error: "No file provided" },
              { status: 400 }
            );
          }

          // Upload to Vercel Blob
          const blob = await put(file.name, file, {
            access: "public",
          });
          fileUrl = blob.url;
          
          // Determine simplistic file type
          const ext = file.name.split(".").pop()?.toLowerCase();
          if (ext === "pdf") fileType = "pdf";
          else if (["doc", "docx"].includes(ext || "")) fileType = "docx";
          else if (["ppt", "pptx"].includes(ext || "")) fileType = "ppt";
          else if (ext === "zip") fileType = "zip";
          else fileType = "file";
      }
    }

    // Save to DB
    const resource = await prisma.resource.create({
      data: {
        title,
        unitId,
        fileUrl,
        fileType,
        uploadedBy,
        isOfficial: uploadedBy.toLowerCase().includes("gtss"), 
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Check server logs." },
      { status: 500 }
    );
  }
}
