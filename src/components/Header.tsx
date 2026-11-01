'use client';

import React from 'react';
import { Flame, Sparkles, PlusCircle, MessageSquareQuote, Sliders, ShieldCheck } from 'lucide-react';
import { OllamaStatus } from '@/lib/ollama';

interface HeaderProps {
  activeTab: 'garden' | 'plant' | 'ask' | 'settings';
  setActiveTab: (tab: 'garden' | 'plant' | 'ask' | 'settings') => void;
  memoryCount: number;
  ollamaStatus: OllamaStatus | null;
  onOpenSettings: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  memoryCount,
  ollamaStatus,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="relative z-10 border-b border-charcoal-750/80 bg-charcoal-900/80 backdrop-blur-md">
      {/* Top micro-bar: Theme & Privacy announcement */}
      <div className="bg-charcoal-950/90 border-b border-charcoal-800/60 px-4 py-1.5 text-xs text-charcoal-500 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-marigold-500 animate-pulse" />
          <span className="text-charcoal-400 font-medium">DEV Hacktoberfest 2026: Week 4</span>
          <span className="text-charcoal-600">|</span>
          <span className="italic text-amber-200/70">Ghost in the Machine</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 text-charcoal-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80" />
            <span>100% Private Local Storage (IndexedDB)</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-charcoal-850 hover:bg-charcoal-800 text-charcoal-400 hover:text-amber-300 transition-colors"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                ollamaStatus?.available ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] font-mono">
              {ollamaStatus?.available ? `Gemma (${ollamaStatus.recommendedModel})` : 'Offline / Demo Ready'}
            </span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Branding */}
          <div
            onClick={() => setActiveTab('garden')}
            className="cursor-pointer group flex items-center space-x-3.5"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-charcoal-900 border border-amber-500/30 group-hover:border-amber-400/60 transition-all candle-glow">
              <Flame className="w-6 h-6 text-amber-400 group-hover:text-amber-300 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <h1 className="text-2xl font-serif tracking-wide text-gradient-gold font-bold">
                  AFTERLIGHT
                </h1>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400/70">
                  Memory Garden
                </span>
              </div>
              <p className="text-xs text-charcoal-400 font-serif italic">
                &ldquo;People leave. Their stories don&apos;t have to.&rdquo;
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-charcoal-850/80 p-1.5 rounded-xl border border-charcoal-750">
            <button
              onClick={() => setActiveTab('garden')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'garden'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>The Garden</span>
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-charcoal-900 text-amber-400 border border-amber-500/20 font-mono">
                {memoryCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('plant')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'plant'
                  ? 'bg-marigold-500/20 text-marigold-300 border border-marigold-500/30 shadow-sm'
                  : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-marigold-400" />
              <span>Plant a Memory</span>
            </button>

            <button
              onClick={() => setActiveTab('ask')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ask'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4 text-amber-400" />
              <span>Ask the Garden</span>
            </button>

            <button
              onClick={onOpenSettings}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-charcoal-700 text-charcoal-100'
                  : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800'
              }`}
              title="Settings & Ollama Configuration"
            >
              <Sliders className="w-4 h-4 text-charcoal-400" />
              <span className="hidden sm:inline">Engine</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
