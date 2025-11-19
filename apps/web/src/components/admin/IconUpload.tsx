import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadIcon, deleteIcon } from "@/app/admin/actions";
import { toast } from "sonner";

interface IconUploadProps {
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  adminEmail: string;
}

/**
 * Icon upload component
 * PLATFORM.md Phase 6.4
 */
export function IconUpload({
  currentUrl,
  onUploadComplete,
  adminEmail,
}: IconUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const result = await uploadIcon(file);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.url) {
        setPreviewUrl(result.url);
        onUploadComplete(result.url);
        toast.success("Icon uploaded!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Icon upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!previewUrl) return;

    try {
      await deleteIcon(previewUrl);
      setPreviewUrl(undefined);
      onUploadComplete("");
      toast.success("Icon deleted!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Icon could not be deleted");
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Platform Icon
      </label>

      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Platform icon"
            className="h-16 w-16 rounded-md object-cover border border-border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="icon-upload"
          />
          <label
            htmlFor="icon-upload"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Icon
              </>
            )}
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG or SVG • Max 500KB
          </p>
        </div>
      )}
    </div>
  );
}
