'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Send, 
  Key, 
  Eye, 
  EyeOff, 
  Bot, 
  User, 
  Loader2, 
  Trash2, 
  Settings,
  MessageSquare,
  Sparkles,
  AlertCircle,
  LogOut,
  LogIn,
  UserPlus,
  Zap,
  ChevronDown,
  X,
  Menu,
  Check
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PROVIDERS, type Provider, type Model } from '@/lib/providers'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface User {
  id: string
  email: string
}

interface ApiKeys {
  [providerId: string]: string
}

export default function Home() {
  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authAction, setAuthAction] = useState<'login' | 'signup'>('login')
  
  // Provider and model state
  const [selectedProviderId, setSelectedProviderId] = useState('openai')
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [apiKeys, setApiKeys] = useState<ApiKeys>({})
  const [showApiKey, setShowApiKey] = useState(false)
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Get selected provider
  const selectedProvider = PROVIDERS.find(p => p.id === selectedProviderId) || PROVIDERS[0]
  
  // Load saved settings from localStorage
  useEffect(() => {
    const savedProvider = localStorage.getItem('selected_provider')
    const savedModel = localStorage.getItem('selected_model')
    const savedApiKeys = localStorage.getItem('api_keys')
    
    if (savedProvider) setSelectedProviderId(savedProvider)
    if (savedModel) setSelectedModel(savedModel)
    if (savedApiKeys) {
      try {
        setApiKeys(JSON.parse(savedApiKeys))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('selected_provider', selectedProviderId)
  }, [selectedProviderId])

  useEffect(() => {
    localStorage.setItem('selected_model', selectedModel)
  }, [selectedModel])

  useEffect(() => {
    localStorage.setItem('api_keys', JSON.stringify(apiKeys))
  }, [apiKeys])

  // Check auth status
  useEffect(() => {
    checkAuth()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // When provider changes, update the selected model
  useEffect(() => {
    const provider = PROVIDERS.find(p => p.id === selectedProviderId)
    if (provider && provider.models.length > 0) {
      setSelectedModel(provider.models[0].id)
    }
  }, [selectedProviderId])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth')
      const data = await response.json()
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!authEmail || !authPassword) {
      toast({
        title: 'Error',
        description: 'Please enter email and password',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authAction,
          email: authEmail,
          password: authPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      if (authAction === 'signup') {
        toast({
          title: 'Account Created',
          description: data.message || 'Check your email to confirm your account',
        })
      } else {
        setUser(data.user)
        setAuthDialogOpen(false)
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${data.user.email}`,
        })
      }
      
      setAuthEmail('')
      setAuthPassword('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Authentication failed',
        variant: 'destructive',
      })
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      })
      setUser(null)
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      })
    }
  }

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return
    
    const currentApiKey = apiKeys[selectedProviderId]
    if (!currentApiKey?.trim()) {
      toast({
        title: 'API Key Required',
        description: `Please enter your ${selectedProvider.name} API key in the settings panel.`,
        variant: 'destructive',
      })
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: currentApiKey,
          providerId: selectedProviderId,
          model: selectedModel,
          messages: [
            ...messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            {
              role: 'user',
              content: userMessage.content,
            },
          ],
          stream: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get response')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                fullContent += parsed.content
                setMessages(prev => prev.map(m => 
                  m.id === assistantMessage.id 
                    ? { ...m, content: fullContent }
                    : m
                ))
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantMessage.id 
          ? { ...m, isStreaming: false }
          : m
      ))

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
      // Remove both messages if the API call failed
      setMessages(prev => prev.filter(m => m.id !== userMessage.id && m.id !== assistantMessage.id))
    } finally {
      setIsLoading(false)
    }
  }, [inputMessage, apiKeys, selectedProviderId, selectedModel, messages, selectedProvider.name, toast])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    toast({
      title: 'Chat Cleared',
      description: 'All messages have been removed.',
    })
  }

  const clearApiKey = () => {
    const newKeys = { ...apiKeys }
    delete newKeys[selectedProviderId]
    setApiKeys(newKeys)
    toast({
      title: 'API Key Removed',
      description: `Your ${selectedProvider.name} API key has been cleared.`,
    })
  }

  const updateApiKey = (key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [selectedProviderId]: key,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AI Chatter</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Multi-provider AI chat with streaming</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-slate-400 border-slate-600 hidden sm:flex">
              <MessageSquare className="w-3 h-3 mr-1" />
              {messages.length} messages
            </Badge>
            <Badge variant="outline" className="text-emerald-400 border-emerald-600/50 hidden sm:flex">
              <Zap className="w-3 h-3 mr-1" />
              {selectedProvider.name}
            </Badge>
            
            {/* Auth button */}
            {authLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300 hidden sm:block">{user.email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{authAction === 'login' ? 'Welcome Back' : 'Create Account'}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      {authAction === 'login' 
                        ? 'Sign in to sync your settings across devices' 
                        : 'Create an account to save your preferences'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAuth} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="auth-email" className="text-slate-300">Email</Label>
                      <Input
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="auth-password" className="text-slate-300">Password</Label>
                      <Input
                        id="auth-password"
                        type="password"
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                      {authAction === 'login' ? (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                    <div className="text-center text-sm text-slate-400">
                      {authAction === 'login' ? (
                        <>
                          Don&apos;t have an account?{' '}
                          <button type="button" onClick={() => setAuthAction('signup')} className="text-emerald-400 hover:underline">
                            Sign up
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{' '}
                          <button type="button" onClick={() => setAuthAction('login')} className="text-emerald-400 hover:underline">
                            Sign in
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="text-slate-400 hover:text-white hover:bg-slate-700 hidden md:flex"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Settings Panel - Desktop */}
        <aside className={`${isSettingsOpen ? 'w-80' : 'w-0'} border-r border-slate-700/50 bg-slate-900/50 transition-all duration-300 overflow-hidden shrink-0 hidden md:block`}>
          <div className="p-4 flex flex-col gap-4 w-80">
            {/* Provider Selection */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  AI Provider
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Choose your AI provider and model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Provider</Label>
                  <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 max-h-64">
                      {PROVIDERS.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id} className="text-white focus:bg-slate-700">
                          <div className="flex flex-col">
                            <span className="font-medium">{provider.name}</span>
                            <span className="text-xs text-slate-400">{provider.models.length} models</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 max-h-64">
                      {selectedProvider.models.map((model) => (
                        <SelectItem key={model.id} value={model.id} className="text-white focus:bg-slate-700">
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs text-slate-400">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* API Key */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  API Key
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your {selectedProvider.name} API key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder={selectedProvider.apiKeyPlaceholder}
                      value={apiKeys[selectedProviderId] || ''}
                      onChange={(e) => updateApiKey(e.target.value)}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {apiKeys[selectedProviderId] && (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs">
                      <Check className="w-3 h-3" />
                      API key saved
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearApiKey}
                  disabled={!apiKeys[selectedProviderId]}
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                >
                  Clear API Key
                </Button>
              </CardContent>
            </Card>

            {/* Chat Actions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  disabled={messages.length === 0}
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Chat History
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2 text-slate-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                  <p>Your API keys are stored locally in your browser. They are sent directly to the respective AI providers.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-80 bg-slate-900 border-r border-slate-700 overflow-y-auto">
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Settings</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Same settings content as desktop */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      AI Provider
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Provider</Label>
                      <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600 max-h-64">
                          {PROVIDERS.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id} className="text-white focus:bg-slate-700">
                              <span className="font-medium">{provider.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Model</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600 max-h-64">
                          {selectedProvider.models.map((model) => (
                            <SelectItem key={model.id} value={model.id} className="text-white focus:bg-slate-700">
                              <span className="font-medium">{model.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Key className="w-4 h-4 text-emerald-400" />
                      API Key
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        placeholder={selectedProvider.apiKeyPlaceholder}
                        value={apiKeys[selectedProviderId] || ''}
                        onChange={(e) => updateApiKey(e.target.value)}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  disabled={messages.length === 0}
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Chat
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Current Selection Bar */}
          <div className="border-b border-slate-700/50 bg-slate-800/50 px-4 py-2 flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {selectedProvider.name}
            </Badge>
            <ChevronDown className="w-3 h-3 text-slate-500" />
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              {selectedProvider.models.find(m => m.id === selectedModel)?.name || selectedModel}
            </Badge>
            {!isSettingsOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="ml-auto text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            )}
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Start a conversation</h2>
                <p className="text-slate-400 max-w-md mb-4">
                  Select a provider, enter your API key, and start chatting with AI using real-time streaming.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {PROVIDERS.slice(0, 4).map(p => (
                    <Badge key={p.id} variant="outline" className="border-slate-600 text-slate-400">
                      {p.name}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    +{PROVIDERS.length - 4} more
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-100 border border-slate-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse" />
                        )}
                      </p>
                      <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-emerald-200' : 'text-slate-500'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <Separator className="bg-slate-700/50" />

          {/* Input Area */}
          <div className="p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto flex gap-3">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                disabled={isLoading}
                className="min-h-[52px] max-h-[200px] resize-none bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
                className="h-[52px] w-[52px] bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Streaming enabled • Press Enter to send
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
