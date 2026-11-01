import { Memory, GardenSettings } from '@/types/memory';
import { INITIAL_DEMO_MEMORIES } from './demoData';

const DB_NAME = 'afterlight_memory_garden';
const DB_VERSION = 1;
const MEMORIES_STORE = 'memories';
const SETTINGS_STORE = 'settings';

export const DEFAULT_SETTINGS: GardenSettings = {
  ollamaHost: 'http://127.0.0.1:11434',
  selectedModel: 'gemma3:4b',
  temperature: 0.3,
  allowLocalFallback: true,
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(MEMORIES_STORE)) {
        db.createObjectStore(MEMORIES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllMemories(): Promise<Memory[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEMORIES_STORE, 'readonly');
      const store = tx.objectStore(MEMORIES_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const results: Memory[] = req.result || [];
        if (results.length === 0) {
          // Initialize with demo memories if store is empty
          seedDemoMemories()
            .then((seeded) => resolve(seeded))
            .catch(() => resolve(INITIAL_DEMO_MEMORIES));
        } else {
          // Sort by creation date descending
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          resolve(results);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    // LocalStorage fallback for SSR or unsupported IndexedDB
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('afterlight_memories');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return INITIAL_DEMO_MEMORIES;
  }
}

export async function seedDemoMemories(): Promise<Memory[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMORIES_STORE, 'readwrite');
    const store = tx.objectStore(MEMORIES_STORE);

    INITIAL_DEMO_MEMORIES.forEach((memory) => {
      store.put(memory);
    });

    tx.oncomplete = () => resolve(INITIAL_DEMO_MEMORIES);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMemoryById(id: string): Promise<Memory | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEMORIES_STORE, 'readonly');
      const store = tx.objectStore(MEMORIES_STORE);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = await getAllMemories();
    return list.find((m) => m.id === id) || null;
  }
}

export async function saveMemory(memory: Memory): Promise<Memory> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEMORIES_STORE, 'readwrite');
      const store = tx.objectStore(MEMORIES_STORE);
      const req = store.put(memory);

      req.onsuccess = () => {
        // Also sync to localStorage as a safety copy
        if (typeof window !== 'undefined') {
          getAllMemories().then((all) => {
            try {
              localStorage.setItem('afterlight_memories', JSON.stringify(all));
            } catch {}
          });
        }
        resolve(memory);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Failed to save memory to IndexedDB', error);
    return memory;
  }
}

export async function deleteMemory(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMORIES_STORE, 'readwrite');
    const store = tx.objectStore(MEMORIES_STORE);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllMemories(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMORIES_STORE, 'readwrite');
    const store = tx.objectStore(MEMORIES_STORE);
    const req = store.clear();

    req.onsuccess = () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('afterlight_memories');
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getSettings(): Promise<GardenSettings> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SETTINGS_STORE, 'readonly');
      const store = tx.objectStore(SETTINGS_STORE);
      const req = store.get('garden_settings');

      req.onsuccess = () => {
        if (req.result && req.result.value) {
          resolve({ ...DEFAULT_SETTINGS, ...req.result.value });
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      };
      req.onerror = () => resolve(DEFAULT_SETTINGS);
    });
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: GardenSettings): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE, 'readwrite');
      const store = tx.objectStore(SETTINGS_STORE);
      const req = store.put({ key: 'garden_settings', value: settings });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// Export utilities
export function exportMemoryAsMarkdown(memory: Memory): string {
  const portrait = memory.portrait;
  const frontmatter = [
    '---',
    `title: "${memory.title.replace(/"/g, '\\"')}"`,
    `person: "${memory.person.replace(/"/g, '\\"')}"`,
    `relationship: "${memory.relationship.replace(/"/g, '\\"')}"`,
    `era: "${memory.era.replace(/"/g, '\\"')}"`,
    `place: "${memory.place.replace(/"/g, '\\"')}"`,
    `created_at: "${memory.createdAt}"`,
    `model_used: "${portrait?.modelUsed || 'None'}"`,
    `tags: [${(portrait?.tags || []).map((t) => `"${t}"`).join(', ')}]`,
    '---',
    '',
    '# ' + memory.title,
    '',
    `**In Memory Of:** ${memory.person} (${memory.relationship})  `,
    `**Era:** ${memory.era}  `,
    `**Place:** ${memory.place}  `,
    '',
    '---',
    '',
    '## Original Preserved Story',
    '',
    memory.originalStory,
    '',
  ];

  if (portrait) {
    frontmatter.push(
      '---',
      '',
      '## AI Memory Portrait',
      `*Generated via ${portrait.modelUsed} on ${new Date(portrait.generatedAt).toLocaleDateString()}*`,
      '',
      '### Summary',
      portrait.summary,
      '',
      '### Remembrance',
      `> "${portrait.remembrance}"`,
      '',
      '### Narrative Reconstruction',
      portrait.rewrittenNarrative,
      '',
      '### People Mentioned',
      ...portrait.people.map((p) => `- ${p}`),
      '',
      '### Places Mentioned',
      ...portrait.places.map((p) => `- ${p}`),
      '',
      '### Timeline of Events',
      ...portrait.timeline.map((t) => `- **${t.dateOrEra}:** ${t.event}`),
      '',
      '### Themes',
      ...portrait.themes.map((t) => `- ${t}`),
      '',
      '### Inquiry Prompts for Future Generations',
      ...portrait.followUpQuestions.map((q) => `- ${q}`),
      ''
    );
  }

  return frontmatter.join('\n');
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
