"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header, { WelcomeMessage } from "@/components/Header";
import InputBar from "@/components/InputBar";
import MessageBubble, { TypingIndicator } from "@/components/MessageBubble";
import Sidebar from "@/components/Sidebar";
import { api, type Chat, type HealthStatus, type Message } from "@/lib/api";

export default function HomePage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    api.listChats().then(setChats).catch(console.error);
    api.health().then(setHealth).catch(console.error);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadChat = useCallback(async (chatId: string) => {
    setActiveChatId(chatId);
    const msgs = await api.getMessages(chatId);
    setMessages(msgs);
  }, []);

  const handleNewChat = async () => {
    const chat = await api.createChat();
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
    setMessages([]);
  };

  const handleSend = async (content: string) => {
    setLoading(true);
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      chat_id: activeChatId || "",
      timestamp: new Date().toISOString(),
      type: "text",
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const response = await api.sendMessage(content, activeChatId || undefined);
      if (!activeChatId) {
        setActiveChatId(response.chat_id);
        const updatedChats = await api.listChats();
        setChats(updatedChats);
      }
      const msgs = await api.getMessages(response.chat_id);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong. Is the backend running on port 8000?",
          chat_id: activeChatId || "",
          timestamp: new Date().toISOString(),
          type: "text",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const result = await api.uploadFile(file, activeChatId || undefined);
      if (!activeChatId) {
        setActiveChatId(result.message.chat_id);
        const updatedChats = await api.listChats();
        setChats(updatedChats);
      }
      const msgs = await api.getMessages(result.message.chat_id);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = async (transcript: string, duration: string) => {
    setLoading(true);
    const voiceMsg: Message = {
      id: `voice-${Date.now()}`,
      role: "user",
      content: transcript,
      chat_id: activeChatId || "",
      timestamp: new Date().toISOString(),
      type: "voice",
      metadata: { duration },
    };
    setMessages((prev) => [...prev, voiceMsg]);

    try {
      const response = await api.sendMessage(transcript, activeChatId || undefined);
      if (!activeChatId) {
        setActiveChatId(response.chat_id);
        const updatedChats = await api.listChats();
        setChats(updatedChats);
      }
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    const prevChats = chats;
    const prevActiveId = activeChatId;
    const prevMessages = messages;

    // Remove from sidebar immediately
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }

    try {
      await api.deleteChat(chatId);
      const updated = await api.listChats();
      setChats(updated);
    } catch (err) {
      console.error(err);
      setChats(prevChats);
      setActiveChatId(prevActiveId);
      setMessages(prevMessages);
      alert("Could not delete chat. Please restart the backend and try again.");
    }
  };

  const handleRegenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) handleSend(lastUser.content);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 lg:p-6">
      <div className="flex h-[calc(100vh-2rem)] w-full max-w-app overflow-hidden rounded-2xl bg-white shadow-app lg:h-[calc(100vh-3rem)]">
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={loadChat}
          onDeleteChat={handleDeleteChat}
        />

        <main className="flex min-w-0 flex-1 flex-col bg-qubi-chat">
          <Header
            chatTitle={activeChat?.title}
            chatId={activeChatId}
            provider={health?.provider}
            model={health?.model}
            onDeleteChat={handleDeleteChat}
          />

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full max-w-chat flex-col gap-7 px-8 py-8">
              {messages.length === 0 ? (
                <WelcomeMessage onSuggestion={handleSend} />
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      onRegenerate={
                        msg.role === "assistant" ? handleRegenerate : undefined
                      }
                    />
                  ))}
                  {loading && <TypingIndicator />}
                </>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <InputBar
            onSend={handleSend}
            onUpload={handleUpload}
            onVoice={handleVoice}
            disabled={loading}
          />
        </main>
      </div>
    </div>
  );
}
