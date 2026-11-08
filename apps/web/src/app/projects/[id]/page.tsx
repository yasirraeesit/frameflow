'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Film, Play, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { apiFetch } from '../../../lib/api';
import { ProjectResponse } from '@frameflow/shared';
import { ChunkedUploader } from '../../../components/media/ChunkedUploader';
import { AssetList } from '../../../components/media/AssetList';
import { useProjectWebSocket } from '../../../hooks/useProjectWebSocket';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { isConnected } = useProjectWebSocket(projectId);

  const fetchProject = async () => {
    try {
      const data = await apiFetch<{ project: ProjectResponse }>(`/api/projects/${projectId}`);
      setProject(data.project);
    } catch {
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading project workspace...</span>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Workspace Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/projects"
            className="p-2 text-gray-400 hover:text-white hover:bg-surface rounded-xl border border-border transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-gray-100">{project.title}</h1>
              <span className="px-2 py-0.5 rounded-full bg-gray-900 border border-gray-800 text-[10px] font-mono text-gray-400">
                {project.fps} fps
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {project.width}x{project.height} • Project ID: {project.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-xs">
            {isConnected ? (
              <span className="flex items-center text-emerald-400 font-medium">
                <Wifi className="w-3.5 h-3.5 mr-1" />
                Live Sync Connected
              </span>
            ) : (
              <span className="flex items-center text-gray-500">
                <WifiOff className="w-3.5 h-3.5 mr-1" />
                Connecting...
              </span>
            )}
          </div>

          <button
            onClick={() => alert('Phase 2 Timeline Editor will load with this project.')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Open Timeline Editor</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {/* Upload Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-100">Upload Raw Footage</h2>
              <p className="text-xs text-gray-400">
                Files are streamed directly to MinIO S3 in 5MB chunks and processed by BullMQ workers.
              </p>
            </div>
          </div>

          <ChunkedUploader
            projectId={projectId}
            onUploadComplete={() => setRefreshTrigger((prev) => prev + 1)}
          />
        </section>

        {/* Assets Bin Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-100">Project Media Bin</h2>
          </div>

          <AssetList projectId={projectId} refreshTrigger={refreshTrigger} />
        </section>
      </main>
    </div>
  );
}

