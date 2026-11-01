import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const host = searchParams.get('host') || 'http://127.0.0.1:11434';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${host}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({
        available: false,
        host,
        models: [],
        gemmaModels: [],
        recommendedModel: 'gemma3:4b',
        error: `Ollama returned status ${res.status}: ${res.statusText}`,
      });
    }

    const data = await res.json();
    const modelNames: string[] = (data.models || []).map((m: { name?: string }) => m.name || '');

    // Check for Gemma models
    const gemmaModels = modelNames.filter((name) => name.toLowerCase().includes('gemma'));

    let recommended = 'gemma3:4b';
    if (gemmaModels.includes('gemma3:4b')) {
      recommended = 'gemma3:4b';
    } else if (gemmaModels.includes('gemma2:2b')) {
      recommended = 'gemma2:2b';
    } else if (gemmaModels.includes('gemma2:9b')) {
      recommended = 'gemma2:9b';
    } else if (gemmaModels.length > 0) {
      recommended = gemmaModels[0];
    } else if (modelNames.length > 0) {
      recommended = modelNames[0];
    }

    return NextResponse.json({
      available: true,
      host,
      models: modelNames,
      gemmaModels,
      recommendedModel: recommended,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      available: false,
      host,
      models: [],
      gemmaModels: [],
      recommendedModel: 'gemma3:4b',
      error: `Could not connect to Ollama at ${host}: ${message}`,
    });
  }
}
