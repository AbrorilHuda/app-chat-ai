export type AIModel = 'gpt-3.5-turbo' | 'gpt-4o-mini' | 'deepseek-v3' | 'deepseek-r1';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: AIModel;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: AIModel;
}

export interface ModelInfo {
  id: AIModel;
  name: string;
  description: string;
  icon: string;
}
