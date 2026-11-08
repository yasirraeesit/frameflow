'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Film, Plus, LogOut, ArrowRight, Video, Calendar, Loader2 } from 'lucide-react';
import { apiFetch, clearAuthToken } from '../../lib/api';
import { ProjectResponse } from '@frameflow/shared';

interface ProjectWithCount extends ProjectResponse {
  _count?: { assets: number };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fps, setFps] = useState(30);
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await apiFetch<{ projects: ProjectWithCount[] }>('/api/projects');
      setProjects(data.projects);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);

    try {
      const data = await apiFetch<{ project: ProjectResponse }>('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: description || undefined,
          fps,
          width: 1920,
          height: 1080,
        }),
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      router.push(`/projects/${data.project.id}`);
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="border-b border-border bg-surface/50 backdrop-blur sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-gray-100 text-base">FrameFlow</span>
            <span className="text-xs text-gray-400 block -mt-0.5">Projects Dashboard</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-gray-400 hover:text-white hover:bg-surface rounded-xl transition border border-border"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-100">Your Video Projects</h2>
          <p className="text-sm text-gray-400 mt-1">
            Create a timeline project, upload raw media, and let AI assemble scenes.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-16 border-2 border-dashed border-border rounded-2xl text-center bg-surface/30">
            <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-200">No projects yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Get started by creating your first editing project. Upload raw footage to begin.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="group p-6 bg-surface border border-border hover:border-blue-500/50 rounded-2xl transition flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-900 border border-gray-800 text-[11px] font-mono">
                      {proj.fps} fps
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-gray-100 group-hover:text-blue-400 transition">
                    {proj.title}
                  </h3>
                  {proj.description && (
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{proj.description}</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-gray-400">
                  <span>{proj._count?.assets ?? 0} Assets uploaded</span>
                  <span className="flex items-center text-blue-400 group-hover:translate-x-1 transition font-medium">
                    Open Project <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface p-6 rounded-2xl border border-border shadow-2xl">
            <h3 className="text-lg font-bold text-gray-100 mb-1">Create New Project</h3>
            <p className="text-xs text-gray-400 mb-4">Set timeline resolution and frame rate.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Project title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Travel Vlog Day 1"
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-border rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Rough cut timeline notes..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-border rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Frame Rate</label>
                <select
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-border rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={24}>24 fps (Cinematic)</option>
                  <option value={30}>30 fps (Standard)</option>
                  <option value={60}>60 fps (Smooth / High Frame Rate)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

