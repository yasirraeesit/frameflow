'use client';

import React, { useState, useRef } from 'react';
import { Upload, Film, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE, getAuthToken, apiFetch } from '../../lib/api';
import { InitUploadResponse, CompleteUploadInput } from '@frameflow/shared';

interface ChunkedUploaderProps {
  projectId: string;
  onUploadComplete?: () => void;
}

export function ChunkedUploader({ projectId, onUploadComplete }: ChunkedUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setStatusText('Initializing multipart upload...');

    try {
      // 1. Init upload
      const initRes = await apiFetch<InitUploadResponse>(
        `/api/projects/${projectId}/assets/upload/init`,
        {
          method: 'POST',
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type || 'video/mp4',
            sizeBytes: file.size,
          }),
        }
      );

      const { uploadId, key, partSize } = initRes;
      const totalParts = Math.ceil(file.size / partSize);
      const parts: { partNumber: number; etag: string }[] = [];
      const token = getAuthToken();

      // 2. Upload chunks in sequential order (or parallel batches)
      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * partSize;
        const end = Math.min(start + partSize, file.size);
        const chunkBlob = file.slice(start, end);

        setStatusText(`Uploading chunk ${partNumber} of ${totalParts}...`);

        const chunkUrl = `${API_BASE}/api/projects/${projectId}/assets/upload/chunk?uploadId=${encodeURIComponent(
          uploadId
        )}&key=${encodeURIComponent(key)}&partNumber=${partNumber}`;

        const res = await fetch(chunkUrl, {
          method: 'PUT',
          headers: {
            authorization: token ? `Bearer ${token}` : '',
            'content-type': 'application/octet-stream',
          },
          body: chunkBlob,
        });

        if (!res.ok) {
          throw new Error(`Failed to upload chunk ${partNumber}`);
        }

        const data = (await res.json()) as { etag: string };
        parts.push({ partNumber, etag: data.etag });

        const pct = Math.round((partNumber / totalParts) * 100);
        setProgress(pct);
      }

      // 3. Complete upload
      setStatusText('Assembling media in storage...');
      const completePayload: CompleteUploadInput = {
        uploadId,
        key,
        filename: file.name,
        mimeType: file.type || 'video/mp4',
        sizeBytes: file.size,
        parts,
      };

      await apiFetch(`/api/projects/${projectId}/assets/upload/complete`, {
        method: 'POST',
        body: JSON.stringify(completePayload),
      });

      setStatusText('Upload complete! Queued for processing.');
      setProgress(100);
      onUploadComplete?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      setStatusText('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      void uploadFile(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition ${
          isUploading
            ? 'border-blue-500 bg-studio-surface/50 cursor-wait'
            : 'border-studio-border hover:border-blue-500/60 bg-studio-surface/30 hover:bg-studio-surface-sub/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-1.5 py-1">
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          ) : (
            <Upload className="w-5 h-5 text-zinc-400" />
          )}

          <div className="text-xs text-zinc-300 font-medium">
            {isUploading ? 'Uploading Footage...' : 'Drop video here or click to browse'}
          </div>

          <p className="text-[10px] text-studio-text-dim font-mono">
            MP4, MOV, WebM • Parallel 5MB Chunks
          </p>
        </div>
      </div>

      {/* Progress Bar & Status Readout */}
      {isUploading && (
        <div className="space-y-1 mt-1 bg-studio-panel p-2 rounded border border-studio-border">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-zinc-300 truncate">{statusText}</span>
            <span className="text-blue-400 font-bold tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-studio-bg rounded-full overflow-hidden border border-studio-border">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 border border-red-900/60 p-2 rounded">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  );
}
