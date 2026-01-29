import { Menu, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { ModelSelector } from './ModelSelector';
import type { AIModel } from '../types/chat';

interface HeaderProps {
    selectedModel: AIModel;
    onModelChange: (model: AIModel) => void;
    onMenuToggle: () => void;
}

export function Header({ selectedModel, onModelChange, onMenuToggle }: HeaderProps) {
    return (
        <header className="glass-strong border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuToggle}
                    className="md:hidden hover:bg-white/10"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className=" flex items-center justify-center">
                        <img src="https://demtimcod.github.io/img/dc-logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg" />
                    </div>
                    <h1 className="text-lg font-bold gradient-text hidden sm:block">
                        Demtimcod AI
                    </h1>
                </div>
            </div>

            {/* Model Selector */}
            <ModelSelector selectedModel={selectedModel} onModelChange={onModelChange} />
        </header>
    );
}
