import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import type { AIModel } from '../types/chat';
import { MODEL_CONFIGS } from '../utils/api';

interface ModelSelectorProps {
    selectedModel: AIModel;
    onModelChange: (model: AIModel) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
    const models: AIModel[] = ['gpt-3.5-turbo', 'gpt-4o-mini', 'deepseek-v3', 'deepseek-r1'];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="glass border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                >
                    <span className="font-medium">{MODEL_CONFIGS[selectedModel].name}</span>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 glass-strong border-white/10">
                {models.map((model) => (
                    <DropdownMenuItem
                        key={model}
                        onClick={() => onModelChange(model)}
                        className="cursor-pointer"
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex-1">
                                <div className="font-medium text-foreground">
                                    {MODEL_CONFIGS[model].name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {MODEL_CONFIGS[model].description}
                                </div>
                            </div>
                            {selectedModel === model && (
                                <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
