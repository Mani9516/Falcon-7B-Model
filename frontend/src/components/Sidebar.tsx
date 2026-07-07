"use client";

import {
  Folder,
  Home,
  MessageSquare,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Logo from "@/components/Logo";
import type { Chat } from "@/lib/api";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

const PINNED_FOLDERS = ["General", "Design", "Management"];

function groupChatsByDate(chats: Chat[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; chats: Chat[] }[] = [
    { label: "Today", chats: [] },
    { label: "Yesterday", chats: [] },
    { label: "Earlier", chats: [] },
  ];

  for (const chat of chats) {
    const date = new Date(chat.updated_at);
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) {
      groups[0].chats.push(chat);
    } else if (date.getTime() === yesterday.getTime()) {
      groups[1].chats.push(chat);
    } else {
      groups[2].chats.push(chat);
    }
  }

  return groups.filter((g) => g.chats.length > 0);
}

export default function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: SidebarProps) {
  const grouped = groupChatsByDate(chats);

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-qubi-sidebarBorder bg-qubi-sidebar text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <Logo size={44} className="shadow-lg shadow-blue-500/20" />
        <div>
          <span className="text-lg font-semibold tracking-tight">Qubi</span>
          <p className="text-[11px] text-gray-500">AI Assistant</p>
        </div>
      </div>

      {/* New Chat */}
      <div className="px-4">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium transition hover:border-white/20 hover:bg-white/10"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Nav */}
      <nav className="mt-5 space-y-0.5 px-3">
        {[
          { icon: Search, label: "Search" },
          { icon: Home, label: "Home", active: true },
          { icon: MessageSquare, label: "Chats" },
        ].map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              active
                ? "bg-qubi-sidebarHover text-white"
                : "text-gray-400 hover:bg-qubi-sidebarHover hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Pinned Folders */}
      <div className="mt-7 px-6">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
          Pinned Folders
        </p>
        <div className="space-y-0.5">
          {PINNED_FOLDERS.map((folder) => (
            <button
              key={folder}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-400 transition hover:bg-qubi-sidebarHover hover:text-gray-200"
            >
              <Folder className="h-3.5 w-3.5 text-gray-500" />
              {folder}
            </button>
          ))}
        </div>
      </div>

      {/* Chat History */}
      <div className="sidebar-scroll mt-5 flex-1 overflow-y-auto px-3 pb-5">
        {grouped.length === 0 ? (
          <p className="px-3 py-2 text-xs text-gray-600">No conversations yet</p>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative flex w-full items-center rounded-xl transition ${
                      activeChatId === chat.id
                        ? "bg-qubi-sidebarHover"
                        : "hover:bg-qubi-sidebarHover"
                    }`}
                  >
                    {activeChatId === chat.id && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-qubi-purple" />
                    )}
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className={`flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left text-sm ${
                        activeChatId === chat.id
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-200"
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{chat.title}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${chat.title}"?`)) {
                          onDeleteChat(chat.id);
                        }
                      }}
                      title="Delete chat"
                      className={`mr-2 shrink-0 rounded-lg p-1.5 text-gray-500 transition hover:bg-red-500/20 hover:text-red-400 ${
                        activeChatId === chat.id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-qubi-sidebarBorder px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-700 text-xs font-semibold">
            U
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-200">You</p>
            <p className="text-xs text-gray-500">Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
