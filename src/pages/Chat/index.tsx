/**
 * Chat Page
 * Conversation interface with AI
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Trash2, 
  Bot, 
  User, 
  Copy, 
  Check, 
  RefreshCw,
  AlertCircle,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useChatStore } from '@/stores/chat';
import { useGatewayStore } from '@/stores/gateway';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { cn, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

// Message component with markdown support
interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    toolCalls?: Array<{
      id: string;
      name: string;
      arguments: Record<string, unknown>;
      result?: unknown;
      status: 'pending' | 'running' | 'completed' | 'error';
    }>;
  };
}

function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  
  const copyContent = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);
  
  return (
    <div
      className={cn(
        'flex gap-3 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>
      
      {/* Message Content */}
      <div
        className={cn(
          'relative max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom code block styling
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !className;
                  
                  if (isInline) {
                    return (
                      <code className="bg-background/50 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                  
                  return (
                    <div className="relative group/code">
                      {match && (
                        <div className="absolute right-2 top-2 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground opacity-60">
                            {match[1]}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover/code:opacity-100 transition-opacity"
                            onClick={() => {
                              navigator.clipboard.writeText(String(children));
                              toast.success('Code copied!');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <pre className="bg-background/50 rounded-lg p-4 overflow-x-auto">
                        <code className={cn('text-sm font-mono', className)} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                },
                // Custom link styling
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        
        {/* Timestamp and actions */}
        <div className={cn(
          'flex items-center gap-2 mt-2',
          isUser ? 'justify-end' : 'justify-between'
        )}>
          <p
            className={cn(
              'text-xs',
              isUser
                ? 'text-primary-foreground/70'
                : 'text-muted-foreground'
            )}
          >
            {formatRelativeTime(message.timestamp)}
          </p>
          
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={copyContent}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        
        {/* Tool Calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 space-y-2 border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground">Tools Used:</p>
            {message.toolCalls.map((tool) => (
              <Card key={tool.id} className="bg-background/50">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">{tool.name}</p>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      tool.status === 'completed' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      tool.status === 'running' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                      tool.status === 'error' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                      tool.status === 'pending' && 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    )}>
                      {tool.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="bg-muted rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// Welcome screen component
function WelcomeScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
        <Bot className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Welcome to ClawX Chat</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        I'm your AI assistant, ready to help with tasks, answer questions, and more. 
        Start by typing a message below.
      </p>
      
      <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
        {[
          { icon: MessageSquare, title: 'Ask Questions', desc: 'Get answers on any topic' },
          { icon: Sparkles, title: 'Creative Tasks', desc: 'Writing, brainstorming, ideas' },
        ].map((item, i) => (
          <Card key={i} className="text-left">
            <CardContent className="p-4">
              <item.icon className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Chat() {
  const { messages, loading, sending, error, fetchHistory, sendMessage, clearHistory } = useChatStore();
  const gatewayStatus = useGatewayStore((state) => state.status);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isGatewayRunning = gatewayStatus.state === 'running';
  
  // Fetch history on mount
  useEffect(() => {
    if (isGatewayRunning) {
      fetchHistory();
    }
  }, [fetchHistory, isGatewayRunning]);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);
  
  // Handle send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || sending || !isGatewayRunning) return;
    
    const content = input.trim();
    setInput('');
    await sendMessage(content);
  }, [input, sending, isGatewayRunning, sendMessage]);
  
  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Gateway Warning */}
      {!isGatewayRunning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            Gateway is not running. Chat functionality is unavailable.
          </span>
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {sending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}
      
      {/* Input Area */}
      <div className="border-t p-4 bg-background">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearHistory}
            disabled={messages.length === 0}
            title="Clear history"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isGatewayRunning ? "Type a message... (Shift+Enter for new line)" : "Gateway not connected..."}
              disabled={sending || !isGatewayRunning}
              className="min-h-[44px] max-h-[200px] resize-none pr-12"
              rows={1}
            />
          </div>
          
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || sending || !isGatewayRunning}
            size="icon"
            className="shrink-0"
          >
            {sending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

export default Chat;
