import { lazy, Suspense } from 'react'
import { cn } from "@/lib/utils"

// Lazy load react-markdown
const Markdown = lazy(() => import('react-markdown'))

interface MessageBubbleProps {
    role: "user" | "assistant" | "system"
    content: string
    className?: string
}

export function MessageBubble({ role, content, className }: MessageBubbleProps) {
    const isUser = role === "user"

    return (
        <div
            className={cn(
                "flex w-full",
                isUser ? "justify-end" : "justify-start",
                className
            )}
        >
            <div
                className={cn(
                    "relative max-w-[85%] px-5 py-3.5 text-sm shadow-md",
                    isUser
                        ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-2xl rounded-tl-sm shadow-sm"
                )}
            >
                <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed text-[15px]">
                    <Suspense fallback={<div className="animate-pulse">{content}</div>}>
                        <Markdown>{content}</Markdown>
                    </Suspense>
                </div>
            </div>
        </div>
    )
}