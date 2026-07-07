import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qubi — AI Assistant",
  description: "Personal AI assistant powered by Ollama with RAG",
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
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
