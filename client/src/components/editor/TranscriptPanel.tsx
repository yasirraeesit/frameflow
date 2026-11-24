'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { WordTiming } from '@frameflow/shared';
import {
  FileText,
  Type,
  Layers,
  Scissors,
  Sparkles,
  Sliders,
  Check,
  Plus,
  Trash2,
  VolumeX,
  Clock,
  Eye,
  EyeOff,
  User,
  Users,
  Layout,
  Flame,
  Gamepad2,
  Crosshair,
  Mic,
  Square,
  Radio,
  RotateCcw,
  Volume2,
  ShieldCheck,
} from 'lucide-react';

export type EditorTab = 'transcript' | 'captions' | 'broll';
export type CaptionPreset = 'Hormozi Pop' | 'Karaoke Glow' | 'Clean Cinema' | 'Minimal Top' | 'Vice Neon';
export type LayoutMode = 'Solo Speaker' | '2-Speaker Split' | 'Screen + Facecam' | 'Gameplay + Cam' | 'Full Gameplay';

export interface BRollBlock {
  id: string;
  title: string;
  start: number;
  duration: number;
  inTimeline: boolean;
  thumbnailUrl: string;
}

interface TranscriptPanelProps {
  words: WordTiming[];
  cutWordIndices: Set<number>;
  onToggleWordCut: (index: number) => void;
  playheadTime: number;
  onSeekWord: (timeSec: number) => void;
  // Cleanup bar
  silencesRemoved: boolean;
  fillersRemoved: boolean;
  onToggleSilences: () => void;
  onToggleFillers: () => void;
  // Captions & Brand
  captionPreset: CaptionPreset;
  onSelectCaptionPreset: (preset: CaptionPreset) => void;
  highlightColor: string;
  onSelectColor: (color: string) => void;
  captionPosition: 'Bottom' | 'Center' | 'Top';
  onSelectPosition: (pos: 'Bottom' | 'Center' | 'Top') => void;
  // B-Roll & Layout
  layoutMode: LayoutMode;
  onSelectLayoutMode: (mode: LayoutMode) => void;
  bRollList: BRollBlock[];
  onToggleBRoll: (id: string) => void;
  // Monetization Voiceover Hook
  commentaryHookScript?: string;
  onSaveVoiceover?: (audioUrl: string, durationSec: number) => void;
  // Responsive / Mobile Container Props
  className?: string;
  activeTab?: EditorTab;
  onTabChange?: (tab: EditorTab) => void;
  hideTabBar?: boolean;
}

