'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { Bot, Sparkles, Zap, Brain } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

export default function ChatInterface() {
  const { messages, sendMessage, isLoading, error, clearChat, sessionId } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    'Explain quantum computing simply',
    'Write a Python function for bubble sort',
    'What is the future of AI?',
    'Help me debug this JavaScript code',
  ];

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-gray-900 via-black to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
              </div>

              <div>
                <h1 className="text-lg font-semibold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Prism Intelligence
                </h1>

                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Powered by DemLabs • Model: Prism v1 • Session: {sessionId.slice(0, 8)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                disabled={messages.length === 0 || isLoading}
                className={cn(
                  'px-4 py-2 text-sm rounded-lg transition-all',
                  'bg-gray-800/50 hover:bg-gray-800',
                  'border border-gray-700/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <AnimatePresence mode="popLayout">
            {/* Welcome Screen */}
            {messages.length === 0 && (
              <motion.div
                key="welcome-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                {...({ className: 'text-center py-12' } as MotionProps)}
              >
                <div className="inline-flex p-4 rounded-2xl bg-linear-to-br from-blue-500/10 to-purple-600/10 mb-6">
                  <Brain className="w-12 h-12 text-blue-400" />
                </div>

                <h2 className="text-2xl font-bold mb-3 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Welcome to Prism (by DemLabs)!
                </h2>

                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Ask me anything! I can help with coding, analysis, creative
                  writing, and more. I support streaming for real-time
                  conversation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {quickPrompts.map((prompt, index) => (
                    <motion.button
                      key={`quick-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      {...({
                        onClick: () => sendMessage(prompt),
                        disabled: isLoading,
                        className: cn(
                          'p-3 text-sm rounded-xl text-left transition-all',
                          'bg-gray-800/30 hover:bg-gray-800/50',
                          'border border-gray-700/30 hover:border-blue-500/30',
                          'disabled:opacity-50 disabled:cursor-not-allowed'
                        ),
                      } as MotionProps)}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        {prompt}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages List */}
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id ?? `${message.role}-${index}-${sessionId}`}
                message={message}
                isLast={index === messages.length - 1 && isLoading}
              />
            ))}

            {/* Error Message */}
            {error && (
              <motion.div
                key="error-box"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="mx-4 my-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Error: {error}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} key="end-ref" />
          </AnimatePresence>
        </div>
      </main>

      {/* Chat Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} disabled={!!error} />
    </div>
  );
}
