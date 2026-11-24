'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  Sparkles,
  Edit2,
  Check,
  Smartphone,
  Square,
  Monitor,
} from 'lucide-react';

export type AspectRatioOption = '9:16' | '1:1' | '16:9';

interface StudioHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  viralityScore?: number;
  undoAvailable: boolean;
  redoAvailable: boolean;
  onUndo: () => void;
  onRedo: () => void;
  aspectRatio: AspectRatioOption;
  onAspectChange: (aspect: AspectRatioOption) => void;
  onOpenExport: () => void;
  backHref?: string;
}

export function StudioHeader({
  title,
  onTitleChange,
  viralityScore = 96,
  undoAvailable,
  redoAvailable,
  onUndo,
  onRedo,
  aspectRatio,
  onAspectChange,
  onOpenExport,
  backHref = '/projects/demo-1',
}: StudioHeaderProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleSave = () => {
    setIsEditing(false);
    if (tempTitle.trim().length > 0) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempTitle(title);
    }
  };

  return (
    <header className="h-[54px] bg-white border-b border-[#E6E4DD] px-4 flex items-center justify-between text-[#14151A] select-none z-30 shrink-0">
      {/* ======================================================== */}
      {/* LEFT: BACK LINK + EDITABLE TITLE + VIRALITY BADGE        */}
      {/* ======================================================== */}
      <div className="flex items-center gap-3 min-w-0 max-w-[45%]">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52545E] hover:text-[#14151A] transition-colors py-1 px-1.5 rounded-lg hover:bg-[#FAF9F5] shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back to Shorts</span>
        </Link>

        <span className="text-[#DCDAD2] shrink-0">/</span>

        {/* Inline Editable Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="bg-[#FAF9F5] border border-[#E84C2B] rounded-lg px-2 py-0.5 text-xs font-bold text-[#14151A] focus:outline-none w-56 sm:w-72 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleSave}
                className="p-1 rounded bg-[#E84C2B] text-white hover:bg-[#D13B1C] transition-colors"
                aria-label="Save title"
              >
                <Check className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempTitle(title);
                setIsEditing(true);
              }}
              className="group flex items-center gap-1.5 text-xs font-bold text-[#14151A] hover:text-[#E84C2B] transition-colors truncate text-left"
              title="Click to edit clip title"
            >
              <span className="truncate max-w-[100px] sm:max-w-[240px] md:max-w-[340px]">
                {title}
              </span>
              <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity shrink-0 text-[#8C8E9A]" />
            </button>
          )}
        </div>

        {/* Virality Score Badge */}
        <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700 shrink-0 shadow-2xs">
          <Sparkles className="h-3 w-3 text-emerald-600" />
          <span>{viralityScore}/99 Viral</span>
        </span>
      </div>

      {/* ======================================================== */}
      {/* CENTER: UNDO / REDO + ASPECT RATIO SWITCHER             */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Undo / Redo controls */}
        <div className="flex items-center rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={onUndo}
            disabled={!undoAvailable}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg text-[#52545E] hover:text-[#14151A] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <div className="h-3 w-[1px] bg-[#E6E4DD]" />
          <button
            type="button"
            onClick={onRedo}
            disabled={!redoAvailable}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded-lg text-[#52545E] hover:text-[#14151A] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Aspect Ratio Switcher */}
        <div className="flex items-center rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] p-0.5 shadow-2xs">
          {[
            { id: '9:16', label: '9:16', icon: Smartphone, title: 'TikTok / Reels / Shorts' },
            { id: '1:1', label: '1:1', icon: Square, title: 'Square Feed' },
            { id: '16:9', label: '16:9', icon: Monitor, title: 'YouTube Widescreen' },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = aspectRatio === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onAspectChange(item.id as AspectRatioOption)}
                title={item.title}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#14151A] text-white shadow-2xs'
                    : 'text-[#52545E] hover:text-[#14151A]'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline font-mono">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT: EXPORT SOLID CORAL BUTTON                        */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenExport}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export 1080p MP4</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>
    </header>
  );
}
