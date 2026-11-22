'use client';

import React, { useState } from 'react';
import { MOCK_BYOK_PROVIDERS, BYOKProvider } from '@/lib/mock-data';
import {
  Cpu,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  ShieldCheck,
  Check,
  Server,
  Sparkles,
  ExternalLink,
  Info,
  Layers,
  Save,
} from 'lucide-react';

export default function SettingsPage(): JSX.Element {
  const [providers, setProviders] = useState<BYOKProvider[]>(MOCK_BYOK_PROVIDERS);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, 'testing' | 'success' | 'error' | null>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKeyChange = (id: string, newKey: string) => {
    setProviders((prev) =>
      prev.map((prov) => (prov.id === id ? { ...prov, apiKey: newKey } : prov))
    );
  };

  const handleModelChange = (id: string, newModel: string) => {
    setProviders((prev) =>
      prev.map((prov) => (prov.id === id ? { ...prov, selectedModel: newModel } : prov))
    );
  };

  const handleTestConnection = (id: string) => {
    setTestingStatus((prev) => ({ ...prev, [id]: 'testing' }));

    setTimeout(() => {
      setTestingStatus((prev) => ({ ...prev, [id]: 'success' }));
      setProviders((prev) =>
        prev.map((prov) => (prov.id === id ? { ...prov, status: 'connected' } : prov))
      );
      setTimeout(() => {
        setTestingStatus((prev) => ({ ...prev, [id]: null }));
      }, 4000);
    }, 900);
  };

  const handleSaveAll = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const totalConnected = providers.filter((p) => p.status === 'connected').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#6366F1]" aria-hidden="true" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              BYOK AI Providers & Hardware Engine
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Bring Your Own Keys for 100% free transcription and viral reasoning. Keys are encrypted and stored locally in browser storage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.98]"
          >
            {savedSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                <span>Saved All Keys</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Overview Stat Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#27272A] bg-[#111114] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              Active Whisper Engine
            </span>
            <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400 font-semibold">
              42ms
            </span>
          </div>
          <div className="text-sm font-bold text-white truncate">Groq Whisper v3 Turbo</div>
          <div className="text-[11px] font-mono text-emerald-400">Free Tier (30 req/min)</div>
        </div>

        <div className="rounded-2xl border border-[#27272A] bg-[#111114] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Viral Reasoning LLM
            </span>
            <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.2 text-[10px] font-mono text-indigo-400 font-semibold">
              2M Context
            </span>
          </div>
          <div className="text-sm font-bold text-white truncate">Google Gemini 1.5 Flash</div>
          <div className="text-[11px] font-mono text-indigo-400">15 RPM / Free Tier</div>
        </div>

        <div className="rounded-2xl border border-[#27272A] bg-[#111114] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Local & Private
            </span>
            <span className="rounded bg-zinc-500/10 border border-zinc-500/20 px-1.5 py-0.2 text-[10px] font-mono text-zinc-400">
              Zero Latency
            </span>
          </div>
          <div className="text-sm font-bold text-white truncate">Ollama Local Runner</div>
          <div className="text-[11px] font-mono text-zinc-400">http://localhost:11434</div>
        </div>

        <div className="rounded-2xl border border-[#27272A] bg-[#111114] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              Monthly Cloud Cost
            </span>
            <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400 font-semibold">
              100% Free
            </span>
          </div>
          <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">$0.00 / month</div>
          <div className="text-[11px] text-[#71717A] tabular-nums font-mono">
            {totalConnected} / {providers.length} Providers Verified
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex items-start gap-3 text-xs text-indigo-200">
        <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">How Zero-Cost BYOK Works:</p>
          <p className="text-indigo-200/80 leading-relaxed">
            FrameFlow does not operate an expensive intermediary proxy markup. All requests to Whisper and LLM APIs execute directly using the free developer tier credentials you supply below. If you run out of quota on one provider, FrameFlow automatically cascades to the next connected backup provider.
          </p>
        </div>
      </div>

      {/* BYOK Providers Cards */}
      <div className="space-y-5">
        {providers.map((prov) => {
          const isKeyVisible = !!visibleKeys[prov.id];
          const testState = testingStatus[prov.id];

          return (
            <div
              key={prov.id}
              className="rounded-2xl border border-[#27272A] bg-[#111114] p-5 lg:p-6 transition-all hover:border-[#3F3F46] shadow-sm space-y-5"
            >
              {/* Provider Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#18181C] border border-[#27272A] flex items-center justify-center text-indigo-400 font-bold text-sm">
                    {prov.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white tracking-tight">{prov.name}</h2>
                      <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-indigo-300">
                        {prov.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#71717A] font-mono">{prov.category}</span>
                  </div>
                </div>

                {/* Connection Status Pill & Latency */}
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#18181C] border border-[#27272A] px-2 py-1 text-[11px] font-mono text-[#94A3B8] tabular-nums">
                    ⚡ {prov.latencyMs}ms latency
                  </span>
                  <span className="rounded-md bg-[#18181C] border border-[#27272A] px-2 py-1 text-[11px] font-mono text-emerald-400">
                    {prov.costNote}
                  </span>
                  {prov.status === 'connected' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400">
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Not Configured
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#94A3B8] leading-relaxed">{prov.description}</p>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* API Key Input (8 cols) */}
                <div className="md:col-span-7 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor={`api-key-${prov.id}`} className="font-medium text-[#94A3B8] flex items-center gap-1.5">
                      <Key className="h-3 w-3 text-indigo-400" />
                      {prov.id === 'byok-ollama' ? 'Host Server URL' : 'API Key'}
                    </label>
                    <span className="text-[10px] font-mono text-[#71717A]">Stored locally</span>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      id={`api-key-${prov.id}`}
                      type={isKeyVisible || prov.id === 'byok-ollama' ? 'text' : 'password'}
                      value={prov.apiKey}
                      onChange={(e) => handleKeyChange(prov.id, e.target.value)}
                      placeholder={prov.apiKeyPlaceholder}
                      className="w-full rounded-xl border border-[#27272A] bg-[#18181C] pl-3.5 pr-10 py-2.5 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#6366F1] transition-colors"
                    />
                    {prov.id !== 'byok-ollama' && (
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(prov.id)}
                        className="absolute right-3 text-[#71717A] hover:text-white transition-colors"
                        aria-label={isKeyVisible ? 'Hide API key' : 'Show API key'}
                      >
                        {isKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Model Selector (3 cols) */}
                <div className="md:col-span-3 space-y-1.5">
                  <label htmlFor={`model-select-${prov.id}`} className="text-xs font-medium text-[#94A3B8] block">
                    Default Model
                  </label>
                  <select
                    id={`model-select-${prov.id}`}
                    value={prov.selectedModel}
                    onChange={(e) => handleModelChange(prov.id, e.target.value)}
                    className="w-full rounded-xl border border-[#27272A] bg-[#18181C] px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#6366F1]"
                  >
                    {prov.models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Test Connection Button (2 cols) */}
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => handleTestConnection(prov.id)}
                    disabled={testState === 'testing'}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                      testState === 'testing'
                        ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                        : testState === 'success'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : 'border-[#27272A] bg-[#18181C] text-white hover:bg-[#222228] hover:border-[#3F3F46]'
                    }`}
                  >
                    {testState === 'testing' ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Pinging...</span>
                      </>
                    ) : testState === 'success' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <span>Test Ping</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
