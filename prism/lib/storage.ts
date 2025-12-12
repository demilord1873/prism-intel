// src/lib/storage.ts
import { ChatSession, Message } from './types';

const STORAGE_KEY = 'deepseek_chat_sessions';

export class ChatStorage {
  static saveSession(session: ChatSession): void {
    const sessions = this.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }

  static getSessions(): ChatSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static getSession(id: string): ChatSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === id) || null;
  }

  static deleteSession(id: string): void {
    const sessions = this.getSessions().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }

  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}