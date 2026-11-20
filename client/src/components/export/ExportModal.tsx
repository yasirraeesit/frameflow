'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { ExportPreset, RenderJobResponse, JobProgressEvent } from '@frameflow/shared';
import { useTimelineStore } from '../../store/timeline.store';
import { formatTimecode } from '../../lib/timecode';
import {
  Download,
  Film,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

interface ExportModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  lastWsEvent: JobProgressEvent | null;
}

export function ExportModal({ projectId, isOpen, onClose, lastWsEvent }: ExportModalProps) {
  const [preset, setPreset] = useState<ExportPreset>('1080p_h264');
  const [activeJob, setActiveJob] = useState<RenderJobResponse | null>(null);
  const [renderHistory, setRenderHistory] = useState<RenderJobResponse[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const timeline = useTimelineStore((s) => s.timeline);
  const duration = timeline?.duration ?? 0;
  const fps = timeline?.fps ?? 30;

  // Load existing render history
  const fetchRenders = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiFetch<{ renderJobs: RenderJobResponse[] }>(
        `/api/projects/${projectId}/renders`
      );
      setRenderHistory(res.renderJobs);

      // If an active job is still queued or rendering, track it
      const inFlight = res.renderJobs.find(
        (j) => j.status === 'QUEUED' || j.status === 'RENDERING'
      );
      if (inFlight) {
        setActiveJob(inFlight);
      }
    } catch (err) {
      console.error('Failed to load render jobs:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchRenders();
    }
  }, [isOpen, projectId]);

  // Update active job progress from live WebSocket events
  useEffect(() => {
    if (!lastWsEvent || !activeJob) return;

    if (lastWsEvent.renderJobId === activeJob.id) {
      setActiveJob((prev) => {
        if (!prev) return null;
        const newStatus =
          lastWsEvent.status === 'DONE'
            ? 'COMPLETED'
            : lastWsEvent.status === 'FAILED'
            ? 'FAILED'
            : 'RENDERING';

        return {
          ...prev,
          progress: lastWsEvent.progress,
          status: newStatus,
          errorMessage: lastWsEvent.error ?? prev.errorMessage,
        };
      });

      if (lastWsEvent.status === 'DONE' || lastWsEvent.status === 'FAILED') {
        void fetchRenders();
      }
    }
  }, [lastWsEvent, activeJob]);

  if (!isOpen) return null;

  const handleStartRender = async () => {
    if (isStarting) return;
    try {
      setIsStarting(true);
      const res = await apiFetch<{ renderJob: RenderJobResponse }>(
        `/api/projects/${projectId}/renders`,
        {
          method: 'POST',
          body: JSON.stringify({ preset }),
        }
      );
      setActiveJob(res.renderJob);
      await fetchRenders();
    } catch (err) {
      console.error('Failed to trigger render:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancelRender = async () => {
    if (!activeJob || isCancelling) return;
    try {
      setIsCancelling(true);
      const res = await apiFetch<{ renderJob: RenderJobResponse }>(
        `/api/projects/${projectId}/renders/${activeJob.id}/cancel`,
        { method: 'POST' }
      );
      setActiveJob(res.renderJob);
      await fetchRenders();
    } catch (err) {
      console.error('Failed to cancel render:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none">
      <div className="bg-studio-surface border border-studio-border rounded-lg w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-studio-border flex items-center justify-between bg-studio-surface">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide">Export Timeline Video</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-studio-surface-sub transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-5 bg-studio-bg">
          {/* Active Job Progress View */}
          {activeJob && (activeJob.status === 'QUEUED' || activeJob.status === 'RENDERING') ? (
            <div className="p-4 rounded border border-blue-900/60 bg-studio-panel flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-xs font-semibold text-white">
                    {activeJob.status === 'QUEUED'
                      ? 'Queued in BullMQ worker...'
                      : 'Compiling FFmpeg filtergraph & rendering...'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-blue-400 tabular-nums">
                  {activeJob.progress}%
                </span>
              </div>

              {/* High-Precision Progress bar */}
              <div className="w-full bg-studio-bg border border-studio-border rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${activeJob.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-studio-text-muted font-mono">
                  Preset: {activeJob.preset}
                </span>
                <button
                  onClick={handleCancelRender}
                  disabled={isCancelling}
                  className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/40 border border-red-900/60 rounded transition"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Export'}
                </button>
              </div>
            </div>
          ) : activeJob && activeJob.status === 'COMPLETED' ? (
            <div className="p-4 rounded border border-emerald-900/60 bg-studio-panel flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-semibold text-white">Video Render Complete!</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {activeJob.downloadUrl && (
                  <a
                    href={activeJob.downloadUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Master MP4</span>
                  </a>
                )}
                <button
                  onClick={() => setActiveJob(null)}
                  className="px-3 py-2 bg-studio-surface-sub hover:bg-studio-border text-zinc-300 rounded text-xs font-medium transition border border-studio-border"
                >
                  New Export
                </button>
              </div>
            </div>
          ) : activeJob && activeJob.status === 'FAILED' ? (
            <div className="p-4 rounded border border-red-900/60 bg-studio-panel flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <span className="text-xs font-semibold text-white">Render Failed</span>
              </div>
              <p className="text-[11px] text-zinc-400 break-words font-mono">
                {activeJob.errorMessage || 'An error occurred during rendering'}
              </p>
              <button
                onClick={() => setActiveJob(null)}
                className="mt-2 px-3 py-1.5 bg-studio-surface-sub hover:bg-studio-border text-zinc-200 text-xs rounded transition self-start border border-studio-border"
              >
                Retry
              </button>
            </div>
          ) : (
            /* Preset Selection Form */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setPreset('1080p_h264')}
                  className={`p-3.5 rounded border cursor-pointer transition flex flex-col justify-between ${
                    preset === '1080p_h264'
                      ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/60'
                      : 'border-studio-border bg-studio-panel hover:border-studio-border-sub'
                  }`}
                >
                  <div>
                    <h3 className="text-xs font-semibold text-white">1080p Full HD</h3>
                    <p className="text-[11px] text-studio-text-muted mt-0.5">1920x1080 • H.264</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-2">5.0 Mbps Master</span>
                </div>

                <div
                  onClick={() => setPreset('720p_h264')}
                  className={`p-3.5 rounded border cursor-pointer transition flex flex-col justify-between ${
                    preset === '720p_h264'
                      ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/60'
                      : 'border-studio-border bg-studio-panel hover:border-studio-border-sub'
                  }`}
                >
                  <div>
                    <h3 className="text-xs font-semibold text-white">720p Fast HD</h3>
                    <p className="text-[11px] text-studio-text-muted mt-0.5">1280x720 • H.264</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-2">2.5 Mbps Web Proxy</span>
                </div>
              </div>

              {/* Specs overview */}
              <div className="p-3 rounded bg-studio-panel border border-studio-border text-[11px] text-studio-text-muted space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Timeline Duration:</span>
                  <span className="text-zinc-200 tabular-nums">{formatTimecode(duration, fps)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frame Rate:</span>
                  <span className="text-zinc-200 tabular-nums">{fps} FPS</span>
                </div>
                <div className="flex justify-between">
                  <span>Audio Codec:</span>
                  <span className="text-zinc-200">AAC Stereo 48kHz</span>
                </div>
              </div>

              <button
                onClick={handleStartRender}
                disabled={isStarting || duration <= 0}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
              >
                {isStarting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
                <span>Dispatch Render Job</span>
              </button>
            </div>
          )}

          {/* Past Exports History */}
          <div className="pt-2 border-t border-studio-border">
            <h4 className="text-[10px] font-semibold text-studio-text-dim uppercase tracking-wider mb-2 font-mono">
              Recent Render Jobs
            </h4>
            {loadingHistory ? (
              <div className="py-4 text-center text-xs text-zinc-500">Loading history...</div>
            ) : renderHistory.length === 0 ? (
              <div className="py-4 text-center text-xs text-zinc-600 font-mono">No previous renders found.</div>
            ) : (
              <div className="space-y-1.5">
                {renderHistory.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className="p-2.5 rounded bg-studio-panel border border-studio-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-studio-surface border border-studio-border text-zinc-300">
                        {job.preset}
                      </span>
                      <span className="text-studio-text-dim text-[11px] font-mono">
                        {new Date(job.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {job.status === 'COMPLETED' && job.downloadUrl ? (
                        <a
                          href={job.downloadUrl}
                          download
                          className="text-emerald-400 hover:text-emerald-300 text-xs font-medium flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono uppercase">{job.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
