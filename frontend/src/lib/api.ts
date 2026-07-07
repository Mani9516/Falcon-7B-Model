const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  chat_id: string;
  timestamp: string;
  type: "text" | "file" | "voice";
  metadata?: {
    filename?: string;
    duration?: string;
    chunks_indexed?: number;
    url?: string;
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface HealthStatus {
  status: string;
  provider: string;
  model: string;
  llm_ready: boolean;
  ollama?: { running: boolean; models: string[]; model_ready?: boolean };
}

export const api = {
  health: () => request<HealthStatus>("/api/health"),

  listChats: () => request<Chat[]>("/api/chats"),

  createChat: (title = "New Chat") =>
    request<Chat>("/api/chats", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  getMessages: (chatId: string) =>
    request<Message[]>(`/api/chats/${chatId}/messages`),

  deleteChat: (chatId: string) =>
    request<{ ok: boolean; id: string }>(`/api/chats/${chatId}`, {
      method: "DELETE",
    }),

  sendMessage: (content: string, chatId?: string) =>
    request<Message>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ content, chat_id: chatId }),
    }),

  uploadFile: (file: File, chatId?: string) => {
    const form = new FormData();
    form.append("file", file);
    const params = chatId ? `?chat_id=${chatId}` : "";
    return request<{ message: Message; chunks_indexed: number; filename: string }>(
      `/api/upload${params}`,
      { method: "POST", body: form }
    );
  },
};
