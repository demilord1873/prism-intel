// src/app/(chat)/page.tsx
import ChatInterface from './components/ChatInterface';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DeepSeek AI Chatbot',
  description: 'Futuristic AI chatbot powered by DeepSeek API',
  keywords: ['AI', 'Chatbot', 'DeepSeek', 'Next.js', 'React'],
};

export default function Home() {
  return <ChatInterface />;
}