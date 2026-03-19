import { NextRequest } from "next/server";
import { PROVIDERS } from "@/lib/providers";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  apiKey: string;
  providerId: string;
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
}

async function streamOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  providerId: string
) {
  const encoder = new TextEncoder();
  
  // Build headers based on provider
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  // Add provider-specific headers
  if (providerId === 'openrouter') {
    headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    headers['X-Title'] = 'AI Chatter';
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API request failed with status ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const stream = new ReadableStream({
    async controller() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Special handler for Anthropic (different API format)
async function streamAnthropic(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
) {
  const encoder = new TextEncoder();
  
  // Convert messages to Anthropic format
  const systemMessage = messages.find(m => m.role === 'system');
  const otherMessages = messages.filter(m => m.role !== 'system');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      messages: otherMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      system: systemMessage?.content,
      max_tokens: 4096,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Anthropic API request failed with status ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const stream = new ReadableStream({
    async controller() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: parsed.delta.text })}\n\n`));
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Special handler for Google Gemini
async function streamGoogle(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
) {
  const encoder = new TextEncoder();
  
  // Convert messages to Gemini format
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find(m => m.role === 'system');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction.content }] } : undefined,
        generationConfig: {
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Google API request failed with status ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const stream = new ReadableStream({
    async controller() {
      try {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += new TextDecoder().decode(value);
          
          // Try to parse JSON array chunks
          try {
            // Remove array brackets and parse individual objects
            const cleaned = buffer.replace(/\[|\]/g, '').trim();
            const objects = cleaned.split(/,(?=\s*\{)/);
            
            for (const obj of objects) {
              if (obj.trim()) {
                try {
                  const parsed = JSON.parse(obj.trim());
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
                  }
                } catch {
                  // Incomplete JSON, keep in buffer
                  buffer = obj;
                  continue;
                }
              }
            }
            buffer = '';
          } catch {
            // Keep trying
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Special handler for Poe.com
async function streamPoe(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
) {
  const encoder = new TextEncoder();
  
  // Poe API uses a different format
  // Get the last user message for the query
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMessage) {
    throw new Error('No user message found');
  }

  // Build conversation history for context
  const conversationHistory = messages.slice(0, -1).map(m => ({
    role: m.role,
    content: m.content,
  }));

  const response = await fetch('https://api.poe.com/bot/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      query: lastUserMessage.content,
      conversation_history: conversationHistory.length > 0 ? conversationHistory : undefined,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Poe API request failed with status ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const stream = new ReadableStream({
    async controller() {
      try {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += new TextDecoder().decode(value);
          
          // Try to parse SSE events
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }
              
              try {
                const parsed = JSON.parse(data);
                // Poe API response format
                const content = parsed.text || parsed.content || parsed.delta?.text;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // Try to handle raw text response
                if (data && data !== '[DONE]') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: data })}\n\n`));
                }
              }
            } else if (line.startsWith('event: ')) {
              // Handle event type
              continue;
            } else if (line.trim() && !line.startsWith(':')) {
              // Handle raw text response from Poe
              try {
                const parsed = JSON.parse(line);
                const content = parsed.text || parsed.content || parsed.response;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // Raw text
                if (line.trim()) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: line })}\n\n`));
                }
              }
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { apiKey, providerId, model, messages, stream = true } = body;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key is required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!providerId) {
      return new Response(JSON.stringify({ error: "Provider is required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!model) {
      return new Response(JSON.stringify({ error: "Model is required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const provider = PROVIDERS.find(p => p.id === providerId);
    if (!provider) {
      return new Response(JSON.stringify({ error: "Invalid provider" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle streaming based on provider
    if (stream) {
      switch (providerId) {
        case 'anthropic':
          return streamAnthropic(apiKey, model, messages);
        case 'google':
          return streamGoogle(apiKey, model, messages);
        case 'poe':
          return streamPoe(apiKey, model, messages);
        default:
          return streamOpenAICompatible(provider.baseUrl, apiKey, model, messages, providerId);
      }
    }

    // Non-streaming fallback
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    if (providerId === 'openrouter') {
      headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      headers['X-Title'] = 'AI Chatter';
    }

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error: error || `API request failed` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({
      message: data.choices[0]?.message?.content || "",
      usage: data.usage,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error("Chat API error:", error);
    
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message || "Failed to process chat request" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
