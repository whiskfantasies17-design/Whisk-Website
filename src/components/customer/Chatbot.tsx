"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Bonjour! Welcome to Whisk Fantasies. I am your couture cake assistant. Ask me about our location, delivery zones, or custom diet options!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg: Message = {
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      
      const botMsg: Message = {
        sender: "bot",
        text: data.reply || "Something went wrong.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const botMsg: Message = {
        sender: "bot",
        text: "Apologies, I am having trouble connecting to the kitchen right now. Please message us on WhatsApp!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl hover:scale-105 hover:bg-accent transition-all duration-300 relative border border-white/10"
        aria-label="Open AI Concierge Chat"
      >
        <MessageCircle size={24} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white shadow-sm border border-white">
          AI
        </span>
      </button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-white border border-primary/5 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-accent">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wide flex items-center gap-1">
                    AI Concierge
                    <Sparkles size={10} className="text-accent fill-accent animate-pulse" />
                  </h4>
                  <span className="text-[10px] text-white/60">Whisk Fantasies Bot</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/5">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-primary text-white rounded-tr-none shadow-sm"
                        : "bg-white border border-primary/5 text-primary rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-primary/45 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex flex-col max-w-[80%] mr-auto items-start animate-pulse">
                  <div className="rounded-2xl px-4 py-2 bg-white border border-primary/5 text-[10px] text-primary/50 font-semibold italic rounded-tl-none shadow-sm">
                    Concierge is thinking...
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Footer Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-primary/5 bg-white flex gap-2">
              <input
                type="text"
                placeholder="Ask our AI Concierge..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                className="flex-1 rounded-full border border-primary/10 bg-background px-4 py-2 text-xs text-primary focus:outline-none focus:border-accent disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white hover:bg-accent transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
