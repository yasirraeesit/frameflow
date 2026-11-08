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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Export Video</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* Active Job Progress View */}
          {activeJob && (activeJob.status === 'QUEUED' || activeJob.status === 'RENDERING') ? (
            <div className="p-4 rounded-xl bg-zinc-950 border border-blue-900/60 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-xs font-semibold text-white">
                    {activeJob.status === 'QUEUED' ? 'Queued in render worker...' : 'Rendering video frames...'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {activeJob.progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${activeJob.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-400 font-mono">
                  Preset: {activeJob.preset}
                </span>
                <button
                  onClick={handleCancelRender}
                  disabled={isCancelling}
                  className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/40 border border-red-900/60 rounded-md transition"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Export'}
                </button>
              </div>
            </div>
          ) : activeJob && activeJob.status === 'COMPLETED' ? (
            <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-900/60 flex flex-col gap-3">
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
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download MP4</span>
                  </a>
                )}
                <button
                  onClick={() => setActiveJob(null)}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition"
                >
                  New Export
                </button>
              </div>
            </div>
          ) : activeJob && activeJob.status === 'FAILED' ? (
            <div className="p-4 rounded-xl bg-zinc-950 border border-red-900/60 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <span className="text-xs font-semibold text-white">Render Failed</span>
              </div>
              <p className="text-[11px] text-zinc-400 break-words font-mono">
                {activeJob.errorMessage || 'An error occurred during rendering'}
              </p>
              <button
                onClick={() => setActiveJob(null)}
                className="mt-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition self-start"
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
                  className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between ${
                    preset === '1080p_h264'
                      ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <h3 className="text-xs font-semibold text-white">1080p Full HD</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">1920x1080 • H.264</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-2">5 Mbps High Quality</span>
                </div>

                <div
                  onClick={() => setPreset('720p_h264')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between ${
                    preset === '720p_h264'
                      ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <h3 className="text-xs font-semibold text-white">720p HD</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">1280x720 • H.264</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-2">2.5 Mbps Fast Export</span>
                </div>
              </div>

              {/* Specs overview */}
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Timeline Duration:</span>
                  <span className="font-mono text-zinc-200">{formatTimecode(duration, fps)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frame Rate:</span>
                  <span className="font-mono text-zinc-200">{fps} FPS</span>
                </div>
                <div className="flex justify-between">
                  <span>Audio Format:</span>
                  <span className="font-mono text-zinc-200">AAC Stereo 48kHz</span>
                </div>
              </div>

              <button
                onClick={handleStartRender}
                disabled={isStarting || duration <= 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20"
              >
                {isStarting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                <span>Start Export</span>
              </button>
            </div>
          )}

          {/* Past Exports History */}
          <div className="pt-2 border-t border-zinc-800">
            <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Recent Exports
            </h4>
            {loadingHistory ? (
              <div className="py-4 text-center text-xs text-zinc-500">Loading exports...</div>
            ) : renderHistory.length === 0 ? (
              <div className="py-4 text-center text-xs text-zinc-600">No previous exports yet.</div>
            ) : (
              <div className="space-y-2">
                {renderHistory.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {job.preset}
                      </span>
                      <span className="text-zinc-400 text-[11px]">
                        {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        <span className="text-[10px] text-zinc-500 uppercase">{job.status}</span>
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
