"use client";

import { MousePointer2, Circle, Pencil, RectangleHorizontal, Eraser, Type } from "lucide-react";
import { Tooltip } from "./ui/Tooltip";

export type Tool = "select" | "circle" | "rect" | "eraser" | "pencil" | "text";

interface ToolDockProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: "select", icon: <MousePointer2 className="w-5 h-5" />, label: "Select" },
  { id: "pencil", icon: <Pencil className="w-5 h-5" />, label: "Pencil" },
  { id: "rect", icon: <RectangleHorizontal className="w-5 h-5" />, label: "Rectangle" },
  { id: "circle", icon: <Circle className="w-5 h-5" />, label: "Circle" },
  { id: "text", icon: <Type className="w-5 h-5" />, label: "Text" },
  { id: "eraser", icon: <Eraser className="w-5 h-5" />, label: "Eraser" },
];

// Tool groups for visual separation
const toolGroups = [
  ["select"],
  ["pencil", "rect", "circle", "text"],
  ["eraser"],
];

export function ToolDock({ selectedTool, onToolSelect }: ToolDockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-1 px-3 py-2.5 bg-slate-900/90 backdrop-blur-lg border border-slate-700/50 rounded-full shadow-2xl shadow-black/60">
        {toolGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center">
            {/* Divider before group (except first) */}
            {groupIndex > 0 && (
              <div className="w-px h-6 bg-slate-700/50 mx-1.5" />
            )}
            
            {/* Tools in group */}
            {group.map((toolId) => {
              const tool = tools.find((t) => t.id === toolId);
              if (!tool) return null;
              
              const isSelected = selectedTool === tool.id;
              return (
                <Tooltip key={tool.id} content={tool.label} side="top">
                  <button
                    onClick={() => onToolSelect(tool.id)}
                    className={`
                      relative p-3 rounded-full transition-all duration-200
                      ${
                        isSelected
                          ? "bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                      }
                    `}
                  >
                    {tool.icon}
                    {isSelected && (
                      <div className="absolute inset-0 rounded-full ring-2 ring-violet-400/40 ring-offset-2 ring-offset-slate-900/90" />
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
