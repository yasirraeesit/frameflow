'use client';

import React from 'react';
import type { WordTiming } from '@frameflow/shared';
import type { AspectRatioOption } from './StudioHeader';
import type { CaptionPreset, BRollBlock, LayoutMode } from './TranscriptPanel';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize2,
  ShieldAlert,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  Disc,
  Radio,
  Sliders,
  Gamepad2,
  Flame,
} from 'lucide-react';

interface VideoMonitorProps {
  aspectRatio: AspectRatioOption;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playheadTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  words: WordTiming[];
  cutWordIndices: Set<number>;
  captionPreset: CaptionPreset;
  highlightColor: string;
  captionPosition: 'Bottom' | 'Center' | 'Top';
  showSafeZones: boolean;
  onToggleSafeZones: () => void;
  bRollList: BRollBlock[];
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  layoutMode?: LayoutMode;
}

export function VideoMonitor({
  aspectRatio,
  isPlaying,
  onTogglePlay,
  playheadTime,
  totalDuration,
  onSeek,
  words,
  cutWordIndices,
  captionPreset,
  highlightColor,
  captionPosition,
  showSafeZones,
  onToggleSafeZones,
  bRollList,
  playbackSpeed,
  onChangeSpeed,
  layoutMode = 'Solo Speaker',
}: VideoMonitorProps): JSX.Element {
  // Format MM:SS:FF
  const formatTimecode = (sec: number) => {
    const totalSec = Math.max(0, sec);
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    const ms = Math.floor((totalSec % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  // Find active words around playhead (e.g. 3-4 word phrase window)
  const activeWordIndex = words.findIndex(
    (w, idx) => !cutWordIndices.has(idx) && playheadTime >= w.start && playheadTime <= w.end
  );

  let currentPhrase: { word: WordTiming; isCurrent: boolean }[] = [];
  if (activeWordIndex !== -1) {
    const start = Math.max(0, activeWordIndex - 1);
    const end = Math.min(words.length, activeWordIndex + 3);
    currentPhrase = words.slice(start, end).map((w, idx) => ({
      word: w,
      isCurrent: start + idx === activeWordIndex,
    }));
  } else if (words.length > 0) {
    // Default fallback to first phrase
    currentPhrase = words.slice(0, 3).map((w, idx) => ({
      word: w,
      isCurrent: idx === 0,
    }));
  }

  // Active B-Roll Check
  const activeBRoll = bRollList.find(
    (b) => b.inTimeline && playheadTime >= b.start && playheadTime <= b.start + b.duration
  );

  // Monitor frame dimensions based on aspect ratio
  const getFrameDimensions = () => {
    if (aspectRatio === '9:16') {
      return 'w-[290px] sm:w-[320px] h-[515px] sm:h-[568px]';
    }
    if (aspectRatio === '1:1') {
      return 'w-[380px] sm:w-[440px] h-[380px] sm:h-[440px]';
    }
    return 'w-[520px] sm:w-[620px] h-[292px] sm:h-[348px]';
  };

  // Vertical position style for captions
  const getCaptionPositionStyle = () => {
    if (captionPosition === 'Top') return 'top-14';
    if (captionPosition === 'Center') return 'top-1/2 -translate-y-1/2';
    return 'bottom-20 sm:bottom-24';
  };

  return (
    <div className="flex-1 bg-[#FAF9F5] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background subtle graph pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'radial-gradient(#14151A 1px, transparent 1px), radial-gradient(#14151A 1px, #FAF9F5 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
        aria-hidden="true"
      />

      {/* Floating Canvas Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSafeZones}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs border cursor-pointer ${
            showSafeZones
              ? 'bg-[#14151A] text-white border-[#14151A]'
              : 'bg-white text-[#52545E] border-[#E6E4DD] hover:border-[#14151A]'
          }`}
        >
          <ShieldAlert className={`h-3.5 w-3.5 ${showSafeZones ? 'text-[#E84C2B]' : 'text-[#8C8E9A]'}`} />
          <span>TikTok / Reels Safe-Zone</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. DARK CINEMA VIDEO MONITOR (#121318)                    */}
      {/* ========================================================= */}
      <div
        className={`relative ${getFrameDimensions()} rounded-3xl bg-[#121318] border border-[#2A2C38] shadow-[0_20px_60px_rgba(20,21,26,0.3)] overflow-hidden flex flex-col justify-between transition-all duration-300`}
      >
        {/* Synthetic Video Canvas Scene */}
        <div className="absolute inset-0 z-0">
          {layoutMode === 'Gameplay + Cam' ? (
            /* Gameplay + Facecam Split Stage */
            <div className="w-full h-full flex flex-col">
              {/* Top 62%: 16:9 Uncropped Gameplay Frame with HUD */}
              <div className="relative w-full h-[62%] bg-black overflow-hidden border-b-2 border-[#E84C2B]/30">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      'url(https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80)',
                    filter: activeBRoll ? 'brightness(0.3) blur(2px)' : 'brightness(0.9)',
                  }}
                />

                {/* GTA 6 HUD: 5-Star Wanted Level Indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#121318]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/40 shadow-lg">
                  <div className="flex gap-0.5 text-amber-400 text-xs font-mono font-black drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]">
                    <span>&#9733;</span>
                    <span>&#9733;</span>
                    <span>&#9733;</span>
                    <span>&#9733;</span>
                    <span className="text-amber-300 animate-pulse">&#9733;</span>
                  </div>
                  <span className="text-[9px] font-mono text-red-500 font-bold ml-1 animate-pulse">
                    POLICE
                  </span>
                </div>

                {/* GTA 6 Minimap Radar Simulation */}
                <div className="absolute bottom-3 left-3 h-14 w-14 rounded-full border-2 border-emerald-400/60 bg-[#121318]/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  <div className="absolute h-1 w-1 rounded-full bg-white" />
                  <span className="absolute -bottom-1 text-[7px] font-mono text-emerald-400 font-bold">
                    VICE CANAL
                  </span>
                </div>

                {/* HUD Health & Armor Bars */}
                <div className="absolute bottom-3 left-20 space-y-0.5">
                  <div className="h-1.5 w-16 bg-[#121318] rounded-full overflow-hidden border border-white/20">
                    <div className="h-full w-4/5 bg-emerald-500 rounded-full" />
                  </div>
                  <div className="h-1.5 w-16 bg-[#121318] rounded-full overflow-hidden border border-white/20">
                    <div className="h-full w-2/3 bg-cyan-400 rounded-full" />
                  </div>
                </div>

                {/* HUD 16:9 Marker */}
                <div className="absolute top-3 left-3 bg-[#121318]/80 px-2 py-0.5 rounded text-[8px] font-mono text-[#00F0FF] border border-[#00F0FF]/30">
                  16:9 GAMEPLAY HUD
                </div>
              </div>

              {/* Bottom 38%: Streamer Facecam Box */}
              <div className="relative w-full h-[38%] bg-[#0E0F14] overflow-hidden flex items-center justify-center p-2">
                <div
                  className="w-full h-full rounded-2xl bg-cover bg-center border border-emerald-400/40 relative shadow-inner"
                  style={{
                    backgroundImage:
                      'url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80)',
                    filter: activeBRoll ? 'brightness(0.3) blur(2px)' : 'brightness(0.85)',
                  }}
                >
                  {/* Facecam active reticle */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#121318]/80 px-2 py-0.5 rounded-full border border-emerald-400/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-mono text-emerald-400 font-bold">STREAMER CAM</span>
                  </div>

                  {/* Reaction Audio Pulse Meter */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-0.5 h-4 bg-[#121318]/80 px-1.5 rounded">
                    <span className="h-2 w-0.5 bg-emerald-400 animate-pulse" />
                    <span className="h-3 w-0.5 bg-emerald-400 animate-pulse" />
                    <span className="h-4 w-0.5 bg-emerald-300 animate-pulse" />
                    <span className="h-1.5 w-0.5 bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ) : layoutMode === 'Full Gameplay' ? (
            /* Full Gameplay 9:16 Immersion */
            <div className="w-full h-full relative overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center scale-110"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80)',
                  filter: activeBRoll ? 'brightness(0.3) blur(2px)' : 'brightness(0.9)',
                }}
              />
              {/* GTA 6 5-Star Wanted Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#121318]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/40 shadow-lg">
                <div className="flex gap-0.5 text-amber-400 text-xs font-mono font-black drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]">
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span className="text-amber-300 animate-pulse">&#9733;</span>
                </div>
              </div>
              <div className="absolute top-4 left-4 bg-[#121318]/80 px-2 py-0.5 rounded text-[8px] font-mono text-[#00F0FF] border border-[#00F0FF]/30">
                FULL GAMEPLAY 9:16
              </div>
            </div>
          ) : (
            /* Solo Speaker / Split Standard Camera */
            <>
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80)',
                  filter: activeBRoll ? 'brightness(0.3) blur(2px)' : 'brightness(0.85)',
                }}
              />

              {!activeBRoll && (
                <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-32 h-36 border border-emerald-400/50 rounded-2xl pointer-events-none">
                  <div className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-[#10B981]" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-[#10B981]" />
                  <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-[#10B981]" />
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-[#10B981]" />
                  <div className="absolute top-1 left-1.5 text-[8px] font-mono text-[#10B981] font-bold bg-[#121318]/70 px-1 rounded">
                    FACE TRACK: 98%
                  </div>
                </div>
              )}
            </>
          )}

          {/* Active B-Roll Overlay (Track V2) */}
          {activeBRoll && (
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 bg-black/40 animate-in fade-in duration-200">
              <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#10B981] text-black px-2.5 py-0.5 text-[10px] font-mono font-bold shadow-sm">
                <Radio className="h-3 w-3 animate-pulse" />
                <span>B-ROLL V2 ACTIVE</span>
              </div>

              <div
                className="w-full h-44 rounded-2xl bg-cover bg-center border border-white/20 shadow-2xl self-center"
                style={{ backgroundImage: `url(${activeBRoll.thumbnailUrl})` }}
              />

              <div className="text-[10px] font-mono text-zinc-300 text-center">
                {activeBRoll.title} ({activeBRoll.duration}s)
              </div>
            </div>
          )}
        </div>

        {/* Live Subtitle Overlay */}
        <div
          className={`absolute left-0 right-0 px-4 z-20 text-center ${getCaptionPositionStyle()}`}
        >
          <div className={`inline-block max-w-[92%] px-3 py-1.5 rounded-2xl backdrop-blur-md border shadow-xl ${captionPreset === 'Vice Neon' ? 'bg-[#0A0518]/90 border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.25)]' : 'bg-[#14151A]/80 border-white/10'}`}>
            <div className="flex flex-wrap items-center justify-center gap-1.5 font-sans font-black tracking-wide leading-tight">
              {currentPhrase.map((item, idx) => (
                <span
                  key={idx}
                  className={`text-base sm:text-lg transition-all ${
                    item.isCurrent
                      ? captionPreset === 'Vice Neon'
                        ? 'scale-110 drop-shadow-[0_0_14px_rgba(0,240,255,0.9)] italic'
                        : 'scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                      : 'text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]'
                  }`}
                  style={{
                    color: item.isCurrent
                      ? captionPreset === 'Vice Neon'
                        ? '#00F0FF'
                        : highlightColor
                      : '#FFFFFF',
                    fontFamily:
                      captionPreset === 'Clean Cinema'
                        ? 'Georgia, serif'
                        : 'Montserrat, sans-serif',
                  }}
                >
                  {item.word.word.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Authentic TikTok / Reels Safe-Zone Overlay */}
        {showSafeZones && (
          <div className="absolute inset-0 z-30 pointer-events-none border-2 border-dashed border-[#E84C2B]/50 m-2 rounded-2xl flex flex-col justify-between p-3">
            {/* Top Bar Warning */}
            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-[#E84C2B] bg-[#14151A]/80 px-2 py-0.5 rounded">
              <span>SAFE ZONE: TOP TABS</span>
              <span>1080x1920</span>
            </div>

            {/* Right Engagement Sidebar Simulation */}
            <div className="absolute right-3 bottom-24 flex flex-col items-center gap-3 text-white/80">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <span className="text-[9px] font-mono mt-0.5 font-bold">142K</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-[9px] font-mono mt-0.5 font-bold">1.2K</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <Bookmark className="h-4 w-4 text-white" />
                </div>
                <span className="text-[9px] font-mono mt-0.5 font-bold">18K</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <Share2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-[9px] font-mono mt-0.5 font-bold">9.4K</span>
              </div>

              <div className="h-7 w-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center animate-spin">
                <Disc className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            {/* Bottom Caption Safe Boundary */}
            <div className="w-full bg-[#E84C2B]/15 border-t border-[#E84C2B]/50 p-2 text-center text-[9px] font-mono text-[#E84C2B] font-bold rounded-b-xl">
              BOTTOM DANGER ZONE &bull; CAPTION / AUDIO TITLE
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. HARDWARE-STYLE TRANSPORT BAR                           */}
      {/* ========================================================= */}
      <div className="mt-5 flex items-center gap-3 bg-white border border-[#E6E4DD] rounded-2xl px-4 py-2 shadow-sm text-xs text-[#14151A]">
        {/* Play / Pause Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          title="Play / Pause (Space)"
          className="h-8 w-8 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>

        {/* -5s / +5s Jumps */}
        <div className="flex items-center gap-1 border-r border-[#E6E4DD] pr-3">
          <button
            type="button"
            onClick={() => onSeek(Math.max(0, playheadTime - 5))}
            className="px-2 py-1 rounded-lg text-[#52545E] hover:text-[#14151A] hover:bg-[#FAF9F5] text-xs font-mono font-bold transition-colors cursor-pointer"
            title="Rewind 5s"
          >
            -5s
          </button>
          <button
            type="button"
            onClick={() => onSeek(Math.min(totalDuration, playheadTime + 5))}
            className="px-2 py-1 rounded-lg text-[#52545E] hover:text-[#14151A] hover:bg-[#FAF9F5] text-xs font-mono font-bold transition-colors cursor-pointer"
            title="Forward 5s"
          >
            +5s
          </button>
        </div>

        {/* JetBrains Mono Timecode */}
        <div className="font-mono text-xs font-bold text-[#14151A] px-2 flex items-center gap-1">
          <span>{formatTimecode(playheadTime)}</span>
          <span className="text-[#8C8E9A]">/</span>
          <span className="text-[#8C8E9A]">{formatTimecode(totalDuration)}</span>
        </div>

        {/* Playback Speed Switcher */}
        <div className="flex items-center gap-1 border-l border-[#E6E4DD] pl-3">
          {[1.0, 1.25, 1.5].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => onChangeSpeed(speed)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                playbackSpeed === speed
                  ? 'bg-[#14151A] text-white'
                  : 'text-[#52545E] hover:text-[#14151A]'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
