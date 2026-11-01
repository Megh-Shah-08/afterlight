import { MemoryPortrait, TimelineEntry } from '@/types/memory';

export interface OllamaStatus {
  available: boolean;
  host: string;
  models: string[];
  gemmaModels: string[];
  recommendedModel: string;
  error?: string;
}

export const RECOMMENDED_GEMMA_MODELS = [
  'gemma3:4b',
  'gemma2:2b',
  'gemma2:9b',
  'gemma:2b',
  'gemma:7b',
];

export async function checkOllamaStatus(customHost?: string): Promise<OllamaStatus> {
  const host = customHost || 'http://127.0.0.1:11434';
  try {
    const res = await fetch(`/api/ollama/status?host=${encodeURIComponent(host)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        available: false,
        host,
        models: [],
        gemmaModels: [],
        recommendedModel: 'gemma3:4b',
        error: data.error || `Ollama server responded with status ${res.status}`,
      };
    }
    return await res.json();
  } catch (err: unknown) {
    return {
      available: false,
      host,
      models: [],
      gemmaModels: [],
      recommendedModel: 'gemma3:4b',
      error: err instanceof Error ? err.message : 'Failed to reach Ollama endpoint',
    };
  }
}

// Fallback generator for demo / offline experience
export function generateLocalFallbackPortrait(
  title: string,
  person: string,
  relationship: string,
  era: string,
  place: string,
  story: string
): MemoryPortrait {
  // Extract simple keywords and sentences for realistic structured output when offline
  const sentences = story
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const peopleList: string[] = [];
  if (person) peopleList.push(`${person} (${relationship || 'Loved one'})`);
  
  const placesList: string[] = [];
  if (place) placesList.push(place);

  const timeline: TimelineEntry[] = [];
  if (era) {
    timeline.push({
      dateOrEra: era,
      event: `The era of memory: ${title || 'Preserved story'}`,
    });
  }

  // Derive themes from story content
  const themes: string[] = [];
  const lower = story.toLowerCase();
  if (lower.includes('food') || lower.includes('cook') || lower.includes('bread') || lower.includes('kitchen') || lower.includes('recipe')) {
    themes.push('Culinary Heritage & Food');
  }
  if (lower.includes('music') || lower.includes('song') || lower.includes('sing') || lower.includes('radio')) {
    themes.push('Music & Acoustic Memory');
  }
  if (lower.includes('work') || lower.includes('job') || lower.includes('hands') || lower.includes('craft')) {
    themes.push('Craftsmanship & Labor');
  }
  if (lower.includes('sea') || lower.includes('island') || lower.includes('garden') || lower.includes('rain') || lower.includes('storm')) {
    themes.push('Nature & Environment');
  }
  if (themes.length === 0) {
    themes.push('Family Lore', 'Personal History');
  }

  const tags = [
    relationship ? relationship.toLowerCase().replace(/\s+/g, '-') : 'family',
    place ? place.split(',')[0].toLowerCase().trim().replace(/\s+/g, '-') : 'home',
    ...themes.map((t) => t.split(' ')[0].toLowerCase()),
  ].filter(Boolean);

  const summary = sentences.slice(0, 2).join(' ') || `A preserved remembrance of ${person || 'a loved one'}.`;

  const remembrance = `In preserving the memory of ${person || 'those before us'}, we hold open a doorway to the moments that shaped us. Their presence endures through the stories we refuse to let slip into silence.`;

  return {
    suggestedTitle: title || `Remembrance of ${person || 'A Loved One'}`,
    summary,
    remembrance,
    rewrittenNarrative: story,
    people: peopleList,
    places: placesList,
    events: [`Preservation of ${title || 'this memory'}`],
    timeline,
    themes,
    tags: Array.from(new Set(tags)),
    followUpQuestions: [
      `What was ${person || 'their'} favorite phrase or saying that people still repeat?`,
      `Are there photographs or heirlooms connected to ${place || 'this place'}?`,
      `How has this memory influenced your own perspective on family traditions?`,
    ],
    modelUsed: 'Offline Fallback Engine (Install Ollama for Live Gemma Inference)',
    generatedAt: new Date().toISOString(),
    status: 'completed',
  };
}
