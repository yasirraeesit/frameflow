'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_VIRAL_CLIPS } from '@/lib/mock-data';
import type { GeneratedClipResponse, WordTiming } from '@frameflow/shared';

import { StudioHeader, AspectRatioOption } from '@/components/editor/StudioHeader';
import { ExportModal } from '@/components/editor/ExportModal';
import {
  TranscriptPanel,
  CaptionPreset,
  LayoutMode,
  BRollBlock,
} from '@/components/editor/TranscriptPanel';
import { VideoMonitor } from '@/components/editor/VideoMonitor';
import { TimelineDock } from '@/components/editor/TimelineDock';

const DEFAULT_BROLL_ITEMS: BRollBlock[] = [
  {
    id: 'br-1',
    title: 'Silicon Wafer Macro 4K',
    start: 6.0,
    duration: 3.5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    inTimeline: true,
  },
  {
    id: 'br-2',
    title: 'SaaS Analytics Dashboard Chart',
    start: 14.5,
    duration: 4.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    inTimeline: true,
  },
  {
    id: 'br-3',
    title: 'Venture Capital Boardroom',
    start: 24.0,
    duration: 3.2,
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
    inTimeline: false,
  },
];

interface TimelineHistoryState {
  title: string;
  cutWordIndices: Set<number>;
  silencesRemoved: boolean;
  fillersRemoved: boolean;
  bRollList: BRollBlock[];
}

