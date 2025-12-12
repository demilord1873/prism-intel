'use client';

import { useState, KeyboardEvent, FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, isLoading = false, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="sticky bottom-0 z-50 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/50 px-4 py-3 flex items-center gap-3 max-w-[90%] mx-auto" // <-- Wider container
    >
      <textarea
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Ask Prism..."
  className={cn(
    'flex-1 w-full min-w-125 max-w-full p-3 rounded-xl bg-gray-800/30 border border-gray-700/50 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400',
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  )}
  rows={1}
  disabled={disabled || isLoading}
/>

      <button
        type="submit"
        disabled={disabled || isLoading || !input.trim()}
        className={cn(
          'p-2 rounded-xl bg-blue-500/70 hover:bg-blue-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}
