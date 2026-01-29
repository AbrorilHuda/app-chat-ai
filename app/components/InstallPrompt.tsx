import React from 'react';
import { X, Download } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface InstallPromptProps {
    onClose: () => void;
    onInstall: () => void;
}

export function InstallPrompt({ onClose, onInstall }: InstallPromptProps) {
    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="glass-strong border border-primary/20 rounded-2xl p-4 shadow-2xl shadow-primary/20">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Content */}
                <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                            <Download className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">
                            Install Demtimcod AI
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Install app untuk akses lebih cepat dan pengalaman seperti aplikasi native!
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={onInstall}
                                size="sm"
                                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/30"
                            >
                                Install
                            </Button>
                            <Button
                                onClick={onClose}
                                size="sm"
                                variant="ghost"
                                className="hover:bg-white/10"
                            >
                                Nanti
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
