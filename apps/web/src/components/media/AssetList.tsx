'use client';

import React, { useEffect, useState } from 'react';
import { Film, CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { AssetResponse, JobProgressEvent } from '@frameflow/shared';
import { useProjectWebSocket } from '../../hooks/useProjectWebSocket';

interface AssetListProps {
  projectId: string;
  refreshTrigger?: number;
}

export function AssetList({ projectId, refreshTrigger }: AssetListProps) {
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveProgress, setLiveProgress] = useState<Record<string, { progress: number; message: string }>>({});

  const { lastEvent } = useProjectWebSocket(projectId);

  const fetchAssets = async () => {
    try {
      const data = await apiFetch<{ assets: AssetResponse[] }>(`/api/projects/${projectId}/assets`);
      setAssets(data.assets);
    } catch (err) {
      console.error('Failed to load assets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAssets();
  }, [projectId, refreshTrigger]);

  // Update live progress from WebSocket events
  useEffect(() => {
    if (!lastEvent || !lastEvent.assetId) return;

    const { assetId, status, progress, message } = lastEvent;

    setLiveProgress((prev) => ({
      ...prev,
      [assetId]: { progress, message: message || '' },
    }));

    if (status === 'DONE' || status === 'FAILED') {
      void fetchAssets();
    }
  }, [lastEvent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Loading media assets...</span>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center p-8 bg-surface/30 rounded-xl border border-border text-gray-400">
        <Film className="w-8 h-8 mx-auto mb-2 text-gray-600" />
        <p className="text-sm">No video assets uploaded yet.</p>
      </div>
    );
  }

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {assets.map((asset) => {
        const live = liveProgress[asset.id];
        const status = live?.progress === 100 ? 'READY' : asset.status;

        return (
          <div
            key={asset.id}
            className="p-4 bg-surface rounded-xl border border-border hover:border-gray-700 transition flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-blue-400">
                <Film className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-100">{asset.originalName}</h4>
                <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                  <span>{formatDuration(asset.duration)}</span>
                  {asset.width && asset.height && (
                    <span>
                      {asset.width}x{asset.height}
                    </span>
                  )}
                  {asset.fps && <span>{asset.fps} fps</span>}
                  {asset.videoCodec && <span className="uppercase">{asset.videoCodec}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {status === 'QUEUED' && (
                <span className="flex items-center text-xs text-amber-400 font-medium px-2.5 py-1 bg-amber-400/10 rounded-full border border-amber-400/20">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Queued
                </span>
              )}

              {status === 'PROCESSING' && (
                <div className="flex flex-col items-end">
                  <span className="flex items-center text-xs text-blue-400 font-medium px-2.5 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Processing {live?.progress ?? 0}%
                  </span>
                  {live?.message && (
                    <span className="text-[11px] text-gray-500 mt-1">{live.message}</span>
                  )}
                </div>
              )}

              {status === 'READY' && (
                <span className="flex items-center text-xs text-emerald-400 font-medium px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Ready (720p Proxy)
                </span>
              )}

              {status === 'FAILED' && (
                <span className="flex items-center text-xs text-red-400 font-medium px-2.5 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Failed
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

