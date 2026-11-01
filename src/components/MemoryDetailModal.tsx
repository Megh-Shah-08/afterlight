'use client';

import React, { useState } from 'react';
import { Memory } from '@/types/memory';
import {
  X,
  Calendar,
  MapPin,
  User,
  Sparkles,
  Download,
  Trash2,
  Clock,
  HelpCircle,
  Tag,
  ShieldCheck,
  RefreshCw,
  Play,
  Pause,
} from 'lucide-react';
import { exportMemoryAsMarkdown, downloadFile } from '@/lib/storage';

interface MemoryDetailModalProps {
  memory: Memory;
  onClose: () => void;
  onDelete: (id: string, title: string) => void;
  onRegeneratePortrait: (memory: Memory) => void;
  isRegenerating?: boolean;
}

export default function MemoryDetailModal({
  memory,
  onClose,
  onDelete,
  onRegeneratePortrait,
  isRegenerating = false,
}: MemoryDetailModalProps) {
  const [activeView, setActiveView] = useState<'portrait' | 'original'>('portrait');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const portrait = memory.portrait;

  const handleExport = () => {
    const md = exportMemoryAsMarkdown(memory);
    const slug = memory.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    downloadFile(md, `${slug}-portrait.md`, 'text/markdown');
  };

  const toggleAudio = () => {
    if (!memory.audioBlobUrl) return;
    const audioEl = document.getElementById(`audio-${memory.id}`) as HTMLAudioElement;
    if (!audioEl) return;
    if (isPlayingAudio) {
      audioEl.pause();
      setIsPlayingAudio(false);
    } else {
      audioEl.play();
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-charcoal-900 border border-charcoal-750 shadow-2xl overflow-hidden">
        
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-800 bg-charcoal-950/70">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
              {memory.isDemo ? 'Curated Demo Memory' : 'Archived Memory Portrait'}
            </span>
            {portrait?.modelUsed && (
              <span className="text-xs text-charcoal-500 font-mono hidden sm:inline">
                | Model: {portrait.modelUsed}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              title="Download as Markdown"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-200 transition-colors border border-charcoal-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export .MD</span>
            </button>

            <button
              onClick={() => onDelete(memory.id, memory.title)}
              title="Delete Memory"
              className="p-2 rounded-lg text-charcoal-400 hover:text-rose-400 hover:bg-charcoal-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-100 hover:bg-charcoal-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Header Metadata Section */}
        <div className="px-6 py-5 bg-gradient-to-b from-charcoal-850 to-charcoal-900 border-b border-charcoal-800">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <User className="w-3 h-3 text-amber-400" />
              <span>{memory.person}</span>
              {memory.relationship && <span className="text-charcoal-400">({memory.relationship})</span>}
            </span>
            {memory.era && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs bg-charcoal-800 text-charcoal-300 border border-charcoal-700">
                <Calendar className="w-3 h-3 text-charcoal-400" />
                <span>{memory.era}</span>
              </span>
            )}
            {memory.place && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs bg-charcoal-800 text-charcoal-300 border border-charcoal-700">
                <MapPin className="w-3 h-3 text-charcoal-400" />
                <span>{memory.place}</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-100 leading-snug">
            {memory.title}
          </h2>

          {/* Voice Memo Player (if present) */}
          {memory.audioBlobUrl && (
            <div className="mt-4 p-3 rounded-xl bg-charcoal-950/80 border border-charcoal-750 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleAudio}
                  className="w-9 h-9 rounded-full bg-marigold-600 hover:bg-marigold-500 text-white flex items-center justify-center transition-colors"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <div className="text-xs font-medium text-charcoal-200">Preserved Voice Recording</div>
                  <div className="text-[11px] text-charcoal-500">
                    {isPlayingAudio ? 'Playing back voice memo...' : 'Click to listen to authentic recording'}
                  </div>
                </div>
              </div>
              <audio
                id={`audio-${memory.id}`}
                src={memory.audioBlobUrl}
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
            </div>
          )}

          {/* View Toggle Tabs */}
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-charcoal-800">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveView('portrait')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeView === 'portrait'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-charcoal-400 hover:text-charcoal-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Gemma Portrait Synthesis</span>
              </button>

              <button
                onClick={() => setActiveView('original')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeView === 'original'
                    ? 'bg-charcoal-750 text-charcoal-100 border border-charcoal-700'
                    : 'text-charcoal-400 hover:text-charcoal-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Original Authentic Story</span>
              </button>
            </div>

            <button
              onClick={() => onRegeneratePortrait(memory)}
              disabled={isRegenerating}
              className="flex items-center space-x-1 text-xs text-charcoal-400 hover:text-amber-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isRegenerating ? 'Analyzing...' : 'Re-run Gemma'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-charcoal-200 text-sm leading-relaxed">
          {activeView === 'original' ? (
            /* Original Raw Story View */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300/90 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Authentic Source Testimony:</strong> This is the exact, unedited narrative recorded by the family. Gemma never alters this original testimony.
                </p>
              </div>

              <div className="bg-charcoal-950/60 p-6 rounded-2xl border border-charcoal-800 text-charcoal-200 font-serif text-base leading-relaxed whitespace-pre-wrap">
                {memory.originalStory}
              </div>
            </div>
          ) : (
            /* Gemma Structured Portrait View */
            <div className="space-y-6">
              {/* Remembrance Quote */}
              {portrait?.remembrance && (
                <div className="relative p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-600/5 to-charcoal-900 border border-amber-500/30">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400/80 mb-2">
                    Remembrance Tribute
                  </div>
                  <blockquote className="text-base sm:text-lg font-serif italic text-amber-100 leading-relaxed">
                    &ldquo;{portrait.remembrance}&rdquo;
                  </blockquote>
                </div>
              )}

              {/* Summary */}
              {portrait?.summary && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-charcoal-400 mb-1.5">
                    Factual Summary
                  </h4>
                  <p className="text-charcoal-300 font-serif leading-relaxed text-sm bg-charcoal-850/60 p-4 rounded-xl border border-charcoal-800">
                    {portrait.summary}
                  </p>
                </div>
              )}

              {/* Polished Editorial Narrative */}
              {portrait?.rewrittenNarrative && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-charcoal-400 mb-1.5">
                    Polished Narrative Reconstruction
                  </h4>
                  <div className="bg-charcoal-950/50 p-5 rounded-xl border border-charcoal-800 text-charcoal-200 font-serif text-sm leading-relaxed whitespace-pre-wrap">
                    {portrait.rewrittenNarrative}
                  </div>
                </div>
              )}

              {/* Two Column Grid: Timeline & Named Entities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Timeline */}
                <div className="p-4 rounded-xl bg-charcoal-850/50 border border-charcoal-800">
                  <div className="flex items-center space-x-1.5 text-xs font-mono uppercase tracking-widest text-charcoal-400 mb-3">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Timeline of Milestones</span>
                  </div>
                  {portrait?.timeline && portrait.timeline.length > 0 ? (
                    <ul className="space-y-2.5">
                      {portrait.timeline.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs">
                          <span className="font-mono text-amber-300 font-semibold shrink-0 bg-charcoal-800 px-1.5 py-0.5 rounded">
                            {item.dateOrEra}
                          </span>
                          <span className="text-charcoal-300">{item.event}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-charcoal-500 italic">No specific milestones identified.</p>
                  )}
                </div>

                {/* People & Places */}
                <div className="p-4 rounded-xl bg-charcoal-850/50 border border-charcoal-800 space-y-4">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-charcoal-400 mb-2">
                      People Mentioned
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {portrait?.people && portrait.people.length > 0 ? (
                        portrait.people.map((p, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-xs bg-charcoal-800 text-amber-300/90 border border-amber-500/20"
                          >
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-charcoal-500">None identified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-charcoal-400 mb-2">
                      Places & Settings
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {portrait?.places && portrait.places.length > 0 ? (
                        portrait.places.map((place, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-xs bg-charcoal-800 text-charcoal-300 border border-charcoal-700"
                          >
                            {place}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-charcoal-500">None identified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Themes & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portrait?.themes && portrait.themes.length > 0 && (
                  <div className="p-4 rounded-xl bg-charcoal-850/50 border border-charcoal-800">
                    <div className="text-xs font-mono uppercase tracking-widest text-charcoal-400 mb-2">
                      Themes & Core Archetypes
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {portrait.themes.map((theme, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {portrait?.tags && portrait.tags.length > 0 && (
                  <div className="p-4 rounded-xl bg-charcoal-850/50 border border-charcoal-800">
                    <div className="flex items-center space-x-1.5 text-xs font-mono uppercase tracking-widest text-charcoal-400 mb-2">
                      <Tag className="w-3.5 h-3.5 text-charcoal-400" />
                      <span>Archive Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {portrait.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-xs font-mono bg-charcoal-800 text-charcoal-400 border border-charcoal-750"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Follow-up Questions for Next Generation */}
              {portrait?.followUpQuestions && portrait.followUpQuestions.length > 0 && (
                <div className="p-5 rounded-2xl bg-charcoal-950/80 border border-amber-500/20">
                  <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-amber-300 mb-3">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Inquiry Prompts for Future Family Conversations</span>
                  </div>
                  <ul className="space-y-2">
                    {portrait.followUpQuestions.map((q, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs text-charcoal-300 font-serif">
                        <span className="text-amber-400 font-mono">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-charcoal-800 bg-charcoal-950/80 flex items-center justify-between text-xs text-charcoal-500 font-mono">
          <span>Created: {new Date(memory.createdAt).toLocaleDateString()}</span>
          <span>AFTERLIGHT Local Memory Vault</span>
        </div>
      </div>
    </div>
  );
}
