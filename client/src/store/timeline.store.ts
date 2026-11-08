import { create } from 'zustand';
import { TimelineDocument, CommandHistory, ICommand } from '@frameflow/shared';

export interface TimelineState {
  timeline: TimelineDocument | null;
  history: CommandHistory;
  playhead: number;
  isPlaying: boolean;
  zoom: number; // Pixels per second
  selectedClipId: string | null;
  snappingEnabled: boolean;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedVersion: number;

  // Actions
  setTimeline: (timeline: TimelineDocument) => void;
  setPlayhead: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setZoom: (zoom: number) => void;
  setSelectedClipId: (clipId: string | null) => void;
  setSnappingEnabled: (enabled: boolean) => void;
  executeCommand: (command: ICommand) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  markSaved: (version: number) => void;
  setIsSaving: (saving: boolean) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  timeline: null,
  history: new CommandHistory(),
  playhead: 0,
  isPlaying: false,
  zoom: 60, // 60 pixels per second default
  selectedClipId: null,
  snappingEnabled: true,
  isDirty: false,
  isSaving: false,
  lastSavedVersion: 1,

  setTimeline: (timeline) => {
    set({
      timeline,
      history: new CommandHistory(),
      playhead: 0,
      isPlaying: false,
      selectedClipId: null,
      isDirty: false,
      lastSavedVersion: timeline.version,
    });
  },

  setPlayhead: (time) => {
    const clamped = Math.max(0, time);
    set({ playhead: clamped });
  },

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setZoom: (zoom) => {
    const clampedZoom = Math.min(300, Math.max(10, zoom));
    set({ zoom: clampedZoom });
  },

  setSelectedClipId: (selectedClipId) => {
    set({ selectedClipId });
  },

  setSnappingEnabled: (snappingEnabled) => {
    set({ snappingEnabled });
  },

  executeCommand: (command) => {
    const { timeline, history } = get();
    if (!timeline) return;

    const nextTimeline = history.execute(command, timeline);
    set({
      timeline: nextTimeline,
      isDirty: true,
    });
  },

  undo: () => {
    const { timeline, history } = get();
    if (!timeline) return;

    const previousTimeline = history.undo(timeline);
    if (previousTimeline) {
      set({
        timeline: previousTimeline,
        isDirty: true,
      });
    }
  },

  redo: () => {
    const { timeline, history } = get();
    if (!timeline) return;

    const nextTimeline = history.redo(timeline);
    if (nextTimeline) {
      set({
        timeline: nextTimeline,
        isDirty: true,
      });
    }
  },

  canUndo: () => {
    return get().history.canUndo;
  },

  canRedo: () => {
    return get().history.canRedo;
  },

  markSaved: (version) => {
    set({
      isDirty: false,
      isSaving: false,
      lastSavedVersion: version,
    });
  },

  setIsSaving: (isSaving) => {
    set({ isSaving });
  },
}));
