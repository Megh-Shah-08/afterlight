'use client';

import React, { useState } from 'react';
import { Memory, AskMessage, GardenSettings } from '@/types/memory';
import {
  MessageSquareQuote,
  Send,
  Sparkles,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { DEMO_ASK_SUGGESTIONS, DEMO_PRECOMPUTED_ANSWERS } from '@/lib/demoData';

interface AskTheGardenProps {
  memories: Memory[];
  settings: GardenSettings;
  onOpenMemory: (memory: Memory) => void;
}

export default function AskTheGarden({
  memories,
  settings,
  onOpenMemory,
}: AskTheGardenProps) {
  const [messages, setMessages] = useState<AskMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome to Ask the Garden. I am your memory synthesis archivist running on Gemma. Ask any question about the loved ones, traditions, places, or moments preserved here. Every answer is grounded strictly in your preserved stories—never fabricated.',
      timestamp: new Date().toISOString(),
      isLiveInference: false,
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    const userMsg: AskMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    // First check if this matches our curated demo questions
    if (DEMO_PRECOMPUTED_ANSWERS[q]) {
      setTimeout(() => {
        const demoResp = DEMO_PRECOMPUTED_ANSWERS[q];
        const aiMsg: AskMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: demoResp.answer,
          sources: demoResp.sources,
          timestamp: new Date().toISOString(),
          isLiveInference: false,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsLoading(false);
      }, 700);
      return;
    }

    // Otherwise, query live Ollama Gemma model via /api/ollama/ask
    try {
      const response = await fetch('/api/ollama/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          memories,
          host: settings.ollamaHost,
          model: settings.selectedModel,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: AskMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
          timestamp: new Date().toISOString(),
          isLiveInference: true,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Fallback local search if Ollama is unavailable
        const queryTokens = q.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
        const matching = memories.filter((m) => {
          const text = `${m.title} ${m.person} ${m.era} ${m.place} ${m.originalStory}`.toLowerCase();
          return queryTokens.some((t) => text.includes(t));
        });

        if (matching.length > 0) {
          const aiMsg: AskMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: `I found ${matching.length} relevant memory entry in your garden mentioning "${q}":\n\n${matching
              .map((m) => `• **${m.title}** (${m.person}, ${m.era}): ${m.portrait?.summary || m.originalStory.slice(0, 180) + '...'}`)
              .join('\n\n')}\n\n*(Note: Running in offline search mode. Connect Ollama with Gemma for conversational narrative synthesis).*`,
            sources: matching.map((m) => ({
              memoryId: m.id,
              title: m.title,
              person: m.person,
              era: m.era,
              excerpt: m.originalStory.slice(0, 140) + '...',
            })),
            timestamp: new Date().toISOString(),
            isLiveInference: false,
          };
          setMessages((prev) => [...prev, aiMsg]);
        } else {
          const aiMsg: AskMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: `I searched the preserved stories in your garden, but could not find any recorded memories matching "${q}". The garden only reflects what has been written or spoken—it never invents answers. You can preserve this memory by clicking "Plant a Memory".`,
            timestamp: new Date().toISOString(),
            isLiveInference: false,
          };
          setMessages((prev) => [...prev, aiMsg]);
        }
      }
    } catch {
      const aiMsg: AskMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `Could not reach the local Gemma model. Please ensure Ollama is running at ${settings.ollamaHost} or try one of the curated demo questions below.`,
        timestamp: new Date().toISOString(),
        isLiveInference: false,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const findMemoryById = (id: string) => {
    return memories.find((m) => m.id === id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-charcoal-850 via-charcoal-900 to-charcoal-850 border border-charcoal-750">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
          <MessageSquareQuote className="w-4 h-4 text-amber-400" />
          <span>Grounded Conversational Archive</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-100 mb-2">
          Ask the Garden
        </h2>
        <p className="text-sm text-charcoal-300 font-serif leading-relaxed">
          Ask questions across your entire preserved family history. Gemma retrieves and synthesizes answers
          grounded strictly in the authentic stories you have planted.
        </p>

        {/* Suggestion Chips */}
        <div className="mt-5 pt-4 border-t border-charcoal-800">
          <div className="flex items-center space-x-1.5 text-xs text-charcoal-400 font-medium mb-2.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Try asking:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEMO_ASK_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(suggestion)}
                className="text-left text-xs px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-200 hover:text-amber-300 border border-charcoal-700/80 transition-colors"
              >
                &ldquo;{suggestion}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="space-y-4 mb-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-5 rounded-2xl border transition-all ${
              msg.role === 'user'
                ? 'bg-charcoal-800/90 border-charcoal-700 ml-8 text-charcoal-100'
                : 'bg-charcoal-900/90 border-charcoal-750 mr-4 text-charcoal-200'
            }`}
          >
            {/* Header info */}
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center space-x-1.5 font-medium">
                {msg.role === 'assistant' ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300">Gemma Memory Scribe</span>
                    {msg.isLiveInference ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Live Inference
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-charcoal-800 text-charcoal-400 border border-charcoal-700">
                        Curated / Grounded
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-charcoal-300 font-serif">You asked:</span>
                )}
              </div>
              <span className="text-[11px] font-mono text-charcoal-500">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Content */}
            <div className="text-sm font-serif leading-relaxed whitespace-pre-wrap">
              {msg.content}
            </div>

            {/* Source Memory Citations */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-charcoal-800/80">
                <div className="text-xs font-mono uppercase tracking-wider text-charcoal-400 mb-2 flex items-center space-x-1">
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  <span>Grounding Sources:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {msg.sources.map((src, i) => {
                    const fullMem = findMemoryById(src.memoryId);
                    return (
                      <div
                        key={i}
                        onClick={() => fullMem && onOpenMemory(fullMem)}
                        className="cursor-pointer p-2.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 hover:border-amber-500/30 transition-all text-xs group"
                      >
                        <div className="font-semibold text-amber-300 group-hover:text-amber-200">
                          {src.title}
                        </div>
                        <div className="text-[11px] text-charcoal-400">
                          {src.person} • {src.era}
                        </div>
                        <p className="text-[11px] text-charcoal-500 italic mt-1 line-clamp-2">
                          &ldquo;{src.excerpt}&rdquo;
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-750 mr-4 flex items-center space-x-3 text-xs text-amber-300">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Consulting preserved memories with Gemma...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(inputQuestion);
        }}
        className="relative"
      >
        <div className="flex items-center space-x-2 bg-charcoal-900 border border-charcoal-750 focus-within:border-amber-400 rounded-2xl p-2 pl-4 transition-colors shadow-lg">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask anything about preserved loved ones, recipes, places, songs..."
            className="flex-1 bg-transparent text-sm text-charcoal-100 placeholder-charcoal-500 focus:outline-none font-serif"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
