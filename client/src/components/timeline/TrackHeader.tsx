'use client';

import React from 'react';
import { Track } from '@frameflow/shared';
import { useTimelineStore } from '../../store/timeline.store';
import { ToggleTrackLockCommand, ToggleTrackMuteCommand } from '@frameflow/shared';
import { Video, Volume2, VolumeX, Lock, Unlock, Type } from 'lucide-react';

interface TrackHeaderProps {
  track: Track;
}

export function TrackHeader({ track }: TrackHeaderProps) {
  const executeCommand = useTimelineStore((s) => s.executeCommand);

  const getIcon = () => {
    switch (track.type) {
      case 'VIDEO':
        return <Video className="w-3.5 h-3.5 text-blue-400" />;
      case 'AUDIO':
        return <Volume2 className="w-3.5 h-3.5 text-green-400" />;
      case 'TEXT':
        return <Type className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const handleToggleLock = () => {
    executeCommand(new ToggleTrackLockCommand(track.id));
  };

  const handleToggleMute = () => {
    executeCommand(new ToggleTrackMuteCommand(track.id));
  };

  return (
    <div className="h-16 w-52 flex-shrink-0 bg-zinc-900 border-b border-r border-zinc-800 px-3 flex items-center justify-between select-none">
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="p-1 rounded bg-zinc-800/80">{getIcon()}</div>
        <div className="truncate">
          <p className="text-xs font-medium text-zinc-200 truncate">{track.name}</p>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            {track.type}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleToggleMute}
          title={track.muted ? 'Unmute Track' : 'Mute Track'}
          className={`p-1.5 rounded transition ${
            track.muted
              ? 'bg-amber-950/60 text-amber-400 hover:bg-amber-900/60'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
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
          className={`p-1.5 rounded transition ${
            track.locked
              ? 'bg-red-950/60 text-red-400 hover:bg-red-900/60'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
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
}
