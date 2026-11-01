'use client';

import React, { useState } from 'react';
import { GardenSettings, Memory } from '@/types/memory';
import { OllamaStatus, RECOMMENDED_GEMMA_MODELS } from '@/lib/ollama';
import {
  X,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { downloadFile, seedDemoMemories, clearAllMemories } from '@/lib/storage';

interface SettingsModalProps {
  settings: GardenSettings;
  onSaveSettings: (settings: GardenSettings) => void;
  onClose: () => void;
  ollamaStatus: OllamaStatus | null;
  onRefreshOllama: () => void;
  memories: Memory[];
  onReloadMemories: () => void;
}

export default function SettingsModal({
  settings,
  onSaveSettings,
  onClose,
  ollamaStatus,
  onRefreshOllama,
  memories,
  onReloadMemories,
}: SettingsModalProps) {
  const [host, setHost] = useState(settings.ollamaHost);
  const [model, setModel] = useState(settings.selectedModel);
  const [temp, setTemp] = useState(settings.temperature);
  const [allowFallback, setAllowFallback] = useState(settings.allowLocalFallback);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleSave = () => {
    onSaveSettings({
      ollamaHost: host.trim(),
      selectedModel: model.trim(),
      temperature: temp,
      allowLocalFallback: allowFallback,
    });
    onClose();
  };

  const handleTestConnection = async () => {
    setIsChecking(true);
    await onRefreshOllama();
    setIsChecking(false);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Export full JSON archive
  const handleExportFullArchive = () => {
    const archiveData = {
      app: 'AFTERLIGHT Memory Garden',
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      totalMemories: memories.length,
      memories,
    };
    const jsonStr = JSON.stringify(archiveData, null, 2);
    downloadFile(jsonStr, `afterlight-archive-${Date.now()}.json`, 'application/json');
  };

  // Import JSON archive
  const handleImportArchive = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const importedList: Memory[] = Array.isArray(parsed) ? parsed : parsed.memories;
        if (Array.isArray(importedList)) {
          // Save each imported memory
          const { saveMemory } = await import('@/lib/storage');
          for (const m of importedList) {
            await saveMemory(m);
          }
          onReloadMemories();
          alert(`Successfully imported ${importedList.length} memories into the Garden!`);
        } else {
          alert('Invalid archive file format.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDemo = async () => {
    await seedDemoMemories();
    onReloadMemories();
    alert('Reset garden with 3 curated demo memories.');
  };

  const handleClearAll = async () => {
    await clearAllMemories();
    setConfirmClear(false);
    onReloadMemories();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-charcoal-900 border border-charcoal-750 shadow-2xl overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-800 bg-charcoal-950/70">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-mono uppercase tracking-widest text-charcoal-200">
              AI Engine & Garden Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-100 hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-charcoal-200">
          
          {/* Ollama Connection & Gemma Status */}
          <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    ollamaStatus?.available ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="font-semibold text-charcoal-100">
                  {ollamaStatus?.available ? 'Ollama Online' : 'Ollama Not Detected'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isChecking}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 border border-charcoal-700 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-amber-400' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>

            {ollamaStatus?.available ? (
              <div className="text-xs text-charcoal-300 space-y-1">
                <p>
                  Connected to Ollama at <code className="text-amber-300">{ollamaStatus.host}</code>.
                </p>
                <p>
                  Installed Gemma Models:{' '}
                  {ollamaStatus.gemmaModels.length > 0 ? (
                    <span className="text-emerald-400 font-mono">
                      {ollamaStatus.gemmaModels.join(', ')}
                    </span>
                  ) : (
                    <span className="text-amber-400 font-mono">
                      None detected (install gemma3:4b or gemma2:2b)
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <div className="text-xs text-charcoal-400 space-y-2">
                <p>
                  Ollama is not running locally. AFTERLIGHT will use its curated benchmark demo and local fallback engine so you can explore all features immediately.
                </p>
                <div className="p-3 rounded-lg bg-charcoal-900 border border-charcoal-800 text-[11px] font-mono text-amber-300/90 flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <Terminal className="w-3.5 h-3.5 text-charcoal-500 shrink-0" />
                    <span>ollama run gemma3:4b</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCommand('ollama run gemma3:4b')}
                    className="p-1 rounded hover:bg-charcoal-800 text-charcoal-400 hover:text-amber-300 transition-colors shrink-0"
                    title="Copy CLI command"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Model Configuration Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1">
                Ollama Host URL
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="http://127.0.0.1:11434"
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-charcoal-100 text-xs font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1">
                Target Gemma Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-charcoal-100 text-xs font-mono focus:outline-none focus:border-amber-400"
              >
                {RECOMMENDED_GEMMA_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m} {m === 'gemma3:4b' ? '(Preferred / Recommended)' : ''}
                  </option>
                ))}
                {ollamaStatus?.models &&
                  ollamaStatus.models
                    .filter((m) => !RECOMMENDED_GEMMA_MODELS.includes(m))
                    .map((m) => (
                      <option key={m} value={m}>
                        {m} (Installed)
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium text-charcoal-300 mb-1">
                <span>Inference Temperature</span>
                <span className="font-mono text-amber-300">{temp}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-charcoal-500 font-mono mt-0.5">
                <span>0.1 (Strictly Factual)</span>
                <span>0.8 (Creative Remembrance)</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2.5 text-xs text-charcoal-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowFallback}
                  onChange={(e) => setAllowFallback(e.target.checked)}
                  className="rounded bg-charcoal-800 border-charcoal-700 text-amber-500 focus:ring-0"
                />
                <span>Allow local fallback synthesis if Ollama is unreachable</span>
              </label>
            </div>
          </div>

          {/* Backup, Export & Restore */}
          <div className="pt-4 border-t border-charcoal-800 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-charcoal-400">
              Archive Backup & Portability
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportFullArchive}
                className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-200 border border-charcoal-700 text-xs font-medium transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export Full JSON Archive</span>
              </button>

              <label className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-200 border border-charcoal-700 text-xs font-medium cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Import JSON Archive</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportArchive}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset & Danger Zone */}
          <div className="pt-4 border-t border-charcoal-800 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-charcoal-400">
              Garden Management
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleResetToDemo}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-charcoal-300 border border-charcoal-750 text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restore Sample Memories</span>
              </button>

              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/20 text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All User Data</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                  >
                    Confirm Delete Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 rounded-lg bg-charcoal-800 text-charcoal-400 text-xs hover:text-charcoal-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-charcoal-800 bg-charcoal-950/80 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-charcoal-400 hover:text-charcoal-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-charcoal-950 transition-colors shadow-md shadow-amber-500/20"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
