'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { ProjectResponse, AssetResponse, TimelineDocument } from '@frameflow/shared';
import { useTimelineStore } from '../../../store/timeline.store';
import { useProjectWebSocket } from '../../../hooks/useProjectWebSocket';
import { MediaBin } from '../../../components/media/MediaBin';
import { PreviewPlayer } from '../../../components/preview/PreviewPlayer';
import { TimelineEditor } from '../../../components/timeline/TimelineEditor';
import { VersionHistoryModal } from '../../../components/timeline/VersionHistoryModal';
import { ArrowLeft, Loader2, Save, CheckCircle2, History } from 'lucide-react';

export default function EditorStudioPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const timeline = useTimelineStore((s) => s.timeline);
  const isDirty = useTimelineStore((s) => s.isDirty);
  const isSaving = useTimelineStore((s) => s.isSaving);
  const setTimeline = useTimelineStore((s) => s.setTimeline);
  const setIsSaving = useTimelineStore((s) => s.setIsSaving);
  const markSaved = useTimelineStore((s) => s.markSaved);

  const { lastEvent } = useProjectWebSocket(projectId);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load project details, timeline document, and assets
  const loadStudioData = useCallback(async () => {
    try {
      setLoading(true);
      const [projData, timelineData, assetsData] = await Promise.all([
        apiFetch<{ project: ProjectResponse }>(`/api/projects/${projectId}`),
        apiFetch<{ timeline: { data: TimelineDocument; version: number } }>(
          `/api/projects/${projectId}/timeline`
        ),
        apiFetch<{ assets: AssetResponse[] }>(`/api/projects/${projectId}/assets`),
      ]);

      setProject(projData.project);
      setAssets(assetsData.assets);
      setTimeline(timelineData.timeline.data);
    } catch (err) {
      console.error('Failed to load studio data:', err);
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  }, [projectId, router, setTimeline]);

  useEffect(() => {
    void loadStudioData();
  }, [loadStudioData]);

  // Re-fetch assets when background processing completes
  useEffect(() => {
    if (lastEvent?.status === 'DONE' || lastEvent?.status === 'FAILED') {
      void apiFetch<{ assets: AssetResponse[] }>(`/api/projects/${projectId}/assets`).then(
        (data) => setAssets(data.assets)
      );
    }
  }, [lastEvent, projectId]);

  // Save timeline to API
  const handleSaveTimeline = useCallback(async () => {
    const currentTimeline = useTimelineStore.getState().timeline;
    if (!currentTimeline) return;

    try {
      setIsSaving(true);
      const res = await apiFetch<{ timeline: { data: TimelineDocument; version: number } }>(
        `/api/projects/${projectId}/timeline`,
        {
          method: 'PUT',
          body: JSON.stringify({ data: currentTimeline }),
        }
      );
      markSaved(res.timeline.version);
    } catch (err) {
      console.error('Autosave failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [projectId, setIsSaving, markSaved]);

  // Debounced Autosave (2 seconds after changes)
  useEffect(() => {
    if (!isDirty || !timeline) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      void handleSaveTimeline();
    }, 2000);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [timeline, isDirty, handleSaveTimeline]);

  // Build proxy URL lookup map for preview player
  const assetProxyMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of assets) {
      if (a.proxyKey) {
        map[a.id] = `http://localhost:9000/proxies/${a.proxyKey}`;
      }
    }
    return map;
  }, [assets]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-sm">Loading FrameFlow Studio...</span>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden select-none">
      {/* Studio Header Bar */}
      <header className="h-12 border-b border-zinc-800 bg-zinc-900/90 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition border border-zinc-800"
            title="Back to Project Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-100">{project.title}</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 font-mono px-2 py-0.5 rounded-full border border-zinc-700/60">
              {project.width}x{project.height} • {project.fps}fps
            </span>
          </div>
        </div>

        {/* Right Header Status & Actions */}
        <div className="flex items-center gap-4">
          {/* Autosave Status Badge */}
          <div className="flex items-center gap-1.5 text-xs">
            {isSaving ? (
              <span className="flex items-center text-zinc-400 gap-1 font-mono text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Autosaving...</span>
              </span>
            ) : isDirty ? (
              <span className="flex items-center text-amber-400 gap-1 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Unsaved changes</span>
              </span>
            ) : (
              <span className="flex items-center text-emerald-400 gap-1 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
          </div>

          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700/80 transition"
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span>Version History</span>
          </button>
        </div>
      </header>

      {/* Studio Middle Workspace: Media Bin (Left) + Preview Player (Right) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Media Bin */}
        <div className="w-80 flex-shrink-0 flex flex-col h-full">
          <MediaBin
            projectId={projectId}
            assets={assets}
            onUploadComplete={() => {
              void apiFetch<{ assets: AssetResponse[] }>(
                `/api/projects/${projectId}/assets`
              ).then((data) => setAssets(data.assets));
            }}
          />
        </div>

        {/* Right Column: Preview Player & Monitor */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-zinc-900/30 overflow-hidden">
          <div className="w-full max-w-3xl">
            <PreviewPlayer assetProxyMap={assetProxyMap} />
          </div>
        </div>
      </div>

      {/* Studio Bottom Workspace: Multi-Track Timeline Editor */}
      <div className="h-72 flex-shrink-0 flex flex-col">
        <TimelineEditor
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          onSave={handleSaveTimeline}
        />
      </div>

      {/* Version History Modal */}
      <VersionHistoryModal
        projectId={projectId}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
}