export default function StudioEditorPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const clipId = (params?.clipId as string) || MOCK_VIRAL_CLIPS[0].id;

  const clip: GeneratedClipResponse =
    MOCK_VIRAL_CLIPS.find((c) => c.id === clipId) || MOCK_VIRAL_CLIPS[0];

  // 1. Studio Header State
  const [shortTitle, setShortTitle] = useState<string>(
    clip.title || 'Why 90% of SaaS Founders Price Too Low'
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('9:16');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // 2. Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playheadTime, setPlayheadTime] = useState<number>(0.0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // 3. Transcript & Word Cut State
  const initialWords = clip.timelineDocument?.tracks?.[0]?.clips?.[0]?.words || [];
  const [wordsList] = useState<WordTiming[]>(initialWords);
  const [cutWordIndices, setCutWordIndices] = useState<Set<number>>(new Set());
  const [silencesRemoved, setSilencesRemoved] = useState<boolean>(false);
  const [fillersRemoved, setFillersRemoved] = useState<boolean>(false);

  // Dynamic Duration: Base 44.2s trimmed by cuts
  const baseDuration = 44.2;
  const cutDuration = (silencesRemoved ? 1.4 : 0) + (fillersRemoved ? 2.0 : 0);
  const currentDuration = Math.max(10, baseDuration - cutDuration);

  // 4. Captions & Brand State
  const isGamingClip = (clip.title && clip.title.includes('GTA')) || clip.reframeMode === 'gameplay_cam';
  const [captionPreset, setCaptionPreset] = useState<CaptionPreset>(
    isGamingClip ? 'Vice Neon' : 'Hormozi Pop'
  );
  const [highlightColor, setHighlightColor] = useState<string>(
    isGamingClip ? '#00F0FF' : '#E84C2B'
  );
  const [captionPosition, setCaptionPosition] = useState<'Bottom' | 'Center' | 'Top'>('Bottom');

  // 5. B-Roll & Safe Zones
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(
    isGamingClip ? 'Gameplay + Cam' : 'Solo Speaker'
  );
  const [bRollList, setBRollList] = useState<BRollBlock[]>(DEFAULT_BROLL_ITEMS);
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [creatorVoiceoverUrl, setCreatorVoiceoverUrl] = useState<string | null>(null);

  // 6. Timeline Dock State
  const [timelineZoom, setTimelineZoom] = useState<number>(1.0);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);

  // 7. AST History Undo / Redo Stack
  const [historyStack, setHistoryStack] = useState<TimelineHistoryState[]>([
    {
      title: clip.title,
      cutWordIndices: new Set(),
      silencesRemoved: false,
      fillersRemoved: false,
      bRollList: DEFAULT_BROLL_ITEMS,
    },
  ]);
  const [redoStack, setRedoStack] = useState<TimelineHistoryState[]>([]);

  // Push new state to history
  const pushHistory = (newState: Partial<TimelineHistoryState>) => {
    const currentState = historyStack[historyStack.length - 1];
    const combinedState: TimelineHistoryState = {
      title: newState.title !== undefined ? newState.title : currentState.title,
      cutWordIndices:
        newState.cutWordIndices !== undefined ? newState.cutWordIndices : currentState.cutWordIndices,
      silencesRemoved:
        newState.silencesRemoved !== undefined ? newState.silencesRemoved : currentState.silencesRemoved,
      fillersRemoved:
        newState.fillersRemoved !== undefined ? newState.fillersRemoved : currentState.fillersRemoved,
      bRollList: newState.bRollList !== undefined ? newState.bRollList : currentState.bRollList,
    };
    setHistoryStack((prev) => [...prev, combinedState]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (historyStack.length <= 1) return;
    const currentState = historyStack[historyStack.length - 1];
    const previousState = historyStack[historyStack.length - 2];

    setRedoStack((prev) => [...prev, currentState]);
    setHistoryStack((prev) => prev.slice(0, -1));

    // Restore state
    setShortTitle(previousState.title);
    setCutWordIndices(new Set(previousState.cutWordIndices));
    setSilencesRemoved(previousState.silencesRemoved);
    setFillersRemoved(previousState.fillersRemoved);
    setBRollList(previousState.bRollList);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];

    setRedoStack((prev) => prev.slice(0, -1));
    setHistoryStack((prev) => [...prev, nextState]);

    // Apply next state
    setShortTitle(nextState.title);
    setCutWordIndices(new Set(nextState.cutWordIndices));
    setSilencesRemoved(nextState.silencesRemoved);
    setFillersRemoved(nextState.fillersRemoved);
    setBRollList(nextState.bRollList);
  };

  // Real-time Playback Timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPlayheadTime((prev) => {
        const next = prev + 0.1 * playbackSpeed;
        if (next >= currentDuration) {
          return 0; // loop
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentDuration]);

  // Keyboard shortcut listener: Space (play/pause), Ctrl+Z (undo), Ctrl+Shift+Z / Ctrl+Y (redo), S (split)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        handleSplitAtPlayhead();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyStack, redoStack, playheadTime]);

  // Cut word handler
  const handleToggleWordCut = (index: number) => {
    const nextSet = new Set(cutWordIndices);
    if (nextSet.has(index)) {
      nextSet.delete(index);
    } else {
      nextSet.add(index);
    }
    setCutWordIndices(nextSet);
    pushHistory({ cutWordIndices: nextSet });
  };

  // 1-Click Cleanups
  const handleToggleSilences = () => {
    const next = !silencesRemoved;
    setSilencesRemoved(next);
    pushHistory({ silencesRemoved: next });
  };

  const handleToggleFillers = () => {
    const next = !fillersRemoved;
    setFillersRemoved(next);
    // Find filler word indices ("um", "like", "you know")
    const nextSet = new Set(cutWordIndices);
    wordsList.forEach((w, idx) => {
      const lower = w.word.toLowerCase();
      if (lower.includes('um') || lower.includes('uh') || lower.includes('like')) {
        if (next) nextSet.add(idx);
        else nextSet.delete(idx);
      }
    });
    setCutWordIndices(nextSet);
    pushHistory({ fillersRemoved: next, cutWordIndices: nextSet });
  };

  // B-Roll Toggle
  const handleToggleBRoll = (id: string) => {
    const nextList = bRollList.map((b) => (b.id === id ? { ...b, inTimeline: !b.inTimeline } : b));
    setBRollList(nextList);
    pushHistory({ bRollList: nextList });
  };

  // Split Clip at Playhead
  const handleSplitAtPlayhead = () => {
    // Splits timeline active speech chunk at current playhead
    const closestWordIdx = wordsList.findIndex(
      (w) => playheadTime >= w.start && playheadTime <= w.end
    );
    if (closestWordIdx !== -1) {
      handleToggleWordCut(closestWordIdx);
    }
  };

  // Persist AST timeline edits to Fastify API
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('frameflow_token') : null;
        if (!token || clipId === 'demo-1' || clipId.startsWith('clip-')) return;

        await fetch(`/api/clips/${clipId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: shortTitle,
            layoutMode: layoutMode.toLowerCase().replace(/ /g, '_'),
            timelineAstJson: {
              aspectRatio,
              captionPreset,
              highlightColor,
              words: wordsList,
              cutWords: Array.from(cutWordIndices),
            },
          }),
        });
      } catch (err) {
        console.warn('AST sync warning:', err);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [shortTitle, layoutMode, aspectRatio, captionPreset, highlightColor, wordsList, cutWordIndices, clipId]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FAF9F5] text-[#14151A] select-none font-sans antialiased">
      {/* ======================================================== */}
      {/* 1. TOP STUDIO HEADER (54px)                              */}
      {/* ======================================================== */}
      <StudioHeader
        title={shortTitle}
        onTitleChange={(t) => {
          setShortTitle(t);
          pushHistory({ title: t });
        }}
        viralityScore={clip.viralityScore || 96}
        undoAvailable={historyStack.length > 1}
        redoAvailable={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        aspectRatio={aspectRatio}
        onAspectChange={setAspectRatio}
        onOpenExport={() => setIsExportOpen(true)}
        backHref={`/projects/${clip.projectId || 'demo-1'}`}
      />

      {/* ======================================================== */}
      {/* 2. UPPER SPLIT STAGE (TRANSCRIPT RAIL + VIDEO MONITOR)   */}
      {/* ======================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Transcript, Captions & B-Roll */}
        <TranscriptPanel
          words={wordsList}
          cutWordIndices={cutWordIndices}
          onToggleWordCut={handleToggleWordCut}
          playheadTime={playheadTime}
          onSeekWord={(timeSec) => setPlayheadTime(timeSec)}
          silencesRemoved={silencesRemoved}
          fillersRemoved={fillersRemoved}
          onToggleSilences={handleToggleSilences}
          onToggleFillers={handleToggleFillers}
          captionPreset={captionPreset}
          onSelectCaptionPreset={setCaptionPreset}
          highlightColor={highlightColor}
          onSelectColor={setHighlightColor}
          captionPosition={captionPosition}
          onSelectPosition={setCaptionPosition}
          layoutMode={layoutMode}
          onSelectLayoutMode={setLayoutMode}
          bRollList={bRollList}
          onToggleBRoll={handleToggleBRoll}
          commentaryHookScript={
            clip.socialPack?.caption ||
            (clip.title.includes('GTA')
              ? "You won't believe what happens at the 20-second mark of this 5-star chase—watch the minimap right here."
              : "Stop scrolling if you are trying to price your SaaS product. Here is why 90% of founders fail before month six.")
          }
          onSaveVoiceover={(url) => {
            setCreatorVoiceoverUrl(url);
          }}
        />

        {/* Center Stage: Dark Cinema Video Monitor */}
        <VideoMonitor
          aspectRatio={aspectRatio}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          playheadTime={playheadTime}
          totalDuration={currentDuration}
          onSeek={setPlayheadTime}
          words={wordsList}
          cutWordIndices={cutWordIndices}
          captionPreset={captionPreset}
          highlightColor={highlightColor}
          captionPosition={captionPosition}
          showSafeZones={showSafeZones}
          onToggleSafeZones={() => setShowSafeZones((s) => !s)}
          bRollList={bRollList}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          layoutMode={layoutMode}
        />
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM NON-DESTRUCTIVE MULTI-TRACK AST TIMELINE DOCK  */}
      {/* ======================================================== */}
      <TimelineDock
        playheadTime={playheadTime}
        totalDuration={currentDuration}
        onSeek={setPlayheadTime}
        words={wordsList}
        cutWordIndices={cutWordIndices}
        bRollList={bRollList}
        onSplitAtPlayhead={handleSplitAtPlayhead}
        timelineZoom={timelineZoom}
        onZoomIn={() => setTimelineZoom((z) => Math.min(3.0, z + 0.5))}
        onZoomOut={() => setTimelineZoom((z) => Math.max(1.0, z - 0.5))}
        snapEnabled={snapEnabled}
        onToggleSnap={() => setSnapEnabled((s) => !s)}
      />

      {/* ======================================================== */}
      {/* 4. EXPORT & NLE PROJECT MODAL                            */}
      {/* ======================================================== */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        clipTitle={shortTitle}
        durationSec={currentDuration}
        clipId={clipId}
      />
    </div>
  );
}
