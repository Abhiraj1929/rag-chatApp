"use client";

import { useChat } from "@/hooks/useChat";
import { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
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
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [inputValue]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const text = inputValue.trim();

    if (!text || isLoading) return;

    sendMessage({ text });
    setInputValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
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

  const renderAssistantText = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-lg font-semibold mt-5 mb-2 text-gray-100">
            {line.slice(3)}
          </h2>
        );
      }

      if (line.startsWith("### ")) {
        return (
          <h3
            key={i}
            className="text-base font-semibold mt-4 mb-1.5 text-gray-100"
          >
            {line.slice(4)}
          </h3>
        );
      }

      if (line.match(/^\d+\.\s/)) {
        return (
          <p key={i} className="font-medium my-1 text-gray-100">
            {line}
          </p>
        );
      }

      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <p
            key={i}
            className="pl-4 my-1 text-gray-300 before:content-['•'] before:mr-2 before:text-gray-500"
          >
            {line.slice(2)}
          </p>
        );
      }

      if (line.startsWith("---")) {
        return <hr key={i} className="my-4 border-white/10" />;
      }

      return (
        <p key={i} className="my-1.5 text-gray-300">
          {line || "\u00A0"}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#212121] w-full font-sans min-h-0">
      {/* ─── Messages area ─── */}
      <div className="flex-1 overflow-y-auto w-full flex flex-col items-center min-h-0">
        {messages.length === 0 ? (
          <div className="w-full max-w-3xl flex flex-col items-center justify-center h-full px-6 max-sm:px-4">
            {/* Welcome Icon */}
            <div className="w-14 h-14 max-sm:w-12 max-sm:h-12 rounded-full bg-[#2f2f2f] border border-white/10 flex items-center justify-center mb-6 max-sm:mb-4 shadow-lg">
              <Sparkles
                size={24}
                className="text-gray-300 max-sm:w-5 max-sm:h-5"
                strokeWidth={1.8}
              />
            </div>

            {/* Welcome Heading */}
            <h2 className="text-2xl max-sm:text-xl font-semibold text-gray-100 mb-2 text-center">
              How can I help you today?
            </h2>

            {/* Welcome Description */}
            <p className="text-[15px] max-sm:text-sm text-gray-400 max-w-md text-center leading-relaxed mb-8 max-sm:mb-6 max-sm:px-2">
              Upload your documents and I'll help you find insights, answer
              questions, and generate summaries.
            </p>

            {/* Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-sm:gap-2.5 max-w-2xl w-full">
              {[
                {
                  text: "Summarize my documents",
                  icon: "📄",
                },
                {
                  text: "Find key insights",
                  icon: "🔍",
                },
                {
                  text: "Compare sections",
                  icon: "⚖️",
                },
              ].map((s) => (
                <button
                  key={s.text}
                  onClick={() => setInputValue(s.text)}
                  className="flex items-center gap-3 px-4 py-3.5 max-sm:py-3 text-left text-sm font-medium text-gray-300 bg-[#2f2f2f] border border-white/5 rounded-2xl max-sm:rounded-xl hover:bg-[#383838] transition-all cursor-pointer"
                >
                  <span className="text-lg max-sm:text-base opacity-80 shrink-0">
                    {s.icon}
                  </span>

                  <span className="truncate">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl px-4 max-sm:px-3 py-8 max-sm:py-5 flex flex-col gap-8 max-sm:gap-6">
            {messages.map((message) => {
              const isUser = message.role === "user";
              const text = extractText(message);

              if (isUser) {
                return (
                  <div key={message.id} className="flex justify-end w-full">
                    <div className="bg-[#2f2f2f] text-gray-100 px-5 max-sm:px-4 py-3 max-sm:py-2.5 rounded-3xl max-sm:rounded-2xl max-w-[75%] max-sm:max-w-[88%] text-[15px] max-sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {text}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className="flex flex-col self-start w-full min-w-0"
                >
                  <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-p:my-1.5 prose-headings:text-gray-100 prose-strong:text-gray-100 prose-code:text-blue-400 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] max-sm:prose-code:text-[12px] prose-pre:bg-[#1a1a1a] prose-pre:text-gray-300 break-words">
                    {renderAssistantText(text)}
                  </div>

                  {text && (
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => copyMessage(message.id, text)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center gap-1.5 self-start mt-2">
                <span className="w-2 h-2 max-sm:w-1.5 max-sm:h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 max-sm:w-1.5 max-sm:h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 max-sm:w-1.5 max-sm:h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:300ms]" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="self-start w-full mt-2">
                <div className="flex items-center gap-3 max-sm:items-start bg-red-900/20 border border-red-500/20 rounded-2xl max-sm:rounded-xl px-4 max-sm:px-3.5 py-3 text-sm">
                  <AlertCircle
                    size={16}
                    className="text-red-400 shrink-0 max-sm:mt-0.5"
                  />

                  <span className="text-red-300 font-medium flex-1 min-w-0 break-words">
                    {error.message?.includes("429") ||
                    error.message?.includes("rate limit")
                      ? "Rate limit exceeded. Try again later."
                      : error.message || "Something went wrong"}
                  </span>

                  <button
                    onClick={() => regenerate()}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 underline shrink-0"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}
      </div>

      {/* ─── Input bar ─── */}
      <div className="shrink-0 w-full pt-4 max-sm:pt-2.5 pb-6 max-sm:pb-3 px-4 max-sm:px-3 bg-[#212121] flex flex-col items-center relative z-10">
        <form onSubmit={handleSubmit} className="w-full max-w-3xl relative">
          <div className="relative flex items-center w-full min-h-[52px] max-sm:min-h-[48px] pl-6 max-sm:pl-4 pr-2 max-sm:pr-1.5 py-2 max-sm:py-1.5 bg-[#2f2f2f] rounded-[26px] max-sm:rounded-[24px] border border-white/10 shadow-sm focus-within:bg-[#333333] transition-colors">
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
              className="flex-1 min-w-0 bg-transparent border-none outline-none focus:ring-0 text-gray-100 placeholder:text-gray-400 px-0 py-1.5 resize-none text-[15px] max-sm:text-sm leading-relaxed disabled:opacity-50 max-h-32 overflow-y-auto"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-white text-black hover:bg-gray-200 rounded-full w-8 h-8 max-sm:w-8 max-sm:h-8 flex items-center justify-center transition-colors disabled:bg-[#444] disabled:text-gray-500 disabled:cursor-not-allowed shrink-0 ml-3 max-sm:ml-2"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin text-gray-400" />
              ) : (
                <ArrowUp size={18} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-xs max-sm:text-[10px] text-gray-500 mt-3 max-sm:mt-2.5 text-center px-2 leading-relaxed">
          AI can make mistakes. Verify important information.
          <span className="max-sm:block sm:inline">
            <span className="sm:mx-1">Made by Abhiraj Kaushal</span>
          </span>
        </p>
      </div>
    </div>
  );
}
