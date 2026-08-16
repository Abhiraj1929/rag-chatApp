"use client";

import { useChat } from "@/hooks/useChat";
import { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Bot,
  Loader2,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const { messages, sendMessage, status, error, regenerate } = useChat({
    api: "/api/chat",
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [inputValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const extractText = (msg) => {
    if (msg.content) return msg.content;
    if (msg.parts && Array.isArray(msg.parts)) {
      return msg.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("");
    }
    return "";
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ─── Messages area ─── */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* ── Empty state ── */
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/25">
              <Sparkles size={26} className="text-white" strokeWidth={1.8} />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              How can I help you today?
            </h2>
            <p className="text-[15px] text-slate-500 max-w-md text-center leading-relaxed mb-8">
              Upload your documents and I'll help you find insights, answer questions, and generate summaries.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full">
              {[
                { text: "Summarize my documents", icon: "📄" },
                { text: "Find key insights", icon: "🔍" },
                { text: "Compare sections", icon: "⚖️" },
              ].map((s) => (
                <button
                  key={s.text}
                  onClick={() => setInputValue(s.text)}
                  className="flex items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                >
                  <span className="text-lg">{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Message list ── */
          <div className="max-w-3xl mx-auto w-full">
            {messages.map((message) => {
              const isUser = message.role === "user";
              const text = extractText(message);
              return (
                <div key={message.id}>
                  {/* User message — flat, no bubble, slight bg */}
                  {isUser ? (
                    <div className="px-4 sm:px-6 py-5 bg-slate-50 border-b border-slate-100">
                      <div className="max-w-3xl mx-auto">
                        <p className="text-[15px] leading-relaxed text-slate-900 whitespace-pre-wrap">{text}</p>
                      </div>
                    </div>
                  ) : (
                    /* Assistant message — clean, white, with avatar */
                    <div className="px-4 sm:px-6 py-5">
                      <div className="max-w-3xl mx-auto flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mt-0.5">
                          <Bot size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0 group">
                          <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-pre:bg-slate-900 prose-pre:text-slate-100">
                            {text.split("\n").map((line, i) => {
                              if (line.startsWith("## ")) {
                                return <h2 key={i}>{line.slice(3)}</h2>;
                              }
                              if (line.startsWith("### ")) {
                                return <h3 key={i}>{line.slice(4)}</h3>;
                              }
                              if (line.match(/^\d+\.\s/)) {
                                return <p key={i} className="font-medium">{line}</p>;
                              }
                              if (line.startsWith("- ") || line.startsWith("• ")) {
                                return <p key={i} className="pl-4 before:content-['•'] before:mr-2 before:text-blue-400">{line.slice(2)}</p>;
                              }
                              if (line.startsWith("---")) {
                                return <hr key={i} className="my-3 border-slate-200" />;
                              }
                              return <p key={i}>{line || "\u00A0"}</p>;
                            })}
                          </div>
                          {/* Copy button */}
                          {text && (
                            <button
                              onClick={() => copyMessage(message.id, text)}
                              className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-600"
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check size={13} /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={13} /> Copy
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="px-4 sm:px-6 py-5">
                <div className="max-w-3xl mx-auto flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mt-0.5">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 pt-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-4 sm:px-6 py-3">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <span className="text-red-700 font-medium flex-1">
                      {error.message?.includes("429") ||
                      error.message?.includes("rate limit")
                        ? "Rate limit exceeded. Try again later."
                        : error.message || "Something went wrong"}
                    </span>
                    <button
                      onClick={() => regenerate()}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 underline"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ─── Input bar ─── */}
      <div className="shrink-0 w-full px-4 pb-6 pt-4 flex flex-col items-center bg-gradient-to-t from-white via-white to-transparent relative z-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl"
        >
          <div className="relative flex items-end border border-slate-300 rounded-3xl bg-white shadow-sm focus-within:border-slate-400 focus-within:shadow-md transition-all">
            <textarea
              ref={(el) => {
                textareaRef.current = el;
                inputRef.current = el;
              }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message RAG Chat..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent px-6 py-4 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 min-h-[56px]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-3 bottom-3 flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <ArrowUp size={18} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </form>
        <p className="text-[12px] text-slate-400 mt-3 text-center">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
