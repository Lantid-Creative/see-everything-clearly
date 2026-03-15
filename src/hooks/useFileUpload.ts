import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export function useFileUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<FileAttachment | null> => {
      if (!user) return null;
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("attachments")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        console.error("Upload error:", error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from("attachments")
        .getPublicUrl(path);

      return {
        name: file.name,
        url: urlData.publicUrl,
        type: file.type,
        size: file.size,
      };
    },
    [user]
  );

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      const uploaded: FileAttachment[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadFile(file);
        if (result) uploaded.push(result);
      }
      setPendingFiles((prev) => [...prev, ...uploaded]);
      setUploading(false);
      return uploaded;
    },
    [uploadFile]
  );

  const removePending = useCallback((index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearPending = useCallback(() => {
    setPendingFiles([]);
  }, []);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return {
    uploading,
    pendingFiles,
    setPendingFiles,
    uploadFiles,
    removePending,
    clearPending,
    openFilePicker,
    inputRef,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageFile(type: string): boolean {
  return type.startsWith("image/");
}
