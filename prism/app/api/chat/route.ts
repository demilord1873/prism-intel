import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Faster streaming

export async function POST(request: NextRequest) {
  try {
    const { messages, model, temperature, max_tokens, stream } =
      await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages must be a non-empty array' },
        { status: 400 }
      );
    }

    // VALIDATE MODEL
    const openRouterModel = model || 'deepseek/deepseek-chat';

    // Build OpenRouter API payload
    const payload = {
      model: openRouterModel,
      messages,
      stream: stream ?? true,
      temperature: temperature ?? 0.7,
      max_tokens: max_tokens ?? 2048,
    };

    // Call OpenRouter API
    const ORresponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Prism Chatbot',
      },
      body: JSON.stringify(payload),
    });

    if (!ORresponse.ok) {
      const err = await ORresponse.text();
      console.error('OpenRouter error:', err);
      return NextResponse.json(
        { error: `OpenRouter API request failed: ${err}` },
        { status: ORresponse.status }
      );
    }

    // STREAMING MODE HANDLING
    if (payload.stream) {
      // Forward streaming response directly to client
      return new NextResponse(ORresponse.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no', // Disable buffering for Vercel/Edge
        },
      });
    }

    // FALLBACK: If not streaming, return JSON
    const json = await ORresponse.json();
    return NextResponse.json(json);

  } catch (error: any) {
    console.error('API /chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'OpenRouter Chat API Running',
    timestamp: new Date().toISOString(),
  });
}
