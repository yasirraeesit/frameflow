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

        const { etag } = await res.json();
        parts.push({ partNumber, etag });

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
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    const file = e.dataTransfer.files[0];
    if (file) {
      void uploadFile(file);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer select-none ${
        isUploading
          ? 'border-blue-500/50 bg-blue-950/10'
          : 'border-border hover:border-gray-500 bg-surface/50 hover:bg-surface'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center justify-center space-y-3">
        {isUploading ? (
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        ) : error ? (
          <AlertCircle className="w-10 h-10 text-red-400" />
        ) : progress === 100 ? (
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        ) : (
          <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
            <Upload className="w-6 h-6" />
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-gray-200">
            {isUploading ? statusText : 'Drop raw footage here or click to browse'}
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Supports MP4, MOV, MKV, WebM (chunked S3 upload)
          </p>
        </div>

        {isUploading && (
          <div className="w-full max-w-xs mt-2">
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 mt-1">
              <span>{statusText}</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </div>
    </div>
  );
}

