import { useState, useCallback, useEffect, useRef } from 'react';

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

const STORAGE_KEY = 'chat-ai-data';
const generateId = () => Math.random().toString(36).substring(2, 15);

const createInitialConversation = (): Conversation => ({
    id: generateId(),
    title: 'New Conversation',
    messages: [],
    model: 'gpt-3.5-turbo',
    updatedAt: Date.now(),
});

// Helper to save to localStorage
const saveToStorage = (conversations: Conversation[], currentChatId: string | null) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, currentChatId }));
    } catch (err) {
        console.error('Save failed:', err);
    }
};

export function useChat() {
    // Initialize from localStorage or create default
    const [conversations, setConversations] = useState<Conversation[]>(() => {
        if (typeof window === 'undefined') return [createInitialConversation()];

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                if (data.conversations && data.conversations.length > 0) {
                    return data.conversations;
                }
            }
        } catch (err) {
            console.error('Load failed:', err);
        }

        return [createInitialConversation()];
    });

    const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
        if (typeof window === 'undefined') return conversations[0]?.id || null;

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                return data.currentChatId || conversations[0]?.id || null;
            }
        } catch (err) {
            console.error('Load failed:', err);
        }

        return conversations[0]?.id || null;
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentConversation = conversations.find(c => c.id === currentChatId);

    const createNewChat = useCallback((model: Model = 'gpt-3.5-turbo') => {
        const newChat = createInitialConversation();
        newChat.model = model;

        setConversations(prev => {
            const newConversations = [newChat, ...prev];
            saveToStorage(newConversations, newChat.id);
            return newConversations;
        });
        setCurrentChatId(newChat.id);
        return newChat.id;
    }, []);

    const deleteChat = useCallback((id: string) => {
        setConversations(prev => {
            let newConversations = prev.filter(c => c.id !== id);
            let newChatId = currentChatId;

            if (newConversations.length === 0) {
                const newChat = createInitialConversation();
                newConversations = [newChat];
                newChatId = newChat.id;
            } else if (currentChatId === id) {
                newChatId = null;
            }

            setCurrentChatId(newChatId);
            saveToStorage(newConversations, newChatId);
            return newConversations;
        });
    }, [currentChatId]);

    const setModel = useCallback((model: Model) => {
        if (!currentChatId) return;
        setConversations(prev => {
            const newConversations = prev.map(c =>
                c.id === currentChatId ? { ...c, model } : c
            );
            saveToStorage(newConversations, currentChatId);
            return newConversations;
        });
    }, [currentChatId]);

    const handleSetCurrentChatId = useCallback((id: string | null) => {
        setCurrentChatId(id);
        setConversations(prev => {
            saveToStorage(prev, id);
            return prev;
        });
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || !currentChatId) return;

        const conversation = conversations.find(c => c.id === currentChatId);
        if (!conversation) return;

        const userMessage: Message = { role: 'user', content };
        const updatedMessages = [...conversation.messages, userMessage];

        const newConversations = conversations.map(c => {
            if (c.id === currentChatId) {
                return {
                    ...c,
                    messages: updatedMessages,
                    title: c.messages.length === 0 ? content.slice(0, 30) : c.title,
                    updatedAt: Date.now(),
                };
            }
            return c;
        });

        setConversations(newConversations);
        saveToStorage(newConversations, currentChatId);

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: conversation.model,
                    messages: updatedMessages,
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices?.[0]?.message;

            if (assistantMessage) {
                const finalConversations = newConversations.map(c => {
                    if (c.id === currentChatId) {
                        return {
                            ...c,
                            messages: [...updatedMessages, assistantMessage],
                            updatedAt: Date.now(),
                        };
                    }
                    return c;
                });
                setConversations(finalConversations);
                saveToStorage(finalConversations, currentChatId);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send message');
            // Revert
            setConversations(conversations);
            saveToStorage(conversations, currentChatId);
        } finally {
            setIsLoading(false);
        }
    }, [conversations, currentChatId]);

    return {
        conversations,
        currentChatId,
        setCurrentChatId: handleSetCurrentChatId,
        currentConversation,
        createNewChat,
        deleteChat,
        setModel,
        isLoading,
        error,
        sendMessage,
        isHydrated: true, // Always true since we init from localStorage in useState
    };
}