const COLOR_SWATCHES = [
  { name: 'Cinema Coral', hex: '#E84C2B' },
  { name: 'Vice Cyan', hex: '#00F0FF' },
  { name: 'Vice Magenta', hex: '#FF007F' },
  { name: 'Cinema Amber', hex: '#F59E0B' },
  { name: 'Crisp Emerald', hex: '#10B981' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

export function TranscriptPanel({
  words,
  cutWordIndices,
  onToggleWordCut,
  playheadTime,
  onSeekWord,
  silencesRemoved,
  fillersRemoved,
  onToggleSilences,
  onToggleFillers,
  captionPreset,
  onSelectCaptionPreset,
  highlightColor,
  onSelectColor,
  captionPosition,
  onSelectPosition,
  layoutMode,
  onSelectLayoutMode,
  bRollList,
  onToggleBRoll,
  commentaryHookScript,
  onSaveVoiceover,
  className,
  activeTab: controlledActiveTab,
  onTabChange,
  hideTabBar = false,
}: TranscriptPanelProps): JSX.Element {
  const [internalActiveTab, setInternalActiveTab] = useState<EditorTab>('transcript');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = (tab: EditorTab) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  // Voiceover Hook Recording State
  const [showRecorder, setShowRecorder] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [hasVoiceover, setHasVoiceover] = useState<boolean>(false);
  const [micDenied, setMicDenied] = useState<boolean>(false);
  const [teleprompterScript, setTeleprompterScript] = useState<string>(
    commentaryHookScript ||
      "You won't believe what happens at the 20-second mark of this chase—watch the minimap right here."
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (commentaryHookScript) {
      setTeleprompterScript(commentaryHookScript);
    }
  }, [commentaryHookScript]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 6) {
            stopRecording();
            return 6;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const startRecording = async () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setMicDenied(false);
    try {
      if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setHasVoiceover(true);
          onSaveVoiceover?.(url, recordingSeconds || 5.0);
          stream.getTracks().forEach((track) => track.stop());
        };
        mediaRecorder.start();
      } else {
        setMicDenied(true);
      }
    } catch {
      setMicDenied(true);
      console.warn('Microphone permission check bypassed, using synthetic voiceover track.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setHasVoiceover(true);
      onSaveVoiceover?.('https://assets.frameflow.dev/samples/creator-hook-master.mp3', 5.0);
    }
  };

  // Group words into conversational phrases of ~6-8 words for comfortable reading
  const phraseChunks: { startIndex: number; words: { word: WordTiming; globalIndex: number }[] }[] = [];
  let currentPhrase: { word: WordTiming; globalIndex: number }[] = [];
  let currentStart = 0;

  words.forEach((w, idx) => {
    if (currentPhrase.length === 0) currentStart = idx;
    currentPhrase.push({ word: w, globalIndex: idx });
    if (currentPhrase.length >= 7 || w.word.endsWith('.') || w.word.endsWith('?') || w.word.endsWith('!')) {
      phraseChunks.push({ startIndex: currentStart, words: [...currentPhrase] });
      currentPhrase = [];
    }
  });
  if (currentPhrase.length > 0) {
    phraseChunks.push({ startIndex: currentStart, words: [...currentPhrase] });
  }

  return (
    <div className={className || "w-[330px] bg-white border-r border-[#E6E4DD] flex flex-col h-full select-none shrink-0 z-10 text-[#14151A]"}>
      {/* 3-Tab Studio Rail Header */}
      {!hideTabBar && (
        <div className="grid grid-cols-3 border-b border-[#E6E4DD] bg-[#FAF9F5] p-1.5 gap-1 shrink-0">
          {[
            { id: 'transcript', label: 'Transcript', icon: FileText },
            { id: 'captions', label: 'Captions', icon: Type },
            { id: 'broll', label: 'B-Roll & Layout', icon: Layers },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as EditorTab)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#14151A] shadow-2xs border border-[#E6E4DD]'
                    : 'text-[#52545E] hover:text-[#14151A]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-[#E84C2B]' : 'text-[#8C8E9A]'}`} />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab 1: Transcript */}
      {activeTab === 'transcript' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Quick 1-Click Cleanup Bar */}
          <div className="p-3 border-b border-[#E6E4DD] bg-[#FAF9F5]/60 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#52545E]">
              <span className="flex items-center gap-1 font-semibold text-[#14151A]">
                <Scissors className="h-3 w-3 text-[#E84C2B]" />
                1-Click Cut Filters
              </span>
              <span>{cutWordIndices.size > 0 ? `${cutWordIndices.size} cuts active` : 'No cuts'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onToggleSilences}
                className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  silencesRemoved
                    ? 'border-[#E84C2B] bg-[#FAF3EE] text-[#E84C2B]'
                    : 'border-[#E6E4DD] bg-white text-[#52545E] hover:border-[#14151A]'
                }`}
              >
                <VolumeX className="h-3 w-3" />
                <span>{silencesRemoved ? 'Silences Cut (-1.4s)' : 'Cut Silences (3)'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleFillers}
                className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  fillersRemoved
                    ? 'border-[#E84C2B] bg-[#FAF3EE] text-[#E84C2B]'
                    : 'border-[#E6E4DD] bg-white text-[#52545E] hover:border-[#14151A]'
                }`}
              >
                <Flame className="h-3 w-3" />
                <span>{fillersRemoved ? 'Fillers Cut (-2.0s)' : 'Cut Fillers ("um")'}</span>
              </button>
            </div>
          </div>

          {/* Monetization-Safe Voiceover Hook Teleprompter Card */}
          <div className="p-3 border-b border-[#E6E4DD] bg-[#FAF9F5] space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#14151A]">
                <ShieldCheck className="h-4 w-4 text-[#E84C2B]" />
                <span>Monetization Voiceover Hook</span>
              </div>
              <span className="text-[10px] font-mono text-[#E84C2B] bg-[#FAF3EE] px-1.5 py-0.2 rounded border border-[#E84C2B]/30 font-bold">
                5S HOOK
              </span>
            </div>

            {!showRecorder ? (
              <button
                type="button"
                onClick={() => setShowRecorder(true)}
                className="w-full py-2 px-3 rounded-xl border border-[#E84C2B]/40 bg-white hover:bg-[#FAF3EE] text-[#E84C2B] text-xs font-bold flex items-center justify-between transition-all shadow-2xs cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Mic className="h-3.5 w-3.5 text-[#E84C2B] group-hover:scale-110 transition-transform" />
                  <span>{hasVoiceover ? 'Voiceover Recorded (Track A2)' : 'Record 5s Voiceover Hook'}</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#E84C2B]/10 px-1.5 py-0.5 rounded text-[#E84C2B]">
                  {hasVoiceover ? 'ACTIVE' : 'TRANSFORMATIVE'}
                </span>
              </button>
            ) : (
              <div className="p-2.5 rounded-xl border border-[#E84C2B]/50 bg-white space-y-2 shadow-2xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#52545E]">AI Teleprompter Script:</span>
                  <button
                    type="button"
                    onClick={() => setShowRecorder(false)}
                    className="text-[#8C8E9A] hover:text-[#14151A] text-[10px]"
                  >
                    Collapse &times;
                  </button>
                </div>

                <textarea
                  value={teleprompterScript}
                  onChange={(e) => setTeleprompterScript(e.target.value)}
                  rows={2}
                  className="w-full text-xs text-[#14151A] font-medium p-2 rounded-lg border border-[#E6E4DD] bg-[#FAF9F5] focus:outline-none focus:border-[#E84C2B] resize-none leading-relaxed"
                />

                {micDenied && (
                  <div className="rounded-lg border border-amber-300 bg-[#FFFBEB] p-2.5 text-[11px] text-amber-900 flex items-start justify-between gap-2">
                    <span>Microphone access was denied or unavailable. Synthetic audio preview will be used.</span>
                    <button
                      type="button"
                      onClick={() => setMicDenied(false)}
                      className="text-amber-700 hover:text-amber-950 font-bold shrink-0 text-xs cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    {isRecording ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                        <span className="text-red-600 font-bold">00:0{recordingSeconds} / 00:05</span>
                      </>
                    ) : hasVoiceover ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Track A2 Master Ready
                      </span>
                    ) : (
                      <span className="text-[#8C8E9A]">Target: ~5 sec spoken hook</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                        : 'bg-[#E84C2B] hover:bg-[#D13B1C] text-white'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="h-3 w-3 fill-current" />
                        <span>Stop & Insert</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-3 w-3" />
                        <span>{hasVoiceover ? 'Re-Record Hook' : 'Record Mic'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Word-by-Word Interactive Transcript Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 divide-y divide-[#F0EFEA] text-xs">
            {phraseChunks.map((chunk, cIdx) => {
              const phraseStartTime = chunk.words[0].word.start;
              const formatTime = (sec: number) => {
                const m = Math.floor(sec / 60);
                const s = Math.floor(sec % 60);
                return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
              };

              return (
                <div key={cIdx} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8E9A]">
                    <span className="font-semibold">{formatTime(phraseStartTime)}</span>
                    <button
                      type="button"
                      onClick={() => onSeekWord(phraseStartTime)}
                      className="hover:text-[#E84C2B] transition-colors cursor-pointer"
                    >
                      Seek &rarr;
                    </button>
                  </div>

                  <div className="leading-relaxed flex flex-wrap gap-1">
                    {chunk.words.map(({ word, globalIndex }) => {
                      const isCut = cutWordIndices.has(globalIndex);
                      const isCurrentlySpoken =
                        !isCut && playheadTime >= word.start && playheadTime <= word.end;

                      return (
                        <span
                          key={globalIndex}
                          className={`group relative inline-flex items-center px-1 py-0.5 rounded cursor-pointer transition-all ${
                            isCut
                              ? 'line-through text-red-500 bg-red-50/70 border border-red-200/60'
                              : isCurrentlySpoken
                              ? 'bg-[#E84C2B] text-white font-bold shadow-2xs'
                              : 'text-[#14151A] hover:bg-[#FAF3EE] hover:text-[#E84C2B]'
                          }`}
                          onClick={() => {
                            if (!isCut) {
                              onSeekWord(word.start);
                            }
                          }}
                        >
                          <span>{word.word}</span>

                          {/* Quick Cut Toggle On Hover */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWordCut(globalIndex);
                            }}
                            title={isCut ? 'Restore word' : 'Cut word from short'}
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#8C8E9A] hover:text-red-600"
                          >
                            <Scissors className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Captions & Brand */}
      {activeTab === 'captions' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Caption Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#14151A] block">
              Signature Subtitle Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Hormozi Pop', desc: 'Chunky yellow + pop animation' },
                { id: 'Vice Neon', desc: 'Cyan & hot magenta Vice City glow' },
                { id: 'Karaoke Glow', desc: 'Word highlight + smooth fill' },
                { id: 'Clean Cinema', desc: 'Serif font with soft drop-shadow' },
                { id: 'Minimal Top', desc: 'Sans-serif positioned at top' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectCaptionPreset(preset.id as CaptionPreset)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    captionPreset === preset.id
                      ? 'border-[#E84C2B] bg-[#FAF3EE] shadow-2xs'
                      : 'border-[#E6E4DD] bg-white hover:border-[#14151A]'
                  }`}
                >
                  <div className="font-bold text-[#14151A] text-[11px]">{preset.id}</div>
                  <div className="text-[10px] text-[#52545E] mt-0.5 leading-tight">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Highlight Color Swatches */}
          <div className="space-y-2 pt-2 border-t border-[#F0EFEA]">
            <label className="text-xs font-bold text-[#14151A] block">
              Active Highlight Color
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => onSelectColor(swatch.hex)}
                  title={swatch.name}
                  className={`h-7 w-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    highlightColor === swatch.hex
                      ? 'border-[#14151A] scale-110 shadow-sm'
                      : 'border-[#E6E4DD] hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                >
                  {highlightColor === swatch.hex && (
                    <Check className={`h-3 w-3 ${swatch.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Caption Position Selector */}
          <div className="space-y-2 pt-2 border-t border-[#F0EFEA]">
            <label className="text-xs font-bold text-[#14151A] block">
              Vertical Screen Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Bottom', 'Center', 'Top'] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => onSelectPosition(pos)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    captionPosition === pos
                      ? 'border-[#E84C2B] bg-[#FAF3EE] text-[#E84C2B]'
                      : 'border-[#E6E4DD] bg-white text-[#52545E]'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Typography Preview Pill */}
          <div className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] p-3 space-y-1">
            <span className="text-[10px] font-mono text-[#8C8E9A] uppercase block">
              Current Caption Font
            </span>
            <div className="font-black text-sm text-[#14151A] tracking-wide">
              THE HARD TRUTH ABOUT PRICING
            </div>
            <div className="text-[10px] text-[#52545E]">
              Montserrat Black &bull; Uppercase &bull; 48px
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: B-Roll & Layout */}
      {activeTab === 'broll' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Layout Mode Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#14151A] block">
              Auto Speaker Layout
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'Gameplay + Cam', icon: Gamepad2, desc: '16:9 HUD-safe top/bottom split + facecam' },
                { id: 'Full Gameplay', icon: Crosshair, desc: '9:16 Centered dynamic action immersion' },
                { id: 'Solo Speaker', icon: User, desc: '9:16 Active speaker face tracking' },
                { id: '2-Speaker Split', icon: Users, desc: '50/50 Top & Bottom conversational split' },
                { id: 'Screen + Facecam', icon: Layout, desc: 'Picture-in-picture desktop layout' },
              ].map((l) => {
                const Icon = l.icon;
                const isSelected = layoutMode === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onSelectLayoutMode(l.id as LayoutMode)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#E84C2B] bg-[#FAF3EE] shadow-2xs'
                        : 'border-[#E6E4DD] bg-white hover:border-[#14151A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-[#E84C2B]' : 'text-[#8C8E9A]'}`} />
                      <div>
                        <div className="font-bold text-[#14151A] text-xs">{l.id}</div>
                        <div className="text-[10px] text-[#52545E]">{l.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#E84C2B]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI B-Roll Overlays */}
          <div className="space-y-2.5 pt-2 border-t border-[#F0EFEA]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#14151A] block">
                Auto-Detected B-Roll Assets
              </label>
              <span className="text-[10px] font-mono font-bold bg-[#FAF3EE] text-[#E84C2B] px-1.5 py-0.2 rounded border border-[#E84C2B]/30">
                PRO
              </span>
            </div>

            <div className="space-y-2">
              {bRollList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] p-2.5 flex items-center justify-between gap-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="h-10 w-12 rounded-lg bg-cover bg-center shrink-0 border border-[#E6E4DD]"
                      style={{ backgroundImage: `url(${item.thumbnailUrl})` }}
                    />
                    <div className="truncate">
                      <div className="font-bold text-xs text-[#14151A] truncate">{item.title}</div>
                      <div className="text-[10px] font-mono text-[#52545E]">
                        {item.duration}s &bull; Start: {item.start.toFixed(1)}s
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleBRoll(item.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      item.inTimeline
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-white border border-[#E6E4DD] text-[#14151A] hover:border-[#14151A]'
                    }`}
                  >
                    {item.inTimeline ? 'On Track V2' : '+ Insert'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
