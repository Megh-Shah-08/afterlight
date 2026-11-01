'use client';

import React from 'react';
import { Memory } from '@/types/memory';
import { Calendar, MapPin, User, Sparkles, BookOpen, Download, Trash2, Mic } from 'lucide-react';
import { exportMemoryAsMarkdown, downloadFile } from '@/lib/storage';

interface MemoryCardProps {
  memory: Memory;
  onSelect: (memory: Memory) => void;
  onDelete: (id: string, title: string) => void;
}

export default function MemoryCard({ memory, onSelect, onDelete }: MemoryCardProps) {
  const portrait = memory.portrait;

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const md = exportMemoryAsMarkdown(memory);
    const slug = memory.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    downloadFile(md, `${slug}-portrait.md`, 'text/markdown');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(memory.id, memory.title);
  };

  return (
    <div
      onClick={() => onSelect(memory)}
      className="group relative cursor-pointer rounded-2xl bg-gradient-to-b from-charcoal-850/90 to-charcoal-900/90 border border-charcoal-750/70 hover:border-amber-500/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
    >
      {/* Candlelight corner glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-tr-2xl bg-amber-500/5 group-hover:bg-amber-500/10 blur-xl transition-all pointer-events-none" />

      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {memory.relationship && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <User className="w-3 h-3 text-amber-400" />
                <span>{memory.relationship}</span>
              </span>
            )}
            {memory.isDemo && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-charcoal-800 text-charcoal-400 border border-charcoal-700">
                Curated Demo
              </span>
            )}
            {memory.audioBlobUrl && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-marigold-500/15 text-marigold-300 border border-marigold-500/30">
                <Mic className="w-3 h-3 text-marigold-400" />
                <span>Voice Attached</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleExport}
              title="Export as Markdown"
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-amber-300 hover:bg-charcoal-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              title="Delete memory"
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-400 hover:bg-charcoal-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-serif font-bold text-charcoal-100 group-hover:text-amber-200 transition-colors leading-snug mb-2">
          {memory.title}
        </h3>

        {/* Person, Era, Place Metadata */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-charcoal-400 mb-4">
          <div className="flex items-center space-x-1 text-charcoal-300 font-medium">
            <span>{memory.person}</span>
          </div>
          {memory.era && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-charcoal-500" />
              <span>{memory.era}</span>
            </div>
          )}
          {memory.place && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-charcoal-500" />
              <span>{memory.place}</span>
            </div>
          )}
        </div>

        {/* Remembrance Passage Quote (if portrait exists) */}
        {portrait?.remembrance ? (
          <div className="relative pl-3 border-l-2 border-amber-500/40 my-3 py-0.5 text-xs italic font-serif text-amber-100/90 leading-relaxed bg-amber-500/5 rounded-r-lg pr-2">
            &ldquo;{portrait.remembrance.slice(0, 160)}
            {portrait.remembrance.length > 160 ? '...' : ''}&rdquo;
          </div>
        ) : (
          <p className="text-xs text-charcoal-400 line-clamp-3 leading-relaxed mb-4">
            {memory.originalStory}
          </p>
        )}

        {/* Themes or Tags */}
        {portrait?.themes && portrait.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {portrait.themes.slice(0, 3).map((theme, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[11px] bg-charcoal-800/80 text-charcoal-300 border border-charcoal-700/60"
              >
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer link to view full portrait */}
      <div className="mt-5 pt-3 border-t border-charcoal-800/80 flex items-center justify-between text-xs text-charcoal-400 group-hover:text-amber-300 transition-colors">
        <div className="flex items-center space-x-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Gemma Portrait View</span>
        </div>
        <div className="flex items-center space-x-1 font-mono text-[11px] text-charcoal-500 group-hover:text-amber-400/80">
          <BookOpen className="w-3 h-3" />
          <span>Open Portrait &rarr;</span>
        </div>
      </div>
    </div>
  );
}
