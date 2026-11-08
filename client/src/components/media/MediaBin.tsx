'use client';

import React, { useState } from 'react';
import { AssetResponse, Clip } from '@frameflow/shared';
import { useTimelineStore } from '../../store/timeline.store';
import { AddClipCommand } from '@frameflow/shared';
import { formatDuration } from '../../lib/timecode';
import { Film, Plus, Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { ChunkedUploader } from './ChunkedUploader';

interface MediaBinProps {
  projectId: string;
  assets: AssetResponse[];
  onUploadComplete: () => void;
}

export function MediaBin({ projectId, assets, onUploadComplete }: MediaBinProps) {
  const [showUploader, setShowUploader] = useState(false);
  const timeline = useTimelineStore((s) => s.timeline);
  const playhead = useTimelineStore((s) => s.playhead);
  const executeCommand = useTimelineStore((s) => s.executeCommand);

  const handleAddClipToTimeline = (asset: AssetResponse) => {
    if (!timeline) return;

    // Find first non-locked video track
    const videoTrack = timeline.tracks.find((t) => t.type === 'VIDEO' && !t.locked);
    if (!videoTrack) return;

    const proxyUrl = asset.proxyKey ? `http://localhost:9000/proxies/${asset.proxyKey}` : null;
    const thumbnailUrl = asset.thumbnailSpriteKey
      ? `http://localhost:9000/thumbnails/${asset.thumbnailSpriteKey}`
      : null;
    const clipDuration = asset.duration && asset.duration > 0 ? asset.duration : 5;

    const newClip: Clip = {
      id: `clip-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      assetId: asset.id,
      name: asset.originalName,
      start: playhead,
      duration: clipDuration,
      inPoint: 0,
      outPoint: clipDuration,
      speed: 1.0,
      proxyUrl,
      thumbnailUrl,
      textConfig: null,
    };

    executeCommand(new AddClipCommand(videoTrack.id, newClip));
  };

  const handleDragStart = (e: React.DragEvent, asset: AssetResponse) => {
    const proxyUrl = asset.proxyKey ? `http://localhost:9000/proxies/${asset.proxyKey}` : null;
    const thumbnailUrl = asset.thumbnailSpriteKey
      ? `http://localhost:9000/thumbnails/${asset.thumbnailSpriteKey}`
      : null;

    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        id: asset.id,
        filename: asset.originalName,
        duration: asset.duration ?? 5,
        proxyUrl,
        thumbnailUrl,
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      {/* Media Bin Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-semibold text-white">Media Bin</h2>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full font-mono">
            {assets.length}
          </span>
        </div>

        <button
          onClick={() => setShowUploader(!showUploader)}
          className="p-1 px-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition flex items-center gap-1"
        >
          <Upload className="w-3 h-3" />
          <span>Upload</span>
        </button>
      </div>

      {/* Collapsible Upload Panel */}
      {showUploader && (
        <div className="p-3 border-b border-zinc-800 bg-zinc-900/40">
          <ChunkedUploader
            projectId={projectId}
            onUploadComplete={() => {
              onUploadComplete();
              setShowUploader(false);
            }}
          />
        </div>
      )}

      {/* Asset Grid / List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {assets.length === 0 ? (
          <div className="py-12 px-4 text-center text-zinc-500 text-xs">
            No footage uploaded yet. Drag and drop raw videos or click Upload above.
          </div>
        ) : (
          assets.map((asset) => {
            const isReady = asset.status === 'READY';
            const thumbUrl = asset.thumbnailSpriteKey
              ? `http://localhost:9000/thumbnails/${asset.thumbnailSpriteKey}`
              : null;

            return (
              <div
                key={asset.id}
                draggable={isReady}
                onDragStart={(e) => handleDragStart(e, asset)}
                className={`p-2.5 rounded-lg border bg-zinc-900/80 transition flex items-center gap-3 select-none ${
                  isReady
                    ? 'border-zinc-800 hover:border-zinc-600 cursor-grab active:cursor-grabbing hover:bg-zinc-800/60'
                    : 'border-zinc-800/40 opacity-70 cursor-not-allowed'
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="w-14 h-10 bg-black rounded overflow-hidden flex-shrink-0 flex items-center justify-center border border-zinc-800">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={asset.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Film className="w-4 h-4 text-zinc-600" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">
                    {asset.originalName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 font-mono">
                    {asset.duration && <span>{formatDuration(asset.duration)}</span>}
                    {asset.width && asset.height && (
                      <span>
                        {asset.width}x{asset.height}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action / Status */}
                {isReady ? (
                  <button
                    onClick={() => handleAddClipToTimeline(asset)}
                    className="p-1 rounded bg-zinc-800 hover:bg-blue-600 hover:text-white text-zinc-400 transition"
                    title="Add clip to timeline at playhead"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                ) : asset.status === 'PROCESSING' ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
