import type { AIModel } from '../types/chat';

const CHAT_API_URL = 'https://api.chatanywhere.tech/v1/chat/completions';

export interface ChatCompletionOptions {
    model: AIModel;
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    apiKey?: string;
    onChunk?: (chunk: string) => void;
}

export async function sendChatMessage({
    model,
    messages,
    apiKey,
    onChunk,
}: ChatCompletionOptions): Promise<string> {
    try {
        // Use provided API key or fall back to environment variable
        const key = apiKey || import.meta.env.VITE_CHAT_API_KEY;

        const response = await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(key && { 'Authorization': `Bearer ${key}` }),
            },
            body: JSON.stringify({
                model,
                messages,
                stream: !!onChunk,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        // Handle streaming response
        if (onChunk && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            if (content) {
                                fullContent += content;
                                onChunk(content);
                            }
                        } catch (e) {
                            console.error('Error parsing chunk:', e);
                        }
                    }
                }
            }

            return fullContent;
        }

        // Handle non-streaming response
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'No response from AI';
    } catch (error) {
        console.error('Chat API Error:', error);
        throw error;
    }
}

export const MODEL_CONFIGS: Record<AIModel, { name: string; description: string }> = {
    'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient for most tasks',
    },
    'gpt-4o-mini': {
        name: 'GPT-4o Mini',
        description: 'Balanced performance and capability',
    },
    'deepseek-v3': {
        name: 'DeepSeek V3',
        description: 'Advanced reasoning and analysis',
    },
    'deepseek-r1': {
        name: 'DeepSeek R1',
        description: 'Specialized research model',
    },
};
