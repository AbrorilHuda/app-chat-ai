import type { Conversation, AIModel } from '../types/chat';

const STORAGE_KEYS = {
    CONVERSATIONS: 'chat-ai-conversations',
    SELECTED_MODEL: 'chat-ai-selected-model',
    ACTIVE_CONVERSATION: 'chat-ai-active-conversation',
} as const;

export const storage = {
    // Conversations
    getConversations(): Conversation[] {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading conversations:', error);
            return [];
        }
    },

    saveConversations(conversations: Conversation[]): void {
        try {
            localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
        } catch (error) {
            console.error('Error saving conversations:', error);
        }
    },

    // Selected Model
    getSelectedModel(): AIModel {
        try {
            const model = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
            return (model as AIModel) || 'gpt-3.5-turbo';
        } catch (error) {
            console.error('Error loading selected model:', error);
            return 'gpt-3.5-turbo';
        }
    },

    saveSelectedModel(model: AIModel): void {
        try {
            localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, model);
        } catch (error) {
            console.error('Error saving selected model:', error);
        }
    },

    // Active Conversation
    getActiveConversationId(): string | null {
        try {
            return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
        } catch (error) {
            console.error('Error loading active conversation:', error);
            return null;
        }
    },

    saveActiveConversationId(id: string | null): void {
        try {
            if (id) {
                localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
            } else {
                localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
            }
        } catch (error) {
            console.error('Error saving active conversation:', error);
        }
    },

    // Clear all
    clearAll(): void {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    },
};
