'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { useTimelineStore } from '../../store/timeline.store';
import { TimelineDocument } from '@frameflow/shared';
import { History, RotateCcw, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';

interface TimelineVersionRecord {
  id: string;
  timelineId: string;
  version: number;
  description: string;
  createdAt: string;
  createdBy: string;
}

interface VersionHistoryModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VersionHistoryModal({ projectId, isOpen, onClose }: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<TimelineVersionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [snapshotDesc, setSnapshotDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const setTimeline = useTimelineStore((s) => s.setTimeline);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ versions: TimelineVersionRecord[] }>(
        `/api/projects/${projectId}/timeline/versions`
      );
      setVersions(res.versions);
    } catch (err) {
      console.error('Failed to load version history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchVersions();
      setStatusMessage(null);
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotDesc.trim() || isCreating) return;

    try {
      setIsCreating(true);
      await apiFetch<{ version: TimelineVersionRecord }>(
        `/api/projects/${projectId}/timeline/versions`,
        {
          method: 'POST',
          body: JSON.stringify({ description: snapshotDesc.trim() }),
        }
      );
      setSnapshotDesc('');
      setStatusMessage('Snapshot created successfully!');
      await fetchVersions();
    } catch (err) {
      console.error('Failed to create snapshot:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async (versionNumber: number) => {
    if (restoringVersion !== null) return;

    try {
      setRestoringVersion(versionNumber);
      const res = await apiFetch<{ timeline: { data: TimelineDocument; version: number } }>(
        `/api/projects/${projectId}/timeline/versions/${versionNumber}/restore`,
        { method: 'POST' }
      );

      // Restore timeline document in store
      setTimeline(res.timeline.data);
      setStatusMessage(`Restored timeline to version ${versionNumber}!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to restore version:', err);
      setStatusMessage('Failed to restore version');
    } finally {
      setRestoringVersion(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Timeline Version History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create Named Snapshot Form */}
        <form
          onSubmit={handleCreateSnapshot}
          className="p-4 border-b border-zinc-800 bg-zinc-950/20 flex gap-2"
        >
          <input
            type="text"
            placeholder="Snapshot name (e.g. Rough Cut, Scene 2 edit)..."
            value={snapshotDesc}
            onChange={(e) => setSnapshotDesc(e.target.value)}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!snapshotDesc.trim() || isCreating}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition"
          >
            {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Snapshot</span>
          </button>
        </form>

        {/* Status banner */}
        {statusMessage && (
          <div className="px-4 py-2 bg-blue-950/50 border-b border-blue-900/60 text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Version List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-8 flex items-center justify-center text-zinc-500 gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading snapshots...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No version snapshots recorded yet.
            </div>
          ) : (
            versions.map((ver) => (
              <div
                key={ver.id}
                className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg flex items-center justify-between hover:border-zinc-700 transition"
              >
                <div className="flex flex-col gap-0.5 overflow-hidden pr-3">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-zinc-800 text-blue-400 font-mono text-[10px] rounded font-semibold">
                      v{ver.version}
                    </span>
                    <span className="text-xs font-medium text-zinc-200 truncate">
                      {ver.description}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(ver.createdAt).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => void handleRestore(ver.version)}
                  disabled={restoringVersion !== null}
                  className="px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md border border-zinc-700/80 transition flex items-center gap-1.5 flex-shrink-0"
                >
                  {restoringVersion === ver.version ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3 text-zinc-400" />
                  )}
                  <span>Restore</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

