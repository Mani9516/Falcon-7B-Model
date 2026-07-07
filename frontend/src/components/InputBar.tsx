"use client";

import { ArrowRight, Mic, Paperclip } from "lucide-react";
import { useRef, useState } from "react";

interface InputBarProps {
  onSend: (text: string) => void;
  onUpload: (file: File) => void;
  onVoice: (text: string, duration: string) => void;
  disabled?: boolean;
}

export default function InputBar({
  onSend,
  onUpload,
  onVoice,
  disabled,
}: InputBarProps) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (recording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    setRecording(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      onVoice(transcript, formatDuration(elapsed));
      setRecording(false);
    };

    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognition.start();
  };

  return (
    <div className="shrink-0 bg-gradient-to-t from-white via-white to-transparent px-8 pb-6 pt-3">
      <div className="mx-auto max-w-chat">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-input">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.md,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            className="rounded-xl p-2.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your prompt here..."
            disabled={disabled}
            className="flex-1 bg-transparent px-1 text-[15px] text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
          />

          <button
            onClick={toggleVoice}
            disabled={disabled}
            className={`rounded-xl p-2.5 transition disabled:opacity-50 ${
              recording
                ? "recording-pulse bg-red-50 text-red-500"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
            title="Voice input"
          >
            <Mic className="h-5 w-5" />
          </button>

          <button
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-qubi-green text-white shadow-sm transition hover:bg-qubi-green-dark disabled:opacity-40"
            title="Send"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2.5 text-center text-xs text-gray-400">
          Qubi can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
