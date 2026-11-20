'use client';

import React, { memo } from 'react';
import { Track } from '@frameflow/shared';
import { useTimelineStore } from '../../store/timeline.store';
import { ToggleTrackLockCommand, ToggleTrackMuteCommand } from '@frameflow/shared';
import { Video, Volume2, VolumeX, Lock, Unlock, Type } from 'lucide-react';

interface TrackHeaderProps {
  track: Track;
}

export const TrackHeader = memo(function TrackHeader({ track }: TrackHeaderProps) {
  const executeCommand = useTimelineStore((s) => s.executeCommand);

  const getIcon = () => {
    switch (track.type) {
      case 'VIDEO':
        return <Video className="w-3.5 h-3.5 text-blue-400" />;
      case 'AUDIO':
        return <Volume2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'TEXT':
        return <Type className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const getBadgeColor = () => {
    switch (track.type) {
      case 'VIDEO':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'AUDIO':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'TEXT':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    }
  };

  const handleToggleLock = () => {
    executeCommand(new ToggleTrackLockCommand(track.id));
  };

  const handleToggleMute = () => {
    executeCommand(new ToggleTrackMuteCommand(track.id));
  };

  return (
    <div
      className={`h-14 w-52 flex-shrink-0 border-b border-r border-studio-border px-3 flex items-center justify-between select-none transition-colors ${track.locked ? 'bg-studio-panel/90 text-zinc-500' : 'bg-studio-surface text-zinc-200'
        }`}
    >
      <div className="flex items-center gap-2 overflow-hidden min-w-0">
        <div className={`p-1 rounded border flex-shrink-0 ${getBadgeColor()}`}>
          {getIcon()}
        </div>
        <div className="truncate">
          <p className="text-xs font-semibold truncate text-zinc-200 leading-tight">
            {track.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider">
              {track.type}
            </span>
            <span className="text-[9px] text-zinc-500 font-mono">
              • {track.clips.length} {track.clips.length === 1 ? 'clip' : 'clips'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleToggleMute}
          title={track.muted ? 'Unmute Track' : 'Mute Track'}
          className={`p-1 rounded text-xs transition border ${track.muted
            ? 'bg-amber-950/80 text-amber-400 border-amber-800/80 hover:bg-amber-900/80'
            : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-studio-surface-sub hover:border-studio-border'
            }`}
        >
          {track.muted ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          onClick={handleToggleLock}
          title={track.locked ? 'Unlock Track' : 'Lock Track'}
          className={`p-1 rounded text-xs transition border ${track.locked
            ? 'bg-red-950/80 text-red-400 border-red-800/80 hover:bg-red-900/80'
            : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-studio-surface-sub hover:border-studio-border'
            }`}
        >
          {track.locked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <Unlock className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
});
