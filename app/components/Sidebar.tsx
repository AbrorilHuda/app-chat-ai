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
    const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

    const handleNewChat = () => {
        onNewConversation();
        onMobileClose();
    };

    const handleSelectConversation = (id: string) => {
        onSelectConversation(id);
        onMobileClose();
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteConfirmId(id);
    };

    const confirmDelete = (id: string) => {
        onDeleteConversation(id);
        setDeleteConfirmId(null);
    };

    const cancelDelete = () => {
        setDeleteConfirmId(null);
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
                                    {/* Delete Confirmation Overlay - More visible on mobile */}
                                    {deleteConfirmId === conversation.id && (
                                        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-md rounded-lg flex flex-col items-center justify-center gap-3 px-4 py-3 border-2 border-destructive/50">
                                            <p className="text-sm font-semibold text-white text-center">
                                                Delete conversation?
                                            </p>
                                            <div className="flex gap-2 w-full">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => confirmDelete(conversation.id)}
                                                    className="flex-1 bg-destructive text-white hover:bg-destructive/90 h-9 font-semibold shadow-lg"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                                    Delete
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={cancelDelete}
                                                    className="flex-1 bg-white/20 hover:bg-white/30 text-white h-9 font-semibold"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleSelectConversation(conversation.id)}
                                        className={cn(
                                            "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200",
                                            "flex items-center gap-3",
                                            activeConversationId === conversation.id
                                                ? "bg-white/10 text-foreground"
                                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        )}
                                    >
                                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                        <span className="flex-1 truncate text-sm pr-8">
                                            {conversation.title}
                                        </span>
                                    </button>

                                    {/* Delete Button - More visible on mobile */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => handleDeleteClick(e, conversation.id)}
                                        className={cn(
                                            "absolute right-1.5 top-1/2 -translate-y-1/2 transition-all duration-200",
                                            "h-8 w-8 sm:h-7 sm:w-7",
                                            // Desktop: hover to show
                                            "md:opacity-0 md:group-hover:opacity-100",
                                            // Mobile: always visible with red background
                                            "opacity-100 bg-destructive/20 text-destructive",
                                            "hover:bg-destructive/30 active:bg-destructive/40",
                                            "border border-destructive/30"
                                        )}
                                    >
                                        <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
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
