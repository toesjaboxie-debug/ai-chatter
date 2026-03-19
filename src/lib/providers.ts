// AI Provider configurations with their available models

export interface Model {
  id: string
  name: string
  description?: string
  contextLength?: number
  pricing?: string
  ownedBy?: string
}

export interface Provider {
  id: string
  name: string
  description: string
  baseUrl: string
  models: Model[]
  requiresApiKey: boolean
  apiKeyPlaceholder: string
  apiKeyPrefix: string
  supportsModelListing: boolean
  modelsEndpoint?: string
}

// Static fallback models when API is unavailable
export const PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Official OpenAI API with GPT models',
    baseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-...',
    apiKeyPrefix: 'sk-',
    supportsModelListing: true,
    modelsEndpoint: '/models',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest flagship model', contextLength: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable', contextLength: 128000 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Previous generation', contextLength: 128000 },
      { id: 'gpt-4', name: 'GPT-4', description: 'Original GPT-4', contextLength: 8192 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', contextLength: 16385 },
      { id: 'o1-preview', name: 'O1 Preview', description: 'Advanced reasoning', contextLength: 128000 },
      { id: 'o1-mini', name: 'O1 Mini', description: 'Fast reasoning model', contextLength: 128000 },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 200+ models through one API',
    baseUrl: 'https://openrouter.ai/api/v1',
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-or-...',
    apiKeyPrefix: 'sk-or-',
    supportsModelListing: true,
    modelsEndpoint: '/models',
    models: [
      { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Via OpenRouter' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Via OpenRouter' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Latest Anthropic' },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'Most capable Claude' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Google\'s best' },
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', description: 'Largest open model' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', description: 'DeepSeek model' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'High-quality Chinese AI models',
    baseUrl: 'https://api.deepseek.com/v1',
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-...',
    apiKeyPrefix: 'sk-',
    supportsModelListing: true,
    modelsEndpoint: '/models',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'General purpose chat', contextLength: 64000 },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', description: 'Advanced reasoning', contextLength: 64000 },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude AI models',
    baseUrl: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-ant-...',
    apiKeyPrefix: 'sk-ant-',
    supportsModelListing: false, // Anthropic doesn't have a models endpoint
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Latest Claude', contextLength: 200000 },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful', contextLength: 200000 },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast and affordable', contextLength: 200000 },
    ],
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini models from Google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresApiKey: true,
    apiKeyPlaceholder: 'AIza...',
    apiKeyPrefix: 'AIza',
    supportsModelListing: true,
    modelsEndpoint: '/models',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable Gemini', contextLength: 1000000 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast Gemini', contextLength: 1000000 },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: 'Experimental', contextLength: 1000000 },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Open-weight AI models',
    baseUrl: 'https://api.mistral.ai/v1',
    requiresApiKey: true,
    apiKeyPlaceholder: '...',
    apiKeyPrefix: '',
    supportsModelListing: true,
    modelsEndpoint: '/models',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Flagship model', contextLength: 128000 },
      { id: 'mistral-small-latest', name: 'Mistral Small', description: 'Efficient model', contextLength: 128000 },
      { id: 'codestral-latest', name: 'Codestral', description: 'Code specialist', contextLength: 256000 },
      { id: 'pixtral-large-latest', name: 'Pixtral Large', description: 'Vision model', contextLength: 128000 },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference platform',
    baseUrl: 'https://api.groq.com/openai/v1',
    requiresApiKey: true,
    apiKeyPlaceholder: 'gsk_...',
    apiKeyPrefix: 'gsk_',
    supportsModelListing: true,
    modelsEndpoint: '/models',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Versatile open model', contextLength: 128000 },
      { id: 'llama-3.1-405b-reasoning', name: 'Llama 3.1 405B', description: 'Reasoning model', contextLength: 8192 },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Fast lightweight', contextLength: 128000 },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'MoE model', contextLength: 32768 },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google open model', contextLength: 8192 },
    ],
  },
  {
    id: 'xai',
    name: 'xAI',
    description: 'Grok AI from xAI',
    baseUrl: 'https://api.x.ai/v1',
    requiresApiKey: true,
    apiKeyPlaceholder: 'xai-...',
    apiKeyPrefix: 'xai-',
    supportsModelListing: true,
    modelsEndpoint: '/models',
    models: [
      { id: 'grok-beta', name: 'Grok Beta', description: 'xAI assistant', contextLength: 131072 },
      { id: 'grok-2-1212', name: 'Grok 2', description: 'Latest Grok', contextLength: 131072 },
      { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', description: 'Vision capable', contextLength: 32768 },
    ],
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Open-source model hosting',
    baseUrl: 'https://api.together.xyz/v1',
    requiresApiKey: true,
    apiKeyPlaceholder: '...',
    apiKeyPrefix: '',
    supportsModelListing: true,
    modelsEndpoint: '/models',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B', description: 'Latest Llama', contextLength: 131072 },
      { id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', name: 'Llama 3.1 405B', description: 'Largest Llama', contextLength: 131072 },
      { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', description: 'MoE model', contextLength: 32768 },
      { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B', description: 'Alibaba model', contextLength: 32768 },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', description: 'DeepSeek latest', contextLength: 131072 },
    ],
  },
  {
    id: 'poe',
    name: 'Poe.com',
    description: 'Access multiple AI bots through Poe',
    baseUrl: 'https://api.poe.com/bot',
    requiresApiKey: true,
    apiKeyPlaceholder: 'poe-...',
    apiKeyPrefix: '',
    supportsModelListing: true,
    modelsEndpoint: '/models', // We'll use our custom endpoint
    models: [
      { id: 'Claude-3.5-Sonnet', name: 'Claude 3.5 Sonnet', description: 'Latest Claude via Poe', ownedBy: 'Anthropic' },
      { id: 'Claude-3.5-Sonnet-Base', name: 'Claude 3.5 Sonnet Base', description: 'Claude base model', ownedBy: 'Anthropic' },
      { id: 'Claude-3-Opus', name: 'Claude 3 Opus', description: 'Most capable Claude', ownedBy: 'Anthropic' },
      { id: 'Claude-3-Haiku', name: 'Claude 3 Haiku', description: 'Fast Claude', ownedBy: 'Anthropic' },
      { id: 'GPT-4o', name: 'GPT-4o', description: 'Latest GPT via Poe', ownedBy: 'OpenAI' },
      { id: 'GPT-4o-mini', name: 'GPT-4o Mini', description: 'Affordable GPT', ownedBy: 'OpenAI' },
      { id: 'GPT-4-Turbo', name: 'GPT-4 Turbo', description: 'GPT-4 Turbo', ownedBy: 'OpenAI' },
      { id: 'o1-preview', name: 'O1 Preview', description: 'Reasoning model', ownedBy: 'OpenAI' },
      { id: 'o1-mini', name: 'O1 Mini', description: 'Fast reasoning', ownedBy: 'OpenAI' },
      { id: 'Gemini-1.5-Pro', name: 'Gemini 1.5 Pro', description: 'Google flagship', ownedBy: 'Google' },
      { id: 'Gemini-1.5-Pro-Experimental', name: 'Gemini 1.5 Pro Exp', description: 'Experimental', ownedBy: 'Google' },
      { id: 'Gemini-2.0-Flash', name: 'Gemini 2.0 Flash', description: 'Latest Gemini', ownedBy: 'Google' },
      { id: 'Llama-3.1-405B', name: 'Llama 3.1 405B', description: 'Largest Llama', ownedBy: 'Meta' },
      { id: 'Llama-3.1-70B', name: 'Llama 3.1 70B', description: 'Powerful Llama', ownedBy: 'Meta' },
      { id: 'Mistral-Large', name: 'Mistral Large', description: 'Mistral flagship', ownedBy: 'Mistral' },
      { id: 'Mistral-Small', name: 'Mistral Small', description: 'Efficient Mistral', ownedBy: 'Mistral' },
      { id: 'Codestral', name: 'Codestral', description: 'Code specialist', ownedBy: 'Mistral' },
      { id: 'DeepSeek-V3', name: 'DeepSeek V3', description: 'DeepSeek latest', ownedBy: 'DeepSeek' },
      { id: 'DeepSeek-R1', name: 'DeepSeek R1', description: 'Reasoning model', ownedBy: 'DeepSeek' },
      { id: 'Qwen-2.5-72B', name: 'Qwen 2.5 72B', description: 'Alibaba model', ownedBy: 'Alibaba' },
    ],
  },
]

export function getProviderById(id: string): Provider | undefined {
  return PROVIDERS.find(p => p.id === id)
}

export function getModelsForProvider(providerId: string): Model[] {
  const provider = getProviderById(providerId)
  return provider?.models || []
}
