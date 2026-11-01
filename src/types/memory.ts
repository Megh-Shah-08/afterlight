export interface TimelineEntry {
  dateOrEra: string;
  event: string;
}

export interface MemoryPortrait {
  suggestedTitle: string;
  summary: string;
  remembrance: string;
  rewrittenNarrative: string;
  people: string[];
  places: string[];
  events: string[];
  timeline: TimelineEntry[];
  themes: string[];
  tags: string[];
  followUpQuestions: string[];
  modelUsed: string;
  generatedAt: string;
  status: 'completed' | 'pending' | 'failed';
  error?: string;
}

export interface Memory {
  id: string;
  title: string;
  person: string;
  relationship: string;
  era: string;
  place: string;
  originalStory: string;
  audioBlobUrl?: string;
  audioDuration?: number;
  portrait?: MemoryPortrait;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GardenSettings {
  ollamaHost: string;
  selectedModel: string;
  temperature: number;
  allowLocalFallback: boolean;
}

export interface AskMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: {
    memoryId: string;
    title: string;
    person: string;
    era: string;
    excerpt: string;
  }[];
  isLiveInference?: boolean;
}
