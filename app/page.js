"use client";

import { useState } from "react";
import { Bot, X, PanelRightOpen, PanelRightClose } from "lucide-react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ChatInterface = dynamic(() => import("@/components/ChatInterface"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#212121]">
      <Loader2 size={20} className="animate-spin text-gray-500" />
    </div>
  ),
});

const DocumentUploader = dynamic(() => import("@/components/DocumentUploader"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={20} className="animate-spin text-gray-500" />
    </div>
  ),
});

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#212121] text-gray-100 overflow-hidden">

      {/* ─── Header ─── */}
      <header className="h-14 bg-[#212121] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Bot size={17} className="text-white" strokeWidth={2.2} />
            </div>
            <span className="text-[15px] font-semibold text-gray-100 tracking-tight">
              RAG Chat
            </span>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
        >
          {sidebarOpen ? (
            <>
              <PanelRightClose size={17} />
              <span className="hidden sm:inline">Hide Docs</span>
            </>
          ) : (
            <>
              <PanelRightOpen size={17} />
              <span className="hidden sm:inline">Show Docs</span>
            </>
          )}
        </button>
      </header>

      {/* ─── Body ─── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Main: Chat */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <ChatInterface />
        </div>

        {/* Desktop sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-l border-white/10 bg-[#1a1a1a] transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
            sidebarOpen ? "w-80" : "w-0 border-l-0"
          }`}
        >
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Knowledge Base
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <DocumentUploader />
          </div>
        </aside>
      </div>

      {/* ─── Mobile overlay ─── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="ml-auto relative w-full max-w-sm bg-[#1a1a1a] shadow-2xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-semibold text-gray-100">
                  Knowledge Base
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <DocumentUploader />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
