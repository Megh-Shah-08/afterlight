'use client';

import React, { useState, useRef } from 'react';
import { Memory, GardenSettings } from '@/types/memory';
import {
  Sparkles,
  ShieldCheck,
  Mic,
  Square,
  RotateCcw,
  Calendar,
  MapPin,
  User,
  Heart,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateLocalFallbackPortrait } from '@/lib/ollama';

interface PlantMemoryProps {
  onMemoryCreated: (memory: Memory) => void;
  onCancel: () => void;
  settings: GardenSettings;
}

export default function PlantMemory({
  onMemoryCreated,
  onCancel,
  settings,
}: PlantMemoryProps) {
  const [title, setTitle] = useState('');
  const [person, setPerson] = useState('');
  const [relationship, setRelationship] = useState('');
  const [era, setEra] = useState('');
  const [place, setPlace] = useState('');
  const [story, setStory] = useState('');

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Submission / AI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioUrl(base64data);
        };
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setErrorNotice('Microphone access was denied or is unavailable on this device.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioDuration(recordingSeconds);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const clearRecording = () => {
    setAudioUrl(null);
    setAudioDuration(0);
    setRecordingSeconds(0);
  };

  // Submit Handler
  const handleSaveMemory = async (withAI: boolean) => {
    if (!story.trim()) {
      setErrorNotice('Please write or transcribe a story before preserving.');
      return;
    }
    setErrorNotice(null);
    setIsProcessing(true);

    const memoryId = `memory-${Date.now()}`;
    const cleanTitle = title.trim() || `Remembrance of ${person || 'A Loved One'}`;
    const timestamp = new Date().toISOString();

    const baseMemory: Memory = {
      id: memoryId,
      title: cleanTitle,
      person: person.trim() || 'Loved One',
      relationship: relationship.trim() || 'Family',
      era: era.trim() || 'Undated',
      place: place.trim() || 'Unspecified',
      originalStory: story.trim(),
      audioBlobUrl: audioUrl || undefined,
      audioDuration: audioDuration || undefined,
      isDemo: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (!withAI) {
      // Save directly without AI portrait
      onMemoryCreated(baseMemory);
      triggerConfetti();
      return;
    }

    // Call Gemma via Ollama API
    setProcessingStatus('Connecting to Gemma open-weight model...');
    try {
      const response = await fetch('/api/ollama/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cleanTitle,
          person: baseMemory.person,
          relationship: baseMemory.relationship,
          era: baseMemory.era,
          place: baseMemory.place,
          originalStory: baseMemory.originalStory,
          host: settings.ollamaHost,
          model: settings.selectedModel,
          temperature: settings.temperature,
        }),
      });

      if (response.ok) {
        setProcessingStatus('Formatting structured remembrance portrait...');
        const data = await response.json();
        baseMemory.portrait = data.portrait;
      } else {
        // Fallback gracefully if Ollama is not running
        if (settings.allowLocalFallback) {
          setProcessingStatus('Ollama is offline. Generating private local portrait...');
          baseMemory.portrait = generateLocalFallbackPortrait(
            cleanTitle,
            baseMemory.person,
            baseMemory.relationship,
            baseMemory.era,
            baseMemory.place,
            baseMemory.originalStory
          );
        } else {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to communicate with Ollama');
        }
      }
    } catch (err: unknown) {
      if (settings.allowLocalFallback) {
        baseMemory.portrait = generateLocalFallbackPortrait(
          cleanTitle,
          baseMemory.person,
          baseMemory.relationship,
          baseMemory.era,
          baseMemory.place,
          baseMemory.originalStory
        );
      } else {
        setErrorNotice(err instanceof Error ? err.message : 'AI generation failed');
        setIsProcessing(false);
        return;
      }
    }

    triggerConfetti();
    setIsProcessing(false);
    onMemoryCreated(baseMemory);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fb923c', '#ea580c', '#fde047'],
      });
    } catch {}
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Introduction Card */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-charcoal-850 via-charcoal-900 to-charcoal-850 border border-charcoal-750">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-marigold-400 mb-2">
          <Heart className="w-4 h-4 text-marigold-500 fill-marigold-500/20" />
          <span>Planting a Memory in the Garden</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-100 mb-2">
          Preserve a Loved One&apos;s Story
        </h2>
        <p className="text-sm text-charcoal-300 font-serif leading-relaxed">
          Record a personal story, an authentic recipe, a phrase they repeated, or a quiet moment from the past.
          Your story is first permanently archived in your browser&apos;s private storage, then structured into an enduring portrait using Gemma.
        </p>

        {/* Privacy Promise */}
        <div className="mt-4 pt-4 border-t border-charcoal-800 flex items-center space-x-2 text-xs text-charcoal-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Zero-Cloud Privacy:</strong> Stories are saved locally in your browser. All AI processing runs through your local Ollama instance on your machine.
          </span>
        </div>
      </div>

      {errorNotice && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Main Guided Form */}
      <div className="space-y-6 bg-charcoal-900/90 p-6 sm:p-8 rounded-2xl border border-charcoal-750">
        {/* Step 1: Who & Where */}
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-3 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[11px] font-bold">
              1
            </span>
            <span>Who and When</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1.5 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Person&apos;s Name</span>
              </label>
              <input
                type="text"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="e.g. Abuela Elena, Grandpa Arthur, Mary"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-charcoal-100 placeholder-charcoal-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1.5">
                Relationship
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Maternal Grandmother, Childhood Friend, Father"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-charcoal-100 placeholder-charcoal-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1.5 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Approximate Date or Era</span>
              </label>
              <input
                type="text"
                value={era}
                onChange={(e) => setEra(e.target.value)}
                placeholder="e.g. Winter 1974, Late 1980s, August 1991"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-charcoal-100 placeholder-charcoal-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1.5 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Place / Location</span>
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="e.g. Manchester, England or Oaxaca, Mexico"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-charcoal-100 placeholder-charcoal-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Step 2: The Title & Story */}
        <div className="pt-4 border-t border-charcoal-800">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-3 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[11px] font-bold">
              2
            </span>
            <span>The Memory & Story</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1.5">
                Memory Title (Optional — Gemma can suggest one)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Attic Shortwave Radio or Anise Bread at Dawn"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-charcoal-100 placeholder-charcoal-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-charcoal-300">
                  Write the Story in Your Own Words
                </label>
                <span className="text-[11px] font-mono text-charcoal-500">
                  {story.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={8}
                placeholder="Describe what happened, sensory details (smells, sounds, colors), what they said, and how it felt. Write freely—every detail is a gift for future generations..."
                className="w-full px-4 py-3 rounded-xl bg-charcoal-800 border border-charcoal-700 text-charcoal-100 placeholder-charcoal-500 text-sm font-serif leading-relaxed focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Optional Voice Recording Section */}
        <div className="pt-4 border-t border-charcoal-800">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-mono uppercase tracking-widest text-marigold-400 flex items-center space-x-1.5">
              <Mic className="w-3.5 h-3.5" />
              <span>Preserve Their Voice or Oral Memo (Optional)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-charcoal-850/60 border border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-marigold-600/20 hover:bg-marigold-600/30 text-marigold-300 border border-marigold-500/40 text-xs font-medium transition-colors"
                >
                  <Mic className="w-4 h-4 text-marigold-400" />
                  <span>Record Voice Note</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Recording ({formatSeconds(recordingSeconds)})</span>
                </button>
              )}

              {audioUrl && !isRecording && (
                <div className="flex items-center space-x-2">
                  <audio src={audioUrl} controls className="h-9 w-48 sm:w-60" />
                  <button
                    type="button"
                    onClick={clearRecording}
                    className="p-2 rounded-lg text-charcoal-400 hover:text-rose-400 hover:bg-charcoal-800 transition-colors"
                    title="Delete recording"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="text-[11px] text-charcoal-500 text-right w-full sm:w-auto">
              {audioUrl ? 'Voice note attached to memory' : 'Attach voice memo via microphone'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800 transition-colors"
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSaveMemory(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 border border-charcoal-700 transition-colors"
            >
              Save Raw Story Only
            </button>

            <button
              type="button"
              onClick={() => handleSaveMemory(true)}
              disabled={isProcessing}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-medium bg-gradient-to-r from-amber-500 via-marigold-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-charcoal-950 font-bold transition-all shadow-lg shadow-amber-500/20 candle-glow disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-charcoal-950" />
              <span>Plant & Generate Gemma Portrait</span>
            </button>
          </div>
        </div>

        {/* Live Processing Indicator */}
        {isProcessing && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <div>
              <div className="font-semibold text-amber-300">Gemma Open-Weight Inference Active</div>
              <div className="text-[11px] text-amber-200/80">{processingStatus}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
