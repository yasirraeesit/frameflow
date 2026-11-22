'use client';

import React, { useState } from 'react';
import { MOCK_AI_PROVIDERS, AIProviderConfig } from '@/lib/mock-data';
import {
  Cpu,
  CheckCircle2,
  Key,
  Zap,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function AIProvidersPage(): JSX.Element {
  const [providers, setProviders] = useState<AIProviderConfig[]>(MOCK_AI_PROVIDERS);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" aria-hidden="true" />
            <h1 className="text-xl font-bold tracking-tight text-white">AI Inference & Pipeline Providers</h1>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Configure transcription, multimodal hook discovery, voice dubbing, and neural speaker-tracking models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#27272A] bg-[#111114] px-3 py-1.5 text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-[#18181C] transition-colors"
          >
            <Activity className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span>All Engines Healthy</span>
          </button>
        </div>
      </div>

      {/* Grid of Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {providers.map((p) => {
          const isTesting = testingId === p.id;

          return (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-xl border border-[#27272A] bg-[#111114] p-5 hover:border-[#3F3F46] transition-all space-y-4"
            >
              <div className="space-y-3">
                {/* Top Badge & Status */}
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#18181C] border border-[#27272A] px-2.5 py-0.5 text-[10px] font-mono font-medium text-[#A1A1AA]">
                    {p.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                </div>

                {/* Name & Model */}
                <div>
                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                  <p className="text-xs font-mono text-indigo-400 mt-0.5">{p.model}</p>
                </div>

                <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              {/* Specs & Performance */}
              <div className="space-y-3 pt-3 border-t border-[#27272A]">
                <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[#71717A]">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-400" aria-hidden="true" />
                    Latency: <strong className="text-zinc-200">{p.latencyMs}ms</strong>
                  </span>
                  {p.costPerMin && (
                    <span className="text-[11px] text-zinc-400">{p.costPerMin}</span>
                  )}
                </div>

                {/* Masked Key */}
                {p.apiKeyMasked && (
                  <div className="flex items-center justify-between rounded-lg bg-[#18181C] border border-[#27272A] px-3 py-1.5 text-xs font-mono text-[#A1A1AA]">
                    <div className="flex items-center gap-2">
                      <Key className="h-3 w-3 text-[#71717A]" aria-hidden="true" />
                      <span>{p.apiKeyMasked}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestConnection(p.id)}
                      disabled={isTesting}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      {isTesting ? 'Pinging...' : 'Test'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
