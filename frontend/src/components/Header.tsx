"use client";

import { Settings, Star, Trash2, Zap } from "lucide-react";
import Logo from "@/components/Logo";

interface HeaderProps {
  chatTitle?: string;
  chatId?: string | null;
  provider?: string;
  model?: string;
  onDeleteChat?: (id: string) => void;
}

export default function Header({
  chatTitle,
  chatId,
  provider,
  model,
  onDeleteChat,
}: HeaderProps) {
  const badge =
    provider === "ollama"
      ? `Ollama · ${model || "local"}`
      : `Groq · ${model || "cloud"}`;

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-8 py-4">
      <div className="flex items-center gap-4">
        <Logo size={36} />
        <h1 className="text-2xl font-bold tracking-tight text-qubi-purple">Qubi</h1>
        {chatTitle && (
          <>
            <span className="text-gray-300">/</span>
            <span className="max-w-[320px] truncate text-sm font-medium text-gray-500">
              {chatTitle}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        {chatId && onDeleteChat && (
          <button
            onClick={() => {
              if (window.confirm(`Delete "${chatTitle || "this chat"}"?`)) {
                onDeleteChat(chatId);
              }
            }}
            className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
            title="Delete chat"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
        <span className="hidden items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-qubi-purple lg:flex">
          <Zap className="h-3.5 w-3.5" />
          {badge}
        </span>
        <button className="flex items-center gap-2 rounded-full bg-qubi-green px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-qubi-green-dark">
          <Star className="h-4 w-4" />
          Update
        </button>
        <button className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </header>
  );
}

const SUGGESTIONS = [
  "Create a marketing plan for next month",
  "How can I increase engagement on social media?",
  "Summarize my uploaded document",
];

interface WelcomeMessageProps {
  onSuggestion?: (text: string) => void;
}

export function WelcomeMessage({ onSuggestion }: WelcomeMessageProps) {
  return (
    <div className="animate-fade-up flex flex-col items-center py-12 text-center">
      <Logo size={72} className="mb-5 shadow-lg shadow-blue-500/25" />
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Hello! I&apos;m your personal AI Assistant <span className="text-qubi-purple">Qubi</span>
      </h2>
      <p className="mb-8 max-w-md text-[15px] leading-relaxed text-qubi-muted">
        Ask me anything, upload a document for Q&amp;A, or use voice input.
        Powered by free Ollama (local AI) with RAG via LangChain &amp; FAISS.
      </p>
      <div className="grid w-full max-w-lg grid-cols-1 gap-2.5">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestion?.(suggestion)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-600 shadow-bubble transition hover:border-qubi-purple/30 hover:bg-violet-50/50 hover:text-gray-900"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
