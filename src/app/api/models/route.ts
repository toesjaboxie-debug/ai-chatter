import { NextRequest, NextResponse } from "next/server";
import { PROVIDERS } from "@/lib/providers";

interface OpenAIModel {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('provider');
  const apiKey = searchParams.get('apiKey');

  if (!providerId) {
    return NextResponse.json({ error: "Provider ID is required" }, { status: 400 });
  }

  const provider = PROVIDERS.find(p => p.id === providerId);
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  // If provider doesn't support dynamic model listing, return static models
  if (!provider.supportsModelListing || !apiKey) {
    return NextResponse.json({
      models: provider.models,
      dynamic: false,
      message: !apiKey ? "API key required for dynamic model loading" : "Static model list"
    });
  }

  try {
    // Fetch models from provider API
    const models = await fetchModelsFromProvider(provider, apiKey);
    return NextResponse.json({
      models,
      dynamic: true,
      provider: provider.name
    });
  } catch (error) {
    console.error(`Failed to fetch models from ${provider.name}:`, error);
    // Return static fallback models
    return NextResponse.json({
      models: provider.models,
      dynamic: false,
      error: "Failed to fetch models from provider, using fallback list"
    });
  }
}

async function fetchModelsFromProvider(provider: typeof PROVIDERS[0], apiKey: string) {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
  };

  // Special handling for different providers
  switch (provider.id) {
    case 'openai': {
      const response = await fetch(`${provider.baseUrl}/models`, { headers });
      if (!response.ok) throw new Error('Failed to fetch OpenAI models');
      const data = await response.json();
      
      // Filter and format OpenAI models
      const chatModels = data.data
        .filter((model: OpenAIModel) => 
          model.id.includes('gpt') || 
          model.id.includes('o1') ||
          model.id.includes('chatgpt')
        )
        .filter((model: OpenAIModel) => 
          !model.id.includes('instruct') &&
          !model.id.includes('edit') &&
          !model.id.includes('insert')
        )
        .map((model: OpenAIModel) => ({
          id: model.id,
          name: formatModelName(model.id),
          description: model.owned_by || 'OpenAI',
          ownedBy: model.owned_by,
        }))
        .sort((a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id));
      
      return chatModels;
    }

    case 'openrouter': {
      const response = await fetch(`${provider.baseUrl}/models`, { headers });
      if (!response.ok) throw new Error('Failed to fetch OpenRouter models');
      const data = await response.json();
      
      return data.data.map((model: OpenRouterModel) => ({
        id: model.id,
        name: model.name || model.id.split('/').pop(),
        description: model.description || model.id.split('/')[0],
        contextLength: model.context_length,
        pricing: model.pricing?.prompt ? `$${model.pricing.prompt}/1M` : undefined,
      }));
    }

    case 'deepseek': {
      const response = await fetch(`${provider.baseUrl}/models`, { headers });
      if (!response.ok) throw new Error('Failed to fetch DeepSeek models');
      const data = await response.json();
      
      return data.data.map((model: OpenAIModel) => ({
        id: model.id,
        name: formatModelName(model.id),
        description: 'DeepSeek Model',
      }));
    }

    case 'google': {
      // Google AI has a different API structure
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      if (!response.ok) throw new Error('Failed to fetch Google models');
      const data = await response.json();
      
      return data.models
        .filter((model: { name: string }) => model.name.includes('gemini'))
        .map((model: { name: string; displayName?: string; description?: string }) => ({
          id: model.name.replace('models/', ''),
          name: model.displayName || model.name.replace('models/', ''),
          description: model.description || 'Google AI Model',
        }));
    }

    case 'mistral': {
      const response = await fetch(`${provider.baseUrl}/models`, { headers });
      if (!response.ok) throw new Error('Failed to fetch Mistral models');
      const data = await response.json();
      
      return data.data.map((model: OpenAIModel) => ({
        id: model.id,
        name: formatModelName(model.id),
        description: 'Mistral Model',
      }));
    }

    case 'groq': {
      const response = await fetch(`${provider.baseUrl}/models`, { headers });
      if (!response.ok) throw new Error('Failed to fetch Groq models');
      const data = await response.json();
      
      return data.data.map((model: OpenAIModel) => ({
        id: model.id,
        name: formatModelName(model.id),
        description: 'Groq Model',
      }));
    }

    case 'xai': {
      const response = await fetch(`${provider.baseUrl}/models`, { headers });
      if (!response.ok) throw new Error('Failed to fetch xAI models');
      const data = await response.json();
      
      return data.data.map((model: OpenAIModel) => ({
        id: model.id,
        name: formatModelName(model.id),
        description: 'xAI Model',
      }));
    }

    case 'together': {
      const response = await fetch(`${provider.baseUrl}/models`, { headers });
      if (!response.ok) throw new Error('Failed to fetch Together models');
      const data = await response.json();
      
      // Filter for chat/instruct models only
      return data.data
        .filter((model: OpenAIModel) => 
          model.id.toLowerCase().includes('instruct') ||
          model.id.toLowerCase().includes('chat')
        )
        .map((model: OpenAIModel) => ({
          id: model.id,
          name: model.id.split('/').pop()?.replace(/-/g, ' ') || model.id,
          description: model.id.split('/')[0] || 'Together Model',
        }));
    }

    case 'poe': {
      // Poe doesn't have a public model list API, return our curated list
      return provider.models;
    }

    default:
      return provider.models;
  }
}

function formatModelName(id: string): string {
  return id
    .replace(/-/g, ' ')
    .replace(/\./g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
}
