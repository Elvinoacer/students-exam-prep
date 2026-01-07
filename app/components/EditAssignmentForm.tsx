"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

interface EditAssignmentFormProps {
  assignment: {
    id: string;
    title: string;
    notes: string | null;
    unitId: string;
    fileUrl: string | null;
  };
  units: { id: string; name: string }[];
}

export function EditAssignmentForm({ assignment, units }: EditAssignmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial State from Props
  const [currentFileUrl, setCurrentFileUrl] = useState(assignment.fileUrl);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const unitId = formData.get("unitId") as string;
    const notes = formData.get("notes") as string;
    const file = formData.get("file") as File; 
    
    let finalFileUrl = currentFileUrl;

    try {
      // 1. Upload NEW File if present
      if (file && file.size > 0) {
        const newBlob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload/auth",
        });
        finalFileUrl = newBlob.url;
      }

      // 2. Prepare Update Data
      const payload = {
          id: assignment.id,
          title,
          unitId,
          notes,
          fileUrl: finalFileUrl
      };

      const response = await fetch("/api/admin/assignment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Update failed");
      }

      router.push("/admin/assignments");
      router.refresh();
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-xl mx-auto p-6 bg-card rounded-lg border shadow-sm">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold">Edit Assignment</h2>
        <p className="text-muted text-sm mt-1">
          Update details for <span className="font-semibold text-foreground">{assignment.title}</span>
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md">
          {error}
        </div>
      )}

      {/* Assignment Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Assignment Title
        </label>
        <input
          name="title"
          id="title"
          required
          defaultValue={assignment.title}
          className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Unit Selection */}
      <div className="space-y-2">
        <label htmlFor="unitId" className="text-sm font-medium">
          Unit
        </label>
        <select
          name="unitId"
          id="unitId"
          required
          defaultValue={assignment.unitId}
          className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
      </div>

      {/* Notes / Markdown */}
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Description / Notes
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={5}
          defaultValue={assignment.notes || ""}
          className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label htmlFor="file" className="text-sm font-medium block">
          Assignment File (PDF)
        </label>
        
        {currentFileUrl && (
            <div className="text-sm flex items-center gap-2 mb-2 p-2 bg-muted rounded">
                <span>📎 Current:</span>
                <a href={currentFileUrl} target="_blank" className="text-primary hover:underline truncate max-w-[200px]">
                    {currentFileUrl.split('/').pop()}
                </a>
            </div>
        )}

        <input
          type="file"
          name="file"
          id="file"
          accept=".pdf,.doc,.docx"
          className="w-full px-3 py-2 text-sm rounded-md border bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
        <p className="text-xs text-muted">
          Upload new file to replace the current one.
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 px-4 rounded-lg border font-medium hover:bg-muted transition-colors"
        >
            Cancel
        </button>
        <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
        >
            {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
