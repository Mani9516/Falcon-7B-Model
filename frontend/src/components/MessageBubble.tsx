"use client";

import {
  Copy,
  FileText,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import type { Message } from "@/lib/api";

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
}

function VoiceWaveform({ duration }: { duration?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl rounded-tr-md border border-gray-100 bg-gray-50 px-5 py-3.5 shadow-bubble">
      <div className="flex h-9 items-end gap-[3px]">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-qubi-purple/50"
            style={{ height: `${Math.abs(Math.sin(i * 0.45)) * 14 + 10}px` }}
          />
        ))}
      </div>
      <span className="text-sm font-medium tabular-nums text-gray-500">
        {duration || "00:00"}
      </span>
    </div>
  );
}

function FileAttachment({ filename, url }: { filename: string; url?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl rounded-tr-md border border-gray-200 bg-white px-5 py-4 shadow-bubble">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
        <FileText className="h-5 w-5 text-red-500" />
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold text-gray-800">{filename}</p>
        {url && (
          <p className="mt-0.5 text-xs text-blue-500">{url}</p>
        )}
      </div>
    </div>
  );
}

function stripMarkdown(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/\*/g, "");
}

export default function MessageBubble({ message, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const displayContent = isUser ? message.content : stripMarkdown(message.content);

  if (message.type === "voice" && isUser) {
    return (
      <div className="flex justify-end gap-3 animate-fade-up">
        <VoiceWaveform duration={message.metadata?.duration} />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white">
          <User className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    );
  }

  if (message.type === "file" && isUser) {
    return (
      <div className="flex justify-end gap-3 animate-fade-up">
        <FileAttachment
          filename={message.metadata?.filename || "Document"}
          url={message.metadata?.url}
        />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white">
          <User className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 animate-fade-up ${isUser ? "justify-end" : ""}`}>
      <div className={`flex flex-col gap-2 ${isUser ? "max-w-[68%]" : "max-w-[78%]"}`}>
        <div
          className={`text-[15px] leading-[1.65] ${
            isUser
              ? "rounded-2xl rounded-tr-md bg-qubi-purple px-5 py-3.5 text-white shadow-md shadow-purple-500/15"
              : "rounded-2xl rounded-tl-md border border-gray-100 bg-qubi-surface px-5 py-4 text-gray-800 shadow-bubble"
          }`}
        >
          {displayContent.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < displayContent.split("\n").length - 1 && <br />}
            </span>
          ))}
        </div>
        {!isUser && (
          <div className="flex items-center gap-1 px-1">
            <ActionButton onClick={onRegenerate} title="Regenerate">
              <RefreshCw className="h-3.5 w-3.5" />
            </ActionButton>
            <ActionButton
              onClick={() => navigator.clipboard.writeText(message.content)}
              title="Copy"
            >
              <Copy className="h-3.5 w-3.5" />
            </ActionButton>
            <ActionButton title="Good response">
              <ThumbsUp className="h-3.5 w-3.5" />
            </ActionButton>
            <ActionButton title="Bad response">
              <ThumbsDown className="h-3.5 w-3.5" />
            </ActionButton>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white">
          <User className="h-4 w-4 text-gray-500" />
        </div>
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
    >
      {children}
    </button>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex animate-fade-up">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-gray-100 bg-qubi-surface px-5 py-4 shadow-bubble">
        <div className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
        <div className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
        <div className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
      </div>
    </div>
  );
}
