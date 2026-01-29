import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { storage } from '../utils/storage';
import { sendChatMessage } from '../utils/api';
import type { Conversation, Message, AIModel } from '../types/chat';
import type { Route } from './+types/home';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: 'Demtimcod AI' },
    { name: 'description', content: 'Chat with multiple AI models including GPT-3.5 Turbo, GPT-4o Mini, DeepSeek V3, and DeepSeek R1' },
  ];
}

export default function Home() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [selectedModel, setSelectedModel] = React.useState<AIModel>('gpt-3.5-turbo');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  React.useEffect(() => {
    const savedConversations = storage.getConversations();
    const savedModel = storage.getSelectedModel();
    const savedActiveId = storage.getActiveConversationId();

    setConversations(savedConversations);
    setSelectedModel(savedModel);

    if (savedActiveId && savedConversations.find(c => c.id === savedActiveId)) {
      setActiveConversationId(savedActiveId);
    } else if (savedConversations.length > 0) {
      setActiveConversationId(savedConversations[0].id);
    }
  }, []);

  // Save to localStorage when data changes
  React.useEffect(() => {
    if (conversations.length > 0) {
      storage.saveConversations(conversations);
    }
  }, [conversations]);

  React.useEffect(() => {
    storage.saveSelectedModel(selectedModel);
  }, [selectedModel]);

  React.useEffect(() => {
    storage.saveActiveConversationId(activeConversationId);
  }, [activeConversationId]);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel,
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);

      // If deleting active conversation, switch to another
      if (id === activeConversationId) {
        const newActive = filtered[0];
        setActiveConversationId(newActive?.id || null);
      }

      return filtered;
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) {
      handleNewConversation();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Add user message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            updatedAt: Date.now(),
            title: conv.messages.length === 0 ? content.slice(0, 50) : conv.title,
          }
          : conv
      )
    );

    setIsLoading(true);

    try {
      // Create AI message placeholder
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        model: selectedModel,
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: [...conv.messages, aiMessage] }
            : conv
        )
      );

      // Get conversation messages for context
      const conversation = conversations.find(c => c.id === activeConversationId);
      const messages = conversation?.messages || [];

      // Send to API with streaming
      await sendChatMessage({
        model: selectedModel,
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content },
        ],
        onChunk: (chunk) => {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === activeConversationId
                ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: msg.content + chunk }
                      : msg
                  ),
                }
                : conv
            )
          );
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response from AI'}. Please try again.`,
        timestamp: Date.now(),
        model: selectedModel,
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
              ...conv,
              messages: [...conv.messages.slice(0, -1), errorMessage],
            }
            : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center flex-col gap-6 px-8 text-center">
              <div className="flex items-center justify-center">
                <img src="https://demtimcod.github.io/img/dc-logo.jpg" alt="Logo" className="w-20 h-20 rounded-full" />
              </div>
              <div>
                <h2 className="gradient-text text-3xl mb-2 font-bold">
                  Welcome to Demtimcod AI
                </h2>
                <p className="text-muted-foreground max-w-lg">
                  Start a conversation with AI. Choose from multiple models including GPT-3.5 Turbo, GPT-4o Mini, DeepSeek V3, and DeepSeek R1.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-6">
              {activeConversation.messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div >
  );
}
