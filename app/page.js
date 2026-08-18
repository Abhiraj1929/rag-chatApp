"use client";

import { useState } from "react";
import { Bot, X, PanelRightOpen, PanelRightClose, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const ChatInterface = dynamic(() => import("@/components/ChatInterface"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#212121]">
      <Loader2 size={20} className="animate-spin text-gray-500" />
    </div>
  ),
});

const DocumentUploader = dynamic(
  () => import("@/components/DocumentUploader"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={20} className="animate-spin text-gray-500" />
      </div>
    ),
  },
);

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-[100dvh] min-h-screen bg-[#212121] text-gray-100 overflow-hidden">
      {/* Header */}
      <header className="relative z-30 min-h-[52px] sm:h-14 w-full bg-[#212121] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0">
        {/* Logo */}
        <div className="flex items-center min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
              <Bot
                size={17}
                className="text-white sm:w-[18px] sm:h-[18px]"
                strokeWidth={2.2}
              />
            </div>

            <span className="text-[15px] sm:text-base font-semibold text-gray-100 tracking-tight whitespace-nowrap">
              RAG Chat
            </span>
          </div>
        </div>

        {/* Documents Button */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="
            flex items-center justify-center gap-2
            h-10 sm:h-10
            px-3.5 sm:px-4
            text-[13px] sm:text-sm
            font-medium
            text-gray-300
            border border-white/10
            rounded-lg sm:rounded-xl
            hover:bg-white/10
            hover:border-white/20
            active:bg-white/15
            transition-all
            shrink-0
          "
        >
          {sidebarOpen ? (
            <>
              <PanelRightClose size={16} />
              <span>Hide Docs</span>
            </>
          ) : (
            <>
              <PanelRightOpen size={16} />
              <span>Show Docs</span>
            </>
          )}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Main Chat */}
        <main className="flex-1 min-w-0 min-h-0 overflow-hidden">
          <ChatInterface />
        </main>

        {/* Desktop Sidebar */}
        <aside
          className={`
            hidden lg:flex
            flex-col
            border-l border-white/10
            bg-[#1a1a1a]
            transition-all duration-300 ease-in-out
            overflow-hidden
            shrink-0
            ${sidebarOpen ? "w-80" : "w-0 border-l-0"}
          `}
        >
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />

            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Knowledge Base
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
            <DocumentUploader />
          </div>
        </aside>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div
            className="
              absolute
              top-0
              right-0
              h-full
              w-[88%]
              max-w-sm
              bg-[#1a1a1a]
              shadow-2xl
              flex flex-col
              animate-slide-in
            "
          >
            {/* Mobile Sidebar Header */}
            <div className="h-14 min-h-14 flex items-center justify-between px-4 sm:px-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />

                <span className="text-sm font-semibold text-gray-100 whitespace-nowrap">
                  Knowledge Base
                </span>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close documents"
                className="
                  flex items-center justify-center
                  w-9 h-9
                  rounded-lg
                  text-gray-400
                  hover:text-gray-200
                  hover:bg-white/10
                  active:bg-white/15
                  transition-colors
                  shrink-0
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* Documents */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-5">
              <DocumentUploader />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
