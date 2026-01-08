import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import archiver from "archiver";
import { PassThrough } from "stream";

export async function GET(request: NextRequest) {
  const unitId = request.nextUrl.searchParams.get("unitId");

  try {
    // Fetch resources based on whether unitId is provided
    const resources = await prisma.resource.findMany({
      where: unitId ? { unitId } : undefined,
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        unit: {
          select: { name: true },
        },
      },
    });

    // Filter out YouTube links (can't be zipped)
    const downloadableResources = resources.filter(
      (r) => r.fileType !== "youtube"
    );

    if (downloadableResources.length === 0) {
      return NextResponse.json(
        { error: "No downloadable resources found" },
        { status: 404 }
      );
    }

    // Create a PassThrough stream to pipe the archive
    const passThrough = new PassThrough();

    // Create the archive
    const archive = archiver("zip", {
      zlib: { level: 5 }, // Compression level
    });

    // Pipe archive data to the passthrough stream
    archive.pipe(passThrough);

    // Fetch and append each file to the archive
    for (const resource of downloadableResources) {
      try {
        const response = await fetch(resource.fileUrl);
        if (!response.ok) continue;

        const buffer = await response.arrayBuffer();
        const ext = resource.fileUrl.split(".").pop()?.split("?")[0] || "file";
        const sanitizedTitle = resource.title.replace(/[^a-zA-Z0-9]/g, "_");
        const filename = unitId
          ? `${sanitizedTitle}.${ext}`
          : `${resource.unit.name}/${sanitizedTitle}.${ext}`;

        archive.append(Buffer.from(buffer), { name: filename });
      } catch (err) {
        console.error(`Failed to fetch ${resource.fileUrl}:`, err);
        // Skip this file and continue
      }
    }

    // Finalize the archive
    archive.finalize();

    // Convert PassThrough to a ReadableStream for NextResponse
    const readableStream = new ReadableStream({
      start(controller) {
        passThrough.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        passThrough.on("end", () => {
          controller.close();
        });
        passThrough.on("error", (err) => {
          controller.error(err);
        });
      },
    });

    const zipName = unitId ? "resources.zip" : "all-resources.zip";

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipName}"`,
      },
    });
  } catch (error) {
    console.error("Download ZIP error:", error);
    return NextResponse.json(
      { error: "Failed to create ZIP file" },
      { status: 500 }
    );
  }
}
