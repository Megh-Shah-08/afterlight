'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import MemoryCard from '@/components/MemoryCard';
import MemoryDetailModal from '@/components/MemoryDetailModal';
import PlantMemory from '@/components/PlantMemory';
import AskTheGarden from '@/components/AskTheGarden';
import SettingsModal from '@/components/SettingsModal';
import LanternAtmosphere from '@/components/LanternAtmosphere';
import { Memory, GardenSettings } from '@/types/memory';
import {
  getAllMemories,
  saveMemory,
  deleteMemory,
  getSettings,
  saveSettings,
  DEFAULT_SETTINGS,
} from '@/lib/storage';
import { checkOllamaStatus, OllamaStatus, generateLocalFallbackPortrait } from '@/lib/ollama';
import {
  Sparkles,
  Search,
  PlusCircle,
  Flame,
  Grid,
  Clock,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'garden' | 'plant' | 'ask' | 'settings'>('garden');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [settings, setSettings] = useState<GardenSettings>(DEFAULT_SETTINGS);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'ofrenda'>('grid');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Load initial memories and settings
  const loadData = async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
    const loadedMemories = await getAllMemories();
    setMemories(loadedMemories);

    // Check Ollama status
    const status = await checkOllamaStatus(loadedSettings.ollamaHost);
    setOllamaStatus(status);
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshOllama = async () => {
    const status = await checkOllamaStatus(settings.ollamaHost);
    setOllamaStatus(status);
  };

  const handleSaveSettings = async (newSettings: GardenSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
    const status = await checkOllamaStatus(newSettings.ollamaHost);
    setOllamaStatus(status);
  };

  // Memory creation callback
  const handleMemoryCreated = async (newMemory: Memory) => {
    await saveMemory(newMemory);
    const updated = await getAllMemories();
    setMemories(updated);
    setActiveTab('garden');
    setSelectedMemory(newMemory);
  };

  // Memory deletion
  const handleDeleteMemory = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the Garden?`)) {
      await deleteMemory(id);
      const updated = await getAllMemories();
      setMemories(updated);
      if (selectedMemory?.id === id) {
        setSelectedMemory(null);
      }
    }
  };

  // Regenerate portrait for a memory
  const handleRegeneratePortrait = async (memory: Memory) => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/ollama/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: memory.title,
          person: memory.person,
          relationship: memory.relationship,
          era: memory.era,
          place: memory.place,
          originalStory: memory.originalStory,
          host: settings.ollamaHost,
          model: settings.selectedModel,
          temperature: settings.temperature,
        }),
      });

      let updatedPortrait;
      if (response.ok) {
        const data = await response.json();
        updatedPortrait = data.portrait;
      } else {
        updatedPortrait = generateLocalFallbackPortrait(
          memory.title,
          memory.person,
          memory.relationship,
          memory.era,
          memory.place,
          memory.originalStory
        );
      }

      const updatedMem: Memory = {
        ...memory,
        portrait: updatedPortrait,
        updatedAt: new Date().toISOString(),
      };
      await saveMemory(updatedMem);
      const all = await getAllMemories();
      setMemories(all);
      setSelectedMemory(updatedMem);
    } catch {
      alert('Could not connect to model to regenerate portrait.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Extract all unique themes for filter
  const allThemes = useMemo(() => {
    const set = new Set<string>();
    memories.forEach((m) => {
      m.portrait?.themes?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [memories]);

  // Filter memories
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchesSearch =
        searchQuery === '' ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.person.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.place.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.era.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.originalStory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.portrait?.themes || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.portrait?.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTheme =
        selectedTheme === 'all' || (m.portrait?.themes || []).includes(selectedTheme);

      return matchesSearch && matchesTheme;
    });
  }, [memories, searchQuery, selectedTheme]);

  // Featured memory (first demo or latest with portrait)
  const featuredMemory = useMemo(() => {
    return memories.find((m) => m.portrait?.remembrance) || memories[0];
  }, [memories]);

  return (
    <div className="min-h-screen bg-charcoal-950 text-charcoal-100 flex flex-col font-sans relative selection:bg-amber-500/30 selection:text-amber-200">
      <LanternAtmosphere />

      {/* Main App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memoryCount={memories.length}
        ollamaStatus={ollamaStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 relative z-10">
        {activeTab === 'garden' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero / Garden Inscription */}
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono uppercase tracking-widest mb-3">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>The Sanctuary of Preserved Lives</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-gradient-gold tracking-tight mb-3">
                Where Memory Outlasts Time
              </h2>
              <p className="text-sm sm:text-base text-charcoal-300 font-serif leading-relaxed">
                Welcome to your private memory garden. Every story planted here is preserved in local storage and illuminated by open-weight AI.
              </p>
            </div>

            {/* Featured Remembrance Sanctuary Card (if available) */}
            {featuredMemory && featuredMemory.portrait?.remembrance && (
              <div
                onClick={() => setSelectedMemory(featuredMemory)}
                className="cursor-pointer mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/20 via-charcoal-900/90 to-charcoal-850/90 border border-amber-500/30 hover:border-amber-400/60 shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
                        Featured Remembrance
                      </span>
                      <span className="text-xs text-charcoal-500 font-mono">
                        • {featuredMemory.person} ({featuredMemory.era})
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-100 group-hover:text-amber-200 transition-colors">
                      {featuredMemory.title}
                    </h3>

                    <blockquote className="text-sm sm:text-base font-serif italic text-amber-100/90 leading-relaxed border-l-2 border-amber-500/40 pl-4 py-1">
                      &ldquo;{featuredMemory.portrait.remembrance}&rdquo;
                    </blockquote>

                    <div className="flex flex-wrap gap-2 pt-1 text-xs text-charcoal-400">
                      <span>{featuredMemory.place}</span>
                      <span>•</span>
                      <span>{featuredMemory.relationship}</span>
                      {featuredMemory.portrait.themes.slice(0, 2).map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-charcoal-800 text-charcoal-300 border border-charcoal-700/60 text-[11px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 flex md:flex-col items-center justify-center space-x-2 md:space-x-0 md:space-y-2">
                    <button className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500/20 group-hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>View Full Portrait</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Garden Controls & Search Toolbar */}
            <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-charcoal-900/90 p-3 sm:p-4 rounded-2xl border border-charcoal-750">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search memories by loved one, town, era, food, story..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700/80 text-charcoal-100 placeholder-charcoal-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Theme Dropdown & View Mode Switcher */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {allThemes.length > 0 && (
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-charcoal-300 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All Themes ({allThemes.length})</option>
                    {allThemes.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex items-center space-x-1 bg-charcoal-800 p-1 rounded-xl border border-charcoal-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'text-charcoal-400 hover:text-charcoal-200'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === 'timeline'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'text-charcoal-400 hover:text-charcoal-200'
                    }`}
                    title="Timeline View"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('ofrenda')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === 'ofrenda'
                        ? 'bg-marigold-500/20 text-marigold-300'
                        : 'text-charcoal-400 hover:text-charcoal-200'
                    }`}
                    title="Ofrenda Altar View (Día de los Muertos)"
                  >
                    <Flame className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setActiveTab('plant')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-charcoal-950 font-bold text-xs transition-colors shrink-0 shadow-md shadow-amber-500/10"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Plant Memory</span>
                </button>
              </div>
            </div>

            {/* Empty State */}
            {filteredMemories.length === 0 ? (
              <div className="text-center py-20 px-4 rounded-3xl bg-charcoal-900/40 border border-charcoal-800">
                <Flame className="w-12 h-12 text-amber-500/40 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-serif font-bold text-charcoal-200 mb-2">
                  No Memories Found
                </h3>
                <p className="text-xs text-charcoal-400 max-w-md mx-auto mb-6">
                  {searchQuery
                    ? `No preserved stories match "${searchQuery}". Try clearing your search.`
                    : 'The garden has no planted memories yet. Plant your first memory to preserve a family story forever.'}
                </p>
                <button
                  onClick={() => setActiveTab('plant')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-charcoal-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                >
                  Plant a New Memory
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMemories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onSelect={(m) => setSelectedMemory(m)}
                    onDelete={handleDeleteMemory}
                  />
                ))}
              </div>
            ) : viewMode === 'timeline' ? (
              /* Timeline View */
              <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-charcoal-700 before:to-transparent">
                {filteredMemories.map((memory) => (
                  <div
                    key={memory.id}
                    onClick={() => setSelectedMemory(memory)}
                    className="relative cursor-pointer group"
                  >
                    {/* Glowing Candle node */}
                    <div className="absolute -left-6 sm:-left-10 top-4 w-4 h-4 rounded-full bg-charcoal-900 border-2 border-amber-400 group-hover:scale-125 group-hover:bg-amber-400 transition-all flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                    </div>

                    <div className="p-6 rounded-2xl bg-charcoal-850/80 border border-charcoal-750 group-hover:border-amber-500/40 transition-all">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-300 mb-1">
                        <span>{memory.era || 'Undated Era'}</span>
                        <span>•</span>
                        <span className="text-charcoal-400">{memory.place}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-charcoal-100 group-hover:text-amber-200 transition-colors">
                        {memory.title}
                      </h3>
                      <p className="text-xs text-charcoal-400 mt-2 line-clamp-2">
                        {memory.portrait?.summary || memory.originalStory}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Ofrenda Altar View (Día de los Muertos celebration) */
              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-marigold-950/20 via-charcoal-900 to-charcoal-950 border border-marigold-500/30">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <div className="flex items-center justify-center space-x-2 text-marigold-400 text-xs font-mono uppercase tracking-widest mb-2">
                    <Flame className="w-4 h-4 text-marigold-400 animate-flicker" />
                    <span>The Living Altar • Ofrenda</span>
                    <Flame className="w-4 h-4 text-marigold-400 animate-flicker" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gradient-gold">
                    Remembrance Tier
                  </h3>
                  <p className="text-xs text-charcoal-300 mt-1 font-serif">
                    Honoring those who came before with marigolds, candlelight, and their enduring testimony.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMemories.map((memory) => (
                    <div
                      key={memory.id}
                      onClick={() => setSelectedMemory(memory)}
                      className="cursor-pointer group relative p-6 rounded-2xl bg-charcoal-850/90 border border-marigold-500/20 hover:border-marigold-400/60 transition-all duration-300 hover:-translate-y-1.5 candle-glow"
                    >
                      {/* Candle flame indicator */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-8 h-8 rounded-full bg-marigold-500/20 border border-marigold-400/30 flex items-center justify-center text-marigold-300">
                          <Flame className="w-4 h-4 text-marigold-400 animate-flicker" />
                        </div>
                        <span className="text-[11px] font-mono text-charcoal-400">
                          {memory.era}
                        </span>
                      </div>

                      <h4 className="text-lg font-serif font-bold text-charcoal-100 group-hover:text-amber-200 transition-colors">
                        {memory.person}
                      </h4>
                      <div className="text-xs text-marigold-400/80 font-medium mb-3">
                        {memory.relationship} • {memory.place}
                      </div>

                      {memory.portrait?.remembrance ? (
                        <p className="text-xs italic font-serif text-amber-100/80 line-clamp-3">
                          &ldquo;{memory.portrait.remembrance}&rdquo;
                        </p>
                      ) : (
                        <p className="text-xs text-charcoal-400 line-clamp-3">
                          {memory.originalStory}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plant a Memory View */}
        {activeTab === 'plant' && (
          <PlantMemory
            onMemoryCreated={handleMemoryCreated}
            onCancel={() => setActiveTab('garden')}
            settings={settings}
          />
        )}

        {/* Ask the Garden View */}
        {activeTab === 'ask' && (
          <AskTheGarden
            memories={memories}
            settings={settings}
            onOpenMemory={(mem) => setSelectedMemory(mem)}
          />
        )}
      </main>

      {/* Selected Memory Detail Modal */}
      {selectedMemory && (
        <MemoryDetailModal
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
          onDelete={handleDeleteMemory}
          onRegeneratePortrait={handleRegeneratePortrait}
          isRegenerating={isRegenerating}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
          ollamaStatus={ollamaStatus}
          onRefreshOllama={refreshOllama}
          memories={memories}
          onReloadMemories={loadData}
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-charcoal-800/80 bg-charcoal-950/90 py-8 px-4 text-center text-xs text-charcoal-500 font-serif">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-charcoal-300">AFTERLIGHT</span>
            <span>—</span>
            <span>DEV Hacktoberfest Week 4: Ghost in the Machine</span>
          </div>
          <div>
            Built with Next.js, Tailwind CSS & Open-Weight AI (Gemma via Ollama). Licensed under MIT.
          </div>
        </div>
      </footer>
    </div>
  );
}
