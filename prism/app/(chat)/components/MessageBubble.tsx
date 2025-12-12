// src/app/(chat)/components/MessageBubble.tsx
'use client';

import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Bot, User, Clock, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

export default function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-amber-500 animate-pulse" />;
      case 'sent':
        return <Check className="w-3 h-3 text-green-500" />;
      case 'error':
        return <X className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-3',
          'backdrop-blur-sm border',
          isUser
            ? 'bg-linear-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 rounded-tr-none'
            : 'bg-linear-to-r from-gray-900/10 to-gray-800/10 border-gray-700/20 rounded-tl-none'
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          {isUser ? (
            <User className="w-4 h-4 text-blue-400" />
          ) : (
            <Bot className="w-4 h-4 text-purple-400" />
          )}
          <span className="text-xs font-medium">
            {isUser ? 'You' : 'DeepSeek AI'}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {getStatusIcon()}
        </div>
        
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        
        {isLast && isAssistant && !message.content && (
          <div className="flex gap-1 mt-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200" />
          </div>
        )}
      </div>

      {isUser && (
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
}