'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useTimelineStore } from '../../store/timeline.store';
import { Clip, Track } from '@frameflow/shared';
import { TimecodeDisplay } from './TimecodeDisplay';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Film,
} from 'lucide-react';

interface PreviewPlayerProps {
  assetProxyMap?: Record<string, string>; // Maps assetId to proxyUrl if not set directly on clip
}

export function PreviewPlayer({ assetProxyMap = {} }: PreviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeline = useTimelineStore((s) => s.timeline);
  const playhead = useTimelineStore((s) => s.playhead);
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const togglePlay = useTimelineStore((s) => s.togglePlay);
  const setIsPlaying = useTimelineStore((s) => s.setIsPlaying);
  const setPlayhead = useTimelineStore((s) => s.setPlayhead);
  const fps = timeline?.fps ?? 30;

  // Find topmost active video clip at current playhead
  const activeVideoClip = useMemo<Clip | null>(() => {
    if (!timeline) return null;
    const videoTracks = timeline.tracks.filter((t: Track) => t.type === 'VIDEO' && !t.muted);

    // Later tracks render on top of earlier tracks
    for (let i = videoTracks.length - 1; i >= 0; i--) {
      const track = videoTracks[i];
      const clip = track.clips.find(
        (c) => playhead >= c.start && playhead < c.start + c.duration
      );
      if (clip) return clip;
    }
    return null;
  }, [timeline, playhead]);

  // Find active text clips at current playhead
  const activeTextClips = useMemo<Clip[]>(() => {
    if (!timeline) return [];
    const textTracks = timeline.tracks.filter((t: Track) => t.type === 'TEXT' && !t.muted);
    const clips: Clip[] = [];
    for (const track of textTracks) {
      const clip = track.clips.find(
        (c) => playhead >= c.start && playhead < c.start + c.duration
      );
      if (clip && clip.textConfig) {
        clips.push(clip);
      }
    }
    return clips;
  }, [timeline, playhead]);

  // Resolve proxy URL for active clip
  const currentVideoSrc = useMemo(() => {
    if (!activeVideoClip) return null;
    if (activeVideoClip.proxyUrl) return activeVideoClip.proxyUrl;
    if (activeVideoClip.assetId && assetProxyMap[activeVideoClip.assetId]) {
      return assetProxyMap[activeVideoClip.assetId];
    }
    return null;
  }, [activeVideoClip, assetProxyMap]);

  // Synchronize video element source and currentTime
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoClip || !currentVideoSrc) return;

    const targetVideoTime =
      (playhead - activeVideoClip.start) * activeVideoClip.speed + activeVideoClip.inPoint;

    // Switch src if changed
    if (video.src !== currentVideoSrc && !video.src.endsWith(currentVideoSrc)) {
      video.src = currentVideoSrc;
      video.currentTime = targetVideoTime;
      if (isPlaying) {
        void video.play().catch(() => {});
      }
      return;
    }

    // Seek if out of sync by more than 50ms (or when scrubbing)
    if (Math.abs(video.currentTime - targetVideoTime) > 0.05) {
      video.currentTime = targetVideoTime;
    }
  }, [playhead, activeVideoClip, currentVideoSrc, isPlaying]);

  // Animation frame loop for playback progression
  useEffect(() => {
    if (!isPlaying) {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      return;
    }

    if (videoRef.current && videoRef.current.paused && currentVideoSrc) {
      void videoRef.current.play().catch(() => {});
    }

    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      const currentPlayhead = useTimelineStore.getState().playhead;
      const totalDuration = useTimelineStore.getState().timeline?.duration ?? 0;
      const nextPlayhead = currentPlayhead + deltaSec;

      if (totalDuration > 0 && nextPlayhead >= totalDuration) {
        setPlayhead(totalDuration);
        setIsPlaying(false);
      } else {
        setPlayhead(nextPlayhead);
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentVideoSrc, setIsPlaying, setPlayhead]);

  // Playhead step handlers
  const handleJumpStart = () => setPlayhead(0);
  const handleStepBack = () => setPlayhead(Math.max(0, playhead - 1 / fps));
  const handleStepForward = () => setPlayhead(playhead + 1 / fps);
  const handleJumpEnd = () => {
    if (timeline) setPlayhead(timeline.duration);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-lg"
    >
      {/* Video Viewport Area (16:9) */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {currentVideoSrc ? (
          <video
            ref={videoRef}
            src={currentVideoSrc}
            playsInline
            muted
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-600 gap-2">
            <Film className="w-10 h-10 opacity-40" />
            <span className="text-xs font-mono">No video clip at playhead</span>
          </div>
        )}

        {/* Text Overlay Layer */}
        {activeTextClips.map((textClip) => {
          if (!textClip.textConfig) return null;
          const { text, fontSize, color, position } = textClip.textConfig;
          return (
            <div
              key={textClip.id}
              className="absolute pointer-events-none font-bold drop-shadow-md select-none text-center"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${fontSize}px`,
                color: color,
              }}
            >
              {text}
            </div>
          );
        })}
      </div>

      {/* Preview Player Transport Controls */}
      <div className="h-10 bg-zinc-900 border-t border-zinc-800 px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={handleJumpStart}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Jump to Start"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handleStepBack}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Step 1 Frame Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition mx-1"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </button>
          <button
            onClick={handleStepForward}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Step 1 Frame Forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleJumpEnd}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Jump to End"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <TimecodeDisplay />

        <div>
          <button
            onClick={handleToggleFullscreen}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
