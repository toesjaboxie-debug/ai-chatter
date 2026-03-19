import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Chatter - Chat with AI using your own API key",
  description: "A modern chat application that lets you use your own OpenAI API key to chat with AI. Secure, private, and easy to use.",
  keywords: ["AI", "Chat", "OpenAI", "GPT", "API", "Next.js", "TypeScript"],
  authors: [{ name: "AI Chatter" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AI Chatter",
    description: "Chat with AI using your own API key",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chatter",
    description: "Chat with AI using your own API key",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
