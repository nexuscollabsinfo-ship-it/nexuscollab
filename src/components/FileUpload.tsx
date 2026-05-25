import { useState, useRef, useCallback } from "react";
import { Upload, X, File, FileImage, Film, FileArchive, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface FileUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  uploadedFiles?: UploadedFile[];
  maxFiles?: number;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const DEFAULT_MAX_FILES = 5;

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return Film;
  if (type.includes("zip")) return FileArchive;
  if (type.includes("pdf")) return FileText;
  return File;
}

function getFileColor(type: string): string {
  if (type.startsWith("image/")) return "#22d3ee";
  if (type.startsWith("video/")) return "#f472b6";
  if (type.includes("pdf")) return "#ef4444";
  if (type.includes("zip")) return "#fbbf24";
  if (type.includes("word") || type.includes("document")) return "#3b82f6";
  return "#6b7280";
}

export function FileUpload({ onUpload, uploadedFiles = [], maxFiles = DEFAULT_MAX_FILES }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(uploadedFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAtLimit = files.length >= maxFiles;
  const remaining = maxFiles - files.length;

  const processFile = useCallback(async (file: File): Promise<UploadedFile | null> => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`"${file.name}" is too large. Maximum size is 50MB.`);
      return null;
    }

    setUploadingName(file.name);
    setUploadProgress(0);

    // Animate progress
    for (let p = 0; p <= 100; p += 20) {
      setUploadProgress(p);
      await new Promise(r => setTimeout(r, 80));
    }

    setUploadProgress(100);
    await new Promise(r => setTimeout(r, 200));

    const result: UploadedFile = {
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type || "application/octet-stream",
      size: file.size,
    };

    setUploadingName(null);
    setUploadProgress(0);
    return result;
  }, []);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    if (files.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed. Remove files to add more.`);
      return;
    }

    const toProcess = Array.from(fileList).slice(0, remaining);
    const results: UploadedFile[] = [];

    for (const file of toProcess) {
      const uploaded = await processFile(file);
      if (uploaded) results.push(uploaded);
    }

    if (results.length > 0) {
      const updated = [...files, ...results];
      // Enforce max
      const final = updated.slice(0, maxFiles);
      if (updated.length > maxFiles) {
        toast.info(`Only kept first ${maxFiles} files.`);
      }
      setFiles(final);
      onUpload(final);
      toast.success(`${results.length} file${results.length > 1 ? "s" : ""} uploaded.`);
    }
  }, [files, maxFiles, remaining, processFile, onUpload]);

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onUpload(updated);
  }

  return (
    <div className="space-y-3">
      {/* File count bar */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#666]">
              {files.length} / {maxFiles} files
            </span>
            {isAtLimit && (
              <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                <AlertTriangle className="w-3 h-3" /> Limit reached
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isAtLimit ? "bg-amber-400" : "bg-[#3b82f6]"}`}
              style={{ width: `${(files.length / maxFiles) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload zone */}
      {!isAtLimit && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging ? "border-[#3b82f6] bg-[#3b82f6]/5" : "border-[#2a2a2a] hover:border-[#3b82f6]/40 hover:bg-[#0e0e0e]"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <p className="text-sm text-[#999]">
            Drop files here or <span className="text-[#3b82f6] font-medium">browse</span>
          </p>
          <p className="text-xs text-[#555] mt-1.5">
            Images, Videos, PDFs, DOC, ZIP &middot; Max 50MB each &middot; Up to {maxFiles} files
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf,.zip,.doc,.docx,.txt"
            onChange={e => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* Uploading progress */}
      {uploadingName && (
        <div className="p-4 rounded-xl bg-[#111] border border-[#222] space-y-2">
          <div className="flex items-center gap-3">
            <Upload className="w-4 h-4 text-[#3b82f6] animate-pulse" />
            <span className="text-xs text-[#999] flex-1 truncate">{uploadingName}</span>
            <span className="text-xs text-[#3b82f6] font-medium">{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => {
            const Icon = getFileIcon(file.type);
            const color = getFileColor(file.type);
            return (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#1f1f1f] bg-[#0e0e0e] group hover:border-[#333] transition-all"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{file.name}</p>
                  <p className="text-xs text-[#555]">{formatSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#555] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
