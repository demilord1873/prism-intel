'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Message } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  const controllerRef = useRef<AbortController | null>(null);

  // Ref to avoid stale messages when sending
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Generate sessionId after hydration
  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content || !content.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // 1. Create user message
      const userMsg: Message = {
        id: uuidv4(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        status: 'sent',
      };
      setMessages((prev) => [...prev, userMsg]);

      // 2. Create assistant placeholder
      const assistantMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        status: 'sending',
      };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        controllerRef.current = new AbortController();

        // Build message history safely
        const currentMessages = [
          ...messagesRef.current,
          userMsg,
        ].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          signal: controllerRef.current.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: currentMessages,
            model: 'deepseek/deepseek-chat',
            stream: true,
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => 'Failed to fetch from API');
          throw new Error(errText || 'Failed to fetch from API');
        }

        const contentType = response.headers.get('content-type') || '';
        const isStream =
          !!response.body &&
          (contentType.includes('text/event-stream') ||
            contentType.includes('text/plain'));

        // STREAMING MODE
        if (isStream && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value);
            const events = buffer.split('\n\n');
            buffer = events.pop() || '';

            for (const evt of events) {
              if (!evt.startsWith('data:')) continue;

              try {
                const data = JSON.parse(evt.replace('data:', '').trim());
                const text =
                  data.choices?.[0]?.delta?.content ??
                  data.choices?.[0]?.message?.content ??
                  '';

                if (text) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsg.id
                        ? { ...msg, content: msg.content + text }
                        : msg
                    )
                  );
                }
              } catch {
                // Ignore malformed JSON chunks
              }
            }
          }
        } else {
          // NON-STREAMING fallback
          const json = await response.json();
          const text =
            json?.choices?.[0]?.message?.content ??
            (typeof json?.message === 'string' ? json.message : '');

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsg.id
                ? { ...msg, content: msg.content + (text || '') }
                : msg
            )
          );
        }

        // Mark assistant message as sent
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsg.id ? { ...msg, status: 'sent' } : msg
          )
        );
      } catch (err: any) {
        console.error('Chat client error:', err);
        setError(err.message || 'Unknown error');

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMsg.id ? { ...msg, status: 'error' } : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setSessionId(uuidv4());
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearChat,
    sessionId,
  };
};
