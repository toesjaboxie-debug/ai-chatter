// AI Provider configurations with their available models

export interface Model {
  id: string
  name: string
  description?: string
  contextLength?: number
  pricing?: string
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
}

export const PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Official OpenAI API with GPT models',
    baseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-...',
    apiKeyPrefix: 'sk-',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest flagship model', contextLength: 128000, pricing: '$5/1M input' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable', contextLength: 128000, pricing: '$0.15/1M input' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Previous generation', contextLength: 128000, pricing: '$10/1M input' },
      { id: 'gpt-4', name: 'GPT-4', description: 'Original GPT-4', contextLength: 8192, pricing: '$30/1M input' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', contextLength: 16385, pricing: '$0.50/1M input' },
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
    models: [
      { id: 'openai/gpt-4o', name: 'GPT-4o (OpenAI)', description: 'Via OpenRouter', pricing: '$5/1M' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (OpenAI)', description: 'Via OpenRouter', pricing: '$0.15/1M' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Latest Anthropic model', pricing: '$3/1M' },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'Most capable Claude', pricing: '$15/1M' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Google\'s best', pricing: '$2.5/1M' },
      { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', description: 'Fast Gemini', pricing: '$0.075/1M' },
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', description: 'Largest open model', pricing: '$3/1M' },
      { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: 'Powerful open model', pricing: '$0.52/1M' },
      { id: 'mistralai/mistral-large', name: 'Mistral Large', description: 'Mistral\'s flagship', pricing: '$2/1M' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', description: 'DeepSeek\'s chat model', pricing: '$0.14/1M' },
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', description: 'Alibaba\'s model', pricing: '$0.35/1M' },
      { id: 'x-ai/grok-beta', name: 'Grok Beta', description: 'xAI\'s assistant', pricing: '$5/1M' },
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
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'General purpose chat', contextLength: 64000, pricing: '$0.14/1M input' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', description: 'Advanced reasoning model', contextLength: 64000, pricing: '$0.55/1M input' },
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
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Latest Claude model', contextLength: 200000, pricing: '$3/1M input' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful Claude', contextLength: 200000, pricing: '$15/1M input' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast and affordable', contextLength: 200000, pricing: '$0.25/1M input' },
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
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable Gemini', contextLength: 1000000, pricing: '$1.25/1M input' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast Gemini model', contextLength: 1000000, pricing: '$0.075/1M input' },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: 'Experimental Gemini 2', contextLength: 1000000, pricing: 'Free' },
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
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Flagship model', contextLength: 128000, pricing: '$2/1M input' },
      { id: 'mistral-small-latest', name: 'Mistral Small', description: 'Efficient model', contextLength: 128000, pricing: '$0.2/1M input' },
      { id: 'codestral-latest', name: 'Codestral', description: 'Code specialist', contextLength: 256000, pricing: '$0.3/1M input' },
      { id: 'pixtral-large-latest', name: 'Pixtral Large', description: 'Vision model', contextLength: 128000, pricing: '$2/1M input' },
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
    models: [
      { id: 'grok-beta', name: 'Grok Beta', description: 'xAI assistant', contextLength: 131072 },
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
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B', description: 'Latest Llama', contextLength: 131072 },
      { id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', name: 'Llama 3.1 405B', description: 'Largest Llama', contextLength: 131072 },
      { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', description: 'MoE model', contextLength: 32768 },
      { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B', description: 'Alibaba model', contextLength: 32768 },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', description: 'DeepSeek latest', contextLength: 131072 },
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
