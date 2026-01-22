import { useState, useEffect, useCallback } from 'react';

export type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

export type Model = 'gpt-3.5-turbo' | 'gpt-4o-mini' | 'deepseek-v3' | 'deepseek-r1';

export type Conversation = {
    id: string;
    title: string;
    messages: Message[];
    model: Model;
    updatedAt: number;
};

const STORAGE_KEY_CONVERSATIONS = 'chat-ai-conversations';
const STORAGE_KEY_CURRENT_CHAT = 'chat-ai-current-chat-id';

// Simple UUID generator if I can't install uuid package right now.
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export function useChat() {
    // Initialize with lazy loading from localStorage to avoid overwriting with empty state
    const [conversations, setConversations] = useState<Conversation[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load conversations', error);
            return [];
        }
    });

    const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY_CURRENT_CHAT);
        } catch (error) {
            console.error('Failed to load current chat ID', error);
            return null;
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_API_KEY || '');

    // Save to LocalStorage whenever state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    }, [conversations]);

    useEffect(() => {
        if (currentChatId) {
            localStorage.setItem(STORAGE_KEY_CURRENT_CHAT, currentChatId);
        } else {
            localStorage.removeItem(STORAGE_KEY_CURRENT_CHAT);
        }
    }, [currentChatId]);


    const getCurrentConversation = useCallback(() => {
        return conversations.find(c => c.id === currentChatId);
    }, [conversations, currentChatId]);

    const createNewChat = useCallback((model: Model = 'gpt-3.5-turbo') => {
        const newChat: Conversation = {
            id: generateId(),
            title: 'New Conversation',
            messages: [],
            model,
            updatedAt: Date.now(),
        };
        setConversations(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        return newChat.id;
    }, []);

    const deleteChat = useCallback((id: string) => {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (currentChatId === id) {
            setCurrentChatId(null);
        }
    }, [currentChatId]);

    const updateCurrentChatMessages = useCallback((messages: Message[]) => {
        setConversations(prev => prev.map(c => {
            if (c.id === currentChatId) {
                return { ...c, messages, updatedAt: Date.now(), title: c.messages.length === 0 && messages.length > 0 ? messages[0].content.slice(0, 30) : c.title };
            }
            return c;
        }));
    }, [currentChatId]);

    const setModel = useCallback((model: Model) => {
        if (!currentChatId) {
            // If no chat, create one? Or just don't do anything? 
            // Better to handle in UI. But here let's safeguard.
            return;
        }
        setConversations(prev => prev.map(c => {
            if (c.id === currentChatId) {
                return { ...c, model };
            }
            return c;
        }));
    }, [currentChatId]);


    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        let targetChatId = currentChatId;
        let targetConversation = conversations.find(c => c.id === targetChatId);

        if (!targetChatId || !targetConversation) {
            // Auto-create chat if none selected
            targetChatId = createNewChat();
            // createNewChat updates state, but we need the object NOW.
            // Re-deriving it for this closure isn't safe due to closure staleness, 
            // so we'll just manually construct what we pushed.
            // Actually, let's just create it and use it.
            // This is tricky with setState async. 
            // Better strategy: Assume UI handles creation or we force it.
            // For now, let's fail safe:
            // Note: The UI should call createNewChat if currentChatId is null.
            return;
        }

        // We have a target chat ID.
        // Need to get the VERY latest messages for this chat.
        // Since we are in a closure, 'conversations' might be stale if we just created it? 
        // No, createNewChat returns ID. useChat re-renders.

        const currentMessages = targetConversation.messages;
        const model = targetConversation.model;

        const newMessage: Message = { role: 'user', content };
        const updatedMessages = [...currentMessages, newMessage];

        // Optimistic Update
        updateCurrentChatMessages(updatedMessages);
        setIsLoading(true);
        setError(null);

        try {
            const apiMessages = updatedMessages.map(({ role, content }) => ({ role, content }));

            const response = await fetch('https://api.chatanywhere.tech/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: apiMessages,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices?.[0]?.message;

            if (assistantMessage) {
                updateCurrentChatMessages([...updatedMessages, assistantMessage]);
            } else {
                throw new Error('No response from API');
            }

        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }, [conversations, currentChatId, apiKey, createNewChat, updateCurrentChatMessages]);

    const clearHistory = useCallback(() => {
        // Clear ALL? Or just current? User probably meant delete chat.
        // But keeping this for legacy simple usage if needed.
        setConversations([]);
        setCurrentChatId(null);
    }, []);

    return {
        conversations,
        currentChatId,
        setCurrentChatId,
        currentConversation: getCurrentConversation(),
        createNewChat,
        deleteChat,
        setModel,
        apiKey,
        setApiKey,
        isLoading,
        error,
        sendMessage,
        clearHistory
    };
}
