import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import type { Message } from '../types/chat';

interface ChatMessageProps {
    message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
    const isUser = message.role === 'user';

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div
            className={cn(
                "w-full px-4 py-8 border-b border-white/5 animate-in fade-in duration-300",
                !isUser && "bg-white/[0.02]"
            )}
        >
            <div className="max-w-3xl mx-auto flex gap-6">
                {/* Avatar */}
                <div
                    className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md",
                        isUser
                            ? "bg-gradient-to-br from-primary to-primary/80"
                            : "bg-gradient-to-br from-secondary to-accent"
                    )}
                >
                    {isUser ? <User className="w-[18px] h-[18px]" /> : <Bot className="w-[18px] h-[18px]" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Name */}
                    <div className="text-sm font-semibold mb-3 text-foreground">
                        {isUser ? 'You' : (message.model || 'AI Assistant')}
                    </div>

                    {/* Message Content */}
                    <div className="markdown-content text-[15px] leading-7 text-foreground/90">
                        <ReactMarkdown
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const codeString = String(children).replace(/\n$/, '');
                                    const language = match ? match[1] : 'text';

                                    return !inline && match ? (
                                        <div className="my-6">
                                            <div className="flex justify-between items-center px-4 py-2 bg-black/40 rounded-t-lg text-xs text-muted-foreground font-medium">
                                                <span className="lowercase">{language}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCopyCode(codeString)}
                                                    className={cn(
                                                        "h-7 px-3 text-xs transition-all",
                                                        copiedCode === codeString
                                                            ? "bg-green-500/10 text-green-400"
                                                            : "hover:bg-white/10"
                                                    )}
                                                >
                                                    {copiedCode === codeString ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 mr-1.5" />
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5 mr-1.5" />
                                                            Copy code
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            <SyntaxHighlighter
                                                style={oneDark}
                                                language={language}
                                                PreTag="div"
                                                showLineNumbers={false}
                                                customStyle={{
                                                    margin: 0,
                                                    borderTopLeftRadius: 0,
                                                    borderTopRightRadius: 0,
                                                    borderBottomLeftRadius: '0.5rem',
                                                    borderBottomRightRadius: '0.5rem',
                                                    fontSize: '14px',
                                                    padding: '1.5rem',
                                                }}
                                                {...props}
                                            >
                                                {codeString}
                                            </SyntaxHighlighter>
                                        </div>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
