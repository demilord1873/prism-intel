// src/lib/deepseek.ts
export class DeepSeekClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('DeepSeek API key missing. Add DEEPSEEK_API_KEY to .env.local');
    }
  }

  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<Response | any> {
    const payload = {
      model: options.model || 'deepseek-chat',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2048,
      stream: options.stream ?? false,
    };

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek Error:', error);
      throw new Error('DeepSeek API request failed: ' + error);
    }

    // If caller requested a stream, return the raw Response so the server route
    // can forward the streaming body to the client. Otherwise return parsed JSON.
    if (options.stream) {
      return response;
    }

    return response.json();
  }
}
