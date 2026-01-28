"use client";

import { useState, ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-1.5 text-sm font-medium text-white bg-slate-800 border border-slate-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none ${positionClasses[side]}`}
        >
          {content}
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-slate-800 border-slate-700 transform rotate-45 ${
              side === "top"
                ? "top-full left-1/2 -translate-x-1/2 -mt-1 border-r border-b"
                : side === "bottom"
                  ? "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l border-t"
                  : side === "left"
                    ? "left-full top-1/2 -translate-y-1/2 -ml-1 border-t border-r"
                    : "right-full top-1/2 -translate-y-1/2 -mr-1 border-b border-l"
            }`}
          />
        </div>
      )}
    </div>
  );
}
