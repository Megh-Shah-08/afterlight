import { NextResponse } from 'next/server';
import { Memory } from '@/types/memory';

export async function POST(request: Request) {
  let host = 'http://127.0.0.1:11434';
  try {
    const body = await request.json();
    host = body.host || host;
    const {
      question,
      memories = [],
      model = 'gemma3:4b',
    } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question string is required' }, { status: 400 });
    }

    // Rank and select relevant memories based on keyword matching
    const queryTokens = question
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((t: string) => t.length > 2);

    const scoredMemories = (memories as Memory[]).map((mem) => {
      let score = 0;
      const fullText = `${mem.title} ${mem.person} ${mem.relationship} ${mem.era} ${mem.place} ${mem.originalStory} ${mem.portrait?.summary || ''} ${mem.portrait?.themes.join(' ') || ''} ${(mem.portrait?.people || []).join(' ')}`.toLowerCase();

      for (const token of queryTokens) {
        if (fullText.includes(token)) score += 2;
      }
      return { mem, score };
    });

    // Sort by relevance score
    scoredMemories.sort((a, b) => b.score - a.score);

    // Take top 4 relevant memories, or all if few
    const selected = scoredMemories.filter((sm) => sm.score > 0).slice(0, 4).map((sm) => sm.mem);
    const candidateMemories = selected.length > 0 ? selected : (memories as Memory[]).slice(0, 3);

    // Format context
    const contextBlocks = candidateMemories.map((m, idx) => {
      return `--- MEMORY ENTRY [${idx + 1}] ---
ID: ${m.id}
Title: ${m.title}
Person: ${m.person} (${m.relationship})
Era: ${m.era}
Place: ${m.place}
Summary: ${m.portrait?.summary || 'N/A'}
Original Story:
"""
${m.originalStory}
"""`;
    }).join('\n\n');

    const systemPrompt = `You are AFTERLIGHT's Memory Garden Scribe, an empathetic and strictly truthful AI archivist.
You are answering a family member's question based EXCLUSIVELY on the preserved stories in their garden.

STRICT GROUNDING RULES:
1. ONLY state facts that are explicitly mentioned or clearly evident in the provided memory entries.
2. If the user asks about a detail, person, year, or event that is NOT mentioned in the memories, you MUST state gently and clearly that this information is not recorded in the garden.
3. NEVER fabricate biographical details, dates, or pretend to speak in the first-person voice of a deceased person.
4. Conclude your answer by noting which memories provided the answer.`;

    const userPrompt = `PRESERVED MEMORY GARDEN CONTEXT:
${contextBlocks}

USER QUESTION:
"${question}"

Provide a truthful, warm, and grounded answer now.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const ollamaResponse = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: model,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
        options: {
          temperature: 0.2, // Low temperature for high factual precision
          top_p: 0.9,
        },
      }),
    });
    clearTimeout(timeout);

    if (!ollamaResponse.ok) {
      const errText = await ollamaResponse.text();
      return NextResponse.json(
        { error: `Ollama error ${ollamaResponse.status}: ${errText}` },
        { status: 502 }
      );
    }

    const data = await ollamaResponse.json();
    const answer = data.response || 'No response generated.';

    // Prepare sources citations
    const sources = candidateMemories.map((m) => ({
      memoryId: m.id,
      title: m.title,
      person: m.person,
      era: m.era,
      excerpt: m.originalStory.slice(0, 160) + '...',
    }));

    return NextResponse.json({
      answer,
      sources,
      isLiveInference: true,
      modelUsed: model,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    const isConnError = message.includes('fetch failed') || message.includes('ECONNREFUSED');
    return NextResponse.json(
      {
        error: isConnError
          ? `Could not connect to Ollama server at ${host}. Please ensure Ollama is running ('ollama run gemma3:4b').`
          : message,
      },
      { status: isConnError ? 503 : 500 }
    );
  }
}
