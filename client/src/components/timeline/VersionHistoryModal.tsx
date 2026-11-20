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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg bg-studio-surface border border-studio-border rounded-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-3.5 px-4 border-b border-studio-border flex items-center justify-between bg-studio-surface">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Timeline Version History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-studio-surface-sub transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create Snapshot Form */}
        <form onSubmit={handleCreateSnapshot} className="p-4 border-b border-studio-border bg-studio-panel">
          <label className="block text-xs font-medium text-studio-text-muted mb-1.5">
            Create Named Milestone Snapshot
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Director's Cut v1, Before Color Grade..."
              value={snapshotDesc}
              onChange={(e) => setSnapshotDesc(e.target.value)}
              className="flex-1 bg-studio-bg border border-studio-border rounded px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isCreating || !snapshotDesc.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Snapshot</span>
            </button>
          </div>
          {statusMessage && (
            <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </p>
          )}
        </form>

        {/* Snapshot Version List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-studio-bg">
          {loading ? (
            <div className="py-8 flex items-center justify-center text-zinc-500 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>Loading versions...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No version snapshots recorded yet.
            </div>
          ) : (
            versions.map((v) => (
              <div
                key={v.id}
                className="p-3 bg-studio-surface border border-studio-border rounded flex items-center justify-between hover:border-studio-border-sub transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400">
                      v{v.version}
                    </span>
                    <span className="text-xs font-medium text-white">{v.description}</span>
                  </div>
                  <div className="text-[10px] text-studio-text-dim mt-1 font-mono">
                    {new Date(v.createdAt).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleRestore(v.version)}
                  disabled={restoringVersion !== null}
                  className="px-2.5 py-1 text-xs bg-studio-surface-sub hover:bg-studio-border text-zinc-200 border border-studio-border rounded flex items-center gap-1 transition disabled:opacity-50"
                  title="Restore this version"
                >
                  {restoringVersion === v.version ? (
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
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
