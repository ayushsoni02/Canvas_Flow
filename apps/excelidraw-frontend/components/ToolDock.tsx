"use client";

import { Circle, Pencil, RectangleHorizontal } from "lucide-react";
import { Tooltip } from "./ui/Tooltip";

export type Tool = "circle" | "rect" | "pencil";

interface ToolDockProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: "pencil", icon: <Pencil className="w-5 h-5" />, label: "Pencil" },
  { id: "rect", icon: <RectangleHorizontal className="w-5 h-5" />, label: "Rectangle" },
  { id: "circle", icon: <Circle className="w-5 h-5" />, label: "Circle" },
];

export function ToolDock({ selectedTool, onToolSelect }: ToolDockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-1 px-2 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl shadow-black/50">
        {tools.map((tool) => {
          const isSelected = selectedTool === tool.id;
          return (
            <Tooltip key={tool.id} content={tool.label} side="top">
              <button
                onClick={() => onToolSelect(tool.id)}
                className={`
                  relative p-3 rounded-xl transition-all duration-200
                  ${
                    isSelected
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                  }
                `}
              >
                {tool.icon}
                {isSelected && (
                  <div className="absolute inset-0 rounded-xl ring-2 ring-violet-400/50 ring-offset-2 ring-offset-slate-900/80" />
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
