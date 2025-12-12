// src/lib/deepseek.ts
export class DeepSeekClient {
  private apiKey: string;

  /**
   * @param apiKey Optional: pass your API key directly instead of using env variable
   */
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';

    if (!this.apiKey) {
      throw new Error(
        'OpenRouter API key missing. Pass it to the constructor or add OPENROUTER_API_KEY to .env.local'
      );
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
      model: options.model || 'gpt-4o-mini',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2048,
      stream: options.stream ?? false,
    };

    const response = await fetch('https://api.openrouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter Error:', error);
      throw new Error('OpenRouter API request failed: ' + error);
    }

    // Return raw Response for streaming, otherwise parsed JSON
    if (options.stream) {
      return response;
    }

    return response.json();
  }
}
