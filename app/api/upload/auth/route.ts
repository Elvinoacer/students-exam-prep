import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // Authenticate user here if needed
        // For now, we allow public uploads as per MVP requirements
        // You could check cookies or headers here
        return {
          allowedContentTypes: [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
            "application/msword", // doc
            "application/vnd.ms-powerpoint", // ppt
            "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
            "application/zip",
            "application/x-zip-compressed",
            "application/vnd.rar",
            "application/x-rar-compressed",
            "image/jpeg",
            "image/png",
          ],
          tokenPayload: JSON.stringify({
            // optional payload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This is called after the upload is completed
        // You can save the blob.url to your database here if you want trigger-based saving
        // But for our flow, we save the URL in the form submission *after* upload to keep it simple
        // and consistent with YouTube link handling.
        // So we might not strictly need to do DB logic here, but it's good practice for tracking.
        console.log("Upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times if you return 400
    );
  }
}
