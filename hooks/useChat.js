"use client";

import { useState, useCallback, useRef } from "react";

export function useChat({ api = "/api/chat" } = {}) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("ready");
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(
    async ({ text }) => {
      if (!text?.trim()) return;

      const userMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStatus("submitted");
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...messages, userMsg] }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || `HTTP ${res.status}`);
        }

        setStatus("streaming");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                accumulated += text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: accumulated,
                  };
                  return updated;
                });
              } catch {}
            } else if (line.startsWith("3:")) {
              const errMsg = JSON.parse(line.slice(2));
              throw new Error(errMsg);
            }
          }
        }

        setStatus("ready");
      } catch (err) {
        if (err.name === "AbortError") {
          setStatus("ready");
          return;
        }
        console.error("Chat error:", err);
        setError(err);
        setStatus("error");
        setMessages((prev) => {
          const updated = [...prev];
          updated.pop();
          return updated;
        });
      } finally {
        abortRef.current = null;
      }
    },
    [api, messages]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStatus("ready");
  }, []);

  const regenerate = useCallback(() => {
    setMessages((prev) => prev.slice(0, -1));
    const lastUser = messages.filter((m) => m.role === "user").pop();
    if (lastUser) {
      setMessages((prev) => prev.slice(0, -1));
      sendMessage({ text: lastUser.content });
    }
  }, [messages, sendMessage]);

  return { messages, status, error, sendMessage, stop, regenerate };
}
