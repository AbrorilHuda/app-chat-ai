import React from 'react';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import type { Conversation } from '../types/chat';

interface SidebarProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onNewConversation: () => void;
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

export function Sidebar({
    conversations,
    activeConversationId,
    onNewConversation,
    onSelectConversation,
    onDeleteConversation,
    isMobileOpen,
    onMobileClose,
}: SidebarProps) {
    const [hoveredId, setHoveredId] = React.useState<string | null>(null);

    const handleNewChat = () => {
        onNewConversation();
        onMobileClose();
    };

    const handleSelectConversation = (id: string) => {
        onSelectConversation(id);
        onMobileClose();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed md:static inset-y-0 left-0 z-50 w-72 glass-strong border-r border-border flex flex-col transition-transform duration-300 ease-in-out",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">Conversations</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMobileClose}
                        className="md:hidden hover:bg-white/10"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* New Chat Button */}
                <div className="p-4">
                    <Button
                        onClick={handleNewChat}
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/30"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Chat
                    </Button>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">
                                No conversations yet
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                Start a new chat to begin
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1 pb-4">
                            {conversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    className="relative group"
                                    onMouseEnter={() => setHoveredId(conversation.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    <button
                                        onClick={() => handleSelectConversation(conversation.id)}
                                        className={cn(
                                            "w-full text-left px-3 py-2.5 pr-10 rounded-lg transition-all duration-200",
                                            "flex items-center gap-3",
                                            activeConversationId === conversation.id
                                                ? "bg-white/10 text-foreground"
                                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        )}
                                    >
                                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                        <span className="flex-1 truncate text-sm">
                                            {conversation.title}
                                        </span>
                                    </button>

                                    {/* Delete Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteConversation(conversation.id);
                                        }}
                                        className={cn(
                                            "absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 transition-opacity duration-200",
                                            "hover:bg-destructive/20 hover:text-destructive",
                                            hoveredId === conversation.id ? "opacity-100" : "opacity-0 pointer-events-none"
                                        )}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
