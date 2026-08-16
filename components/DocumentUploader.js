"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Loader2,
  CheckCircle,
  X,
  AlertCircle,
  FileUp,
} from "lucide-react";

export default function DocumentUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "metadata",
        JSON.stringify({ filename: file.name, type: file.type })
      );

      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadResult({
        success: true,
        message: data.message,
        filename: file.name,
      });
    } catch (err) {
      setUploadResult({
        success: false,
        message: err.message,
        filename: file.name,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("text", textInput);
      formData.append("metadata", JSON.stringify({ type: "manual_text" }));

      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ingestion failed");
      }

      setUploadResult({
        success: true,
        message: data.message,
        filename: "Pasted text",
      });
      setTextInput("");
    } catch (err) {
      setUploadResult({
        success: false,
        message: err.message,
        filename: "Pasted text",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-white/10 hover:border-white/20 hover:bg-white/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleFile(file);
          }}
          accept=".txt,.md,.pdf,.csv,.json"
          className="hidden"
        />
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isDragging ? "bg-blue-500/20" : "bg-white/5"
          }`}
        >
          <FileUp
            size={22}
            className={isDragging ? "text-blue-400" : "text-gray-500"}
          />
        </div>
        <div>
          {isUploading ? (
            <p className="text-sm font-medium text-blue-400 flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Processing document...
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-blue-400 underline underline-offset-2">
                Browse
              </span>{" "}
              or drag and drop
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            TXT, MD, CSV, JSON &mdash; up to 10 MB
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center">
        <div className="flex-1 border-t border-white/10" />
        <span className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          or paste text
        </span>
        <div className="flex-1 border-t border-white/10" />
      </div>

      {/* Text input */}
      <form onSubmit={handleTextSubmit} className="space-y-3">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste your document content here..."
          rows={4}
          disabled={isUploading}
          className="w-full resize-none rounded-xl border border-white/10 bg-[#2f2f2f] px-4 py-3 text-sm text-gray-100 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isUploading || !textInput.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <FileText size={15} />
          )}
          {isUploading ? "Processing..." : "Ingest Text"}
        </button>
      </form>

      {/* Result */}
      {uploadResult && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            uploadResult.success
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-red-500/10 border-red-500/20"
          }`}
        >
          {uploadResult.success ? (
            <CheckCircle
              size={16}
              className="text-emerald-400 mt-0.5 shrink-0"
            />
          ) : (
            <AlertCircle
              size={16}
              className="text-red-400 mt-0.5 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold ${
                uploadResult.success ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {uploadResult.message}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {uploadResult.filename}
            </p>
          </div>
          <button
            onClick={() => setUploadResult(null)}
            className="shrink-0 w-5 h-5 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
