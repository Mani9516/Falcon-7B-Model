import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qubi — AI Assistant",
  description: "Personal AI assistant powered by Ollama with RAG",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900">{children}</body>
    </html>
  );
}
