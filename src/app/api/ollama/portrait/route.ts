import { NextResponse } from 'next/server';
import { MemoryPortrait } from '@/types/memory';

export async function POST(request: Request) {
  let host = 'http://127.0.0.1:11434';
  try {
    const body = await request.json();
    host = body.host || host;
    const {
      title,
      person,
      relationship,
      era,
      place,
      originalStory,
      model = 'gemma3:4b',
      temperature = 0.3,
    } = body;

    if (!originalStory || typeof originalStory !== 'string') {
      return NextResponse.json({ error: 'Original story text is required' }, { status: 400 });
    }

    const systemPrompt = `You are AFTERLIGHT's Memory Scribe, an open-weight AI archivist running on Gemma.
Your sacred purpose is to honor, structure, and preserve human family memories and oral histories.

STRICT INTEGRITY RULES:
1. NEVER invent dates, people, relationships, medical facts, or quotations not present or strongly implied in the user's story.
2. If any detail (like a specific year or surname) is unknown, leave it unknown. DO NOT guess.
3. Preserve the authentic emotion, regional expressions, and dignity of the person remembered.
4. You must output ONLY a valid JSON object matching the exact schema below, with no surrounding commentary or markdown codeblocks outside the JSON.

SCHEMA:
{
  "suggestedTitle": "A poetic, reverent, and evocative title for this memory",
  "summary": "A 2-3 sentence clear factual summary of what happened and who was involved",
  "remembrance": "A moving, beautifully crafted 2-4 sentence tribute passage honoring their legacy and character",
  "rewrittenNarrative": "A polished editorial version of the story written in respectful, evocative prose, preserving all authentic facts without embellishing or fabricating",
  "people": ["List of distinct people mentioned in the story with their relationship if known"],
  "places": ["List of specific towns, rooms, locations mentioned"],
  "events": ["List of notable occurrences or rituals mentioned"],
  "timeline": [
    { "dateOrEra": "The exact year, era, or season from the story", "event": "Brief description of the milestone or event" }
  ],
  "themes": ["3 to 5 core themes, e.g. Family Lore, Craftsmanship, Grief, Music, Resilience"],
  "tags": ["4 to 6 lowercase hyphenated tags, e.g. grandmother, baking, 1970s, garden"],
  "followUpQuestions": [
    "3 thoughtful, gentle inquiry questions to help family members uncover deeper details about this memory"
  ]
}`;

    const userPrompt = `ORIGINAL MEMORY METADATA:
- Working Title: ${title || 'Untitled'}
- Person Remembered: ${person || 'Unspecified'}
- Relationship: ${relationship || 'Unspecified'}
- Era / Time: ${era || 'Unspecified'}
- Place / Setting: ${place || 'Unspecified'}

ORIGINAL STORY:
"""
${originalStory}
"""

Extract and construct the structured Memory Portrait in valid JSON format now.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout for local models

    const ollamaResponse = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: model,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        format: 'json',
        stream: false,
        options: {
          temperature: Number(temperature) || 0.3,
          top_p: 0.9,
        },
      }),
    });
    clearTimeout(timeout);

    if (!ollamaResponse.ok) {
      const errText = await ollamaResponse.text();
      return NextResponse.json(
        { error: `Ollama returned error ${ollamaResponse.status}: ${errText}` },
        { status: 502 }
      );
    }

    const data = await ollamaResponse.json();
    const rawOutput = data.response || '';

    // Attempt to parse JSON safely
    let parsed: Partial<MemoryPortrait>;
    try {
      // Clean up common markdown block markers if present
      let cleanJson = rawOutput.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      parsed = JSON.parse(cleanJson);
    } catch {
      // Try regex extraction of outermost JSON object
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            {
              error: 'Model produced malformed JSON response',
              rawOutput,
            },
            { status: 422 }
          );
        }
      } else {
        return NextResponse.json(
          {
            error: 'Could not extract JSON from model output',
            rawOutput,
          },
          { status: 422 }
        );
      }
    }

    const portrait: MemoryPortrait = {
      suggestedTitle: parsed.suggestedTitle || title || 'Preserved Memory',
      summary: parsed.summary || 'A remembrance preserved in the garden.',
      remembrance: parsed.remembrance || 'Those who shaped us remain present in the stories we honor.',
      rewrittenNarrative: parsed.rewrittenNarrative || originalStory,
      people: Array.isArray(parsed.people) ? parsed.people : [person].filter(Boolean),
      places: Array.isArray(parsed.places) ? parsed.places : [place].filter(Boolean),
      events: Array.isArray(parsed.events) ? parsed.events : [],
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
      themes: Array.isArray(parsed.themes) ? parsed.themes : ['Family History'],
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['memory'],
      followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
      modelUsed: model,
      generatedAt: new Date().toISOString(),
      status: 'completed',
    };

    return NextResponse.json({ portrait, isLiveInference: true });
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
