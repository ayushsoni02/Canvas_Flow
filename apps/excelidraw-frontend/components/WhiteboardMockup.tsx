"use client";

import { motion } from "framer-motion";
import { Circle, Square, Pencil, Type, Eraser, MousePointer2, Minus } from "lucide-react";

export function WhiteboardMockup() {
  const tools = [
    { icon: MousePointer2, label: "Select" },
    { icon: Square, label: "Rectangle" },
    { icon: Circle, label: "Circle" },
    { icon: Minus, label: "Line" },
    { icon: Pencil, label: "Pencil" },
    { icon: Type, label: "Text" },
    { icon: Eraser, label: "Eraser" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative max-w-5xl mx-auto mt-16 px-4"
    >
      {/* Outer glow */}
      <div className="absolute inset-0 bg-violet-500/10 rounded-2xl blur-3xl" />

      {/* Main container with gradient border */}
      <div className="relative border-gradient p-1 rounded-2xl glow-primary-sm">
        <div className="bg-slate-950 rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex items-center gap-1">
              {tools.map((tool, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg transition-colors ${
                    index === 4
                      ? "bg-violet-600 text-white"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <tool.icon className="w-4 h-4" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 text-xs text-slate-500 bg-slate-800/50 rounded-md border border-slate-700">
                Room: design-sprint
              </div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-violet-500 border-2 border-slate-950 flex items-center justify-center text-[10px] text-white font-medium">
                  AS
                </div>
                <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-slate-950 flex items-center justify-center text-[10px] text-white font-medium">
                  JD
                </div>
                <div className="w-6 h-6 rounded-full bg-pink-500 border-2 border-slate-950 flex items-center justify-center text-[10px] text-white font-medium">
                  +2
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="relative h-80 sm:h-96 bg-slate-950 bg-grid-pattern">
            {/* Sample shapes */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="absolute top-12 left-12 sm:left-24 w-32 h-24 rounded-xl border-2 border-violet-500 bg-violet-500/10"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="absolute top-20 right-12 sm:right-32 w-20 h-20 rounded-full border-2 border-indigo-500 bg-indigo-500/10"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              className="absolute bottom-16 left-1/3 w-40 h-16 rounded-lg border-2 border-pink-500 bg-pink-500/10"
            />
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                x1="156" y1="84" x2="calc(100% - 180)" y2="100"
                stroke="rgba(139, 92, 246, 0.5)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Cursor indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.2 }}
              className="absolute top-32 right-1/4"
            >
              <div className="flex items-start gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-indigo-500">
                  <path d="M0 0L6 16L8 10L16 8L0 0Z" fill="currentColor" />
                </svg>
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500 rounded text-white">John</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